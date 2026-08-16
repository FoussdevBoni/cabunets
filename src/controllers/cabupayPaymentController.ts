import { Request, Response } from 'express';
import { cabupayPaymentService } from '../services/cabupayPaymentService';
import { Order } from '../models/Order';
import { orderNotificationService } from '../services/orderNotificationService';

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
 * 2. Réception du Webhook envoyé par Cabupay / PawaPay (Callback)
 * Note : PawaPay n'envoie les webhooks que pour les statuts finaux (COMPLETED et FAILED).
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
      res.status(200).json({ success: false, message: 'Commande introuvable' });
      return;
    }

    // 2. Idempotence : Si déjà en statut final, on ne retraite pas
    const FINAL_STATUSES = ['COMPLETED', 'FAILED', 'DELIVERED'];
    if (FINAL_STATUSES.includes(order.status) && order.depositId === depositId) {
      console.log(`[Webhook Cabupay] Commande #${order._id} déjà en statut final (${order.status}). Ignoré.`);
      res.status(200).json({ success: true, message: 'Notification déjà traitée' });
      return;
    }

    // Le webhook confirme l'existence effective de la transaction chez PawaPay
    order.depositExistence = 'FOUND';
    if (depositId) {
      order.depositId = depositId;
    }

    // 3. Traitement des statuts finaux PawaPay
    if (status === 'COMPLETED') {
      order.status = 'COMPLETED';
      if (providerTransactionId) {
        order.providerTransactionId = providerTransactionId;
      }

      // Sauvegarder avant l'envoi de la notification
      await order.save();

      // ✅ Envoi de la notification WhatsApp via le service atomique
      try {
        const result = await orderNotificationService.sendOrderNotification(order._id.toString());
        
        if (result.success) {
          console.log(`[WhatsApp] Notification envoyée avec succès pour la commande #${order._id}`);
        } else {
          console.log(`[WhatsApp] Notification non envoyée pour #${order._id}: ${result.reason}`);
        }
      } catch (whatsappError: any) {
        console.error(`[WhatsApp Error] Échec pour commande #${order._id}:`, whatsappError.message || whatsappError);
      }

      console.log(`[Paiement Réussi] Commande #${order._id} mise à jour en COMPLETED`);

    } else if (status === 'FAILED') {
      order.status = 'FAILED';

      console.log("[handleCabupayWebhook]: failureReason", failureReason);

      if (failureReason) {
        if (typeof failureReason === 'object' && failureReason !== null && 'failureMessage' in failureReason) {
          const code = (failureReason as any).failureCode || 'FAILED';
          const msg = (failureReason as any).failureMessage;
          order.failureReason = `${code}: ${msg}`;
          order.failureCode = code;
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
 * 4. Récupération d'un dépôt par son ID
 */
export const getDeposit = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { depositId } = req.params;

    if (!depositId) {
      return res.status(400).json({ success: false, error: 'Le paramètre depositId est requis' });
    }

    const deposit = await cabupayPaymentService.getDeposit(depositId);
    return res.status(200).json({ success: true, data: deposit });
  } catch (error: any) {
    console.error('[Get Deposit Error]:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};