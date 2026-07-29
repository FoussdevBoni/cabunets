import { Request, Response } from 'express';
import { cabupayPaymentService } from '../services/cabupayPaymentService';
import { cabupayWhatsappService } from '../services/cabupayWhatsappService';
import { Order } from '../models/Order';

/**
 * 1. Détection de l'opérateur (Correspondent) via le numéro de téléphone
 */
export const predictCorrespondent = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ success: false, error: 'Le champ phoneNumber est requis' });
    }

    const result = await cabupayPaymentService.predictCorrespondent(phoneNumber);
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('[Predict Correspondent Error]:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * 2. Réception du Webhook envoyé par Cabupay (Callback)
 */
export const handleCabupayWebhook = async (req: Request, res: Response): Promise<Response> => {
  try {
    const signatureHeader = req.headers['x-gateway-signature'] as string;
    const payload = cabupayPaymentService.handleWebhookNotification(req.body, signatureHeader);

    const { clientReference, depositId, status, providerTransactionId, failureReason } = payload;

    // 1. Récupération de la commande
    const order = await Order.findById(clientReference);

    if (!order) {
      console.error(`[Webhook Cabupay] Commande introuvable: ${clientReference}`);
      return res.status(404).json({ success: false, error: 'Commande introuvable' });
    }

    // 2. Traitement selon le statut du paiement
    if (status === 'COMPLETED' || status === 'SUCCESS') {
      // Protection anti-doublon (idempotence)
      if (order.status !== 'PAID' && order.status !== 'COMPLETED') {
        order.status = 'PAID';
        order.depositId = depositId || order.depositId;
        if (providerTransactionId) {
          order.providerTransactionId = providerTransactionId;
        }
        await order.save();

        console.log(`[Paiement Réussi] Commande #${order._id} mise à jour en PAID`);

        // Envoi exact de la notification WhatsApp
        cabupayWhatsappService
          .notifyNewOrder({
            vendeurName: order.vendeurName || 'Vendeur',
            vendeurPhone: order.vendeurPhone,
            orderRef: `CMD-${order._id.toString().slice(-6).toUpperCase()}`,
            network: order.network,
            units: order.units,
            price: order.price,
            currency: order.currency || 'FC',
            customerPhone: order.phoneNumber,
          })
          .catch((err) => {
            console.error(`[WhatsApp Error] Échec pour commande #${order._id}:`, err.message || err);
          });
      }
    } else if (status === 'FAILED' || status === 'CANCELLED') {
      if (order.status !== 'FAILED') {
        order.status = 'FAILED';
        order.failureReason = failureReason || 'Paiement échoué ou annulé';
        await order.save();

        console.warn(`[Paiement Échoué] Commande #${order._id} - Motif: ${order.failureReason}`);
      }
    }

    return res.status(200).json({ success: true, message: 'Notification reçue' });
  } catch (error: any) {
    console.error('[Cabupay Webhook Error]:', error.message);
    return res.status(400).json({ success: false, error: error.message });
  }
};

/**
 * 3. Vérification du statut d'une transaction (Appel direct par ton Frontend/Mobile)
 */
export const getPaymentStatus = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { referenceOrId } = req.params;

    if (!referenceOrId) {
      return res.status(400).json({ success: false, error: 'Le paramètre referenceOrId est requis' });
    }

    const transactionData = await cabupayPaymentService.getTransactionStatus(referenceOrId);
    return res.status(200).json({ success: true, data: transactionData });
  } catch (error: any) {
    console.error('[Get Payment Status Error]:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};