import { Router } from 'express';
import { 
  handleCabupayWebhook, 
  getPaymentStatus, 
  predictCorrespondent 
} from '../controllers/cabupayPaymentController';

const router = Router();

// Détection de l'opérateur (Mobile Money)
router.post('/predict-correspondent', predictCorrespondent);

// Webhook / Callback Cabupay
router.post('/cabupay-callback', handleCabupayWebhook);

// Vérification du statut d'un paiement
router.get('/payment-status/:referenceOrId', getPaymentStatus);

export default router;