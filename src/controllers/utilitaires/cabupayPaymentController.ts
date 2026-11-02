import { Request, Response } from 'express';
import { cabupayPaymentService } from '../../services/providers/cabupayPaymentService';
import { applyOrderPayment } from "../../services/metier/orderPaymentLifecycle";
import { Order } from '../../models/Order';

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

    if (!["COMPLETED", "FAILED"].includes(status)) {
      res.status(400).json({ success: false, error: "Statut de paiement invalide." }); return;
    }
    const existing = await Order.findById(clientReference);
    if (!existing) { res.status(200).json({ success: false, message: "Commande introuvable" }); return; }
    await applyOrderPayment(clientReference, status, { depositId, providerTransactionId, failureReason });
    res.status(200).json({ success: true, message: 'Notification traitée' });
  } catch (error: any) {
    console.error('[Cabupay Webhook Error]:', error.message || error);
    res.status(error.statusCode ?? 400).json({ success: false, error: error.message || 'Erreur lors du traitement' });
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

    const deposit = await cabupayPaymentService.getDeposit(depositId);
    return res.status(200).json({ success: true, data: deposit });
  } catch (error: any) {
    console.error('[Get Payment Status Error]:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};