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
export const handleCabupayWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const signatureHeader = req.headers['x-gateway-signature'] as string;

    // Extraction et vérification de la signature
    const payload = cabupayPaymentService.handleWebhookNotification(req.body, signatureHeader);
    const { clientReference, depositId, status, providerTransactionId, failureReason } = payload;

    // 1. Récupération de la commande
    const order = await Order.findById(clientReference);

    if (!order) {
      console.error(`[Webhook Cabupay] Commande introuvable: ${clientReference}`);
      // On répond 200 à PawaPay/Cabupay pour stopper les retries
      res.status(200).json({ success: false, message: 'Commande introuvable' });
      return;
    }

    // 2. Protection d'idempotence STRICTE PawaPay : COMPLETED ou FAILED
    const FINAL_STATUSES = ['COMPLETED', 'FAILED'];
    if (FINAL_STATUSES.includes(order.status)) {
      console.log(`[Webhook Cabupay] Commande #${order._id} déjà en statut final (${order.status}). Ignoré.`);
      res.status(200).json({ success: true, message: 'Notification déjà traitée' });
      return;
    }

    console.log(status)

    // 3. Traitement selon les SEULS statuts valides PawaPay Deposit
    if (status === 'COMPLETED') {
      order.status = 'COMPLETED';
      order.depositId = depositId || order.depositId;
      if (providerTransactionId) {
        order.providerTransactionId = providerTransactionId;
      }
      await order.save();

      console.log(`[Paiement Réussi] Commande #${order._id} mise à jour en COMPLETED`);

      // Envoi de la notification WhatsApp
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

    } else if (status === 'FAILED') {
      order.status = 'FAILED';

      if (failureReason) {
        if (typeof failureReason === 'object' && failureReason !== null && 'failureMessage' in failureReason) {
          const code = (failureReason as any).failureCode || 'FAILED';
          const msg = (failureReason as any).failureMessage;
          order.failureReason = `${code}: ${msg}`;
        } else {
          order.failureReason = typeof failureReason === 'string'
            ? failureReason
            : JSON.stringify(failureReason);
        }
      } else {
        order.failureReason = 'Paiement échoué';
      }

      await order.save();
      console.warn(`[Paiement Échoué] Commande #${order._id} - Motif: ${order.failureReason}`);
    }

    res.status(200).json({ success: true, message: 'Notification traitée' });
  } catch (error: any) {
    console.error('[Cabupay Webhook Error]:', error.message || error);
    res.status(400).json({ success: false, error: error.message || 'Erreur lors du traitement' });
  }
};

/**
 * 3. Vérification du statut d'une transaction (Appel direct par le Frontend/Mobile)
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


/**
 * 3. Vérification du statut d'une transaction (Appel direct par le Frontend/Mobile)
 */
export const getDeposit = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { depositId } = req.params;

    if (!depositId) {
      return res.status(400).json({ success: false, error: 'Le paramètre depositId est requis' });
    }

    const transactionData = await cabupayPaymentService.getDeposit(depositId);
    return res.status(200).json({ success: true, data: transactionData });
  } catch (error: any) {
    console.error('[Get Payment Status Error]:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};