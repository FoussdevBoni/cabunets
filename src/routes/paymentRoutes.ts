import { Router } from 'express';
import { 
  handleCabupayWebhook, 
  getPaymentStatus, 
  predictCorrespondent, 
  getDeposit
} from '../controllers/cabupayPaymentController';

const router = Router();

// Détection de l'opérateur (Mobile Money)
router.post('/predict-correspondent', predictCorrespondent);

// Webhook / Callback Cabupay
router.post('/cabupay-callback', handleCabupayWebhook);

// Vérification du statut d'un paiement
router.get('/payment-status/:referenceOrId', getPaymentStatus);
router.get('/deposit/:depositId', getDeposit);


export default router;