// routes/retraitRoutes.ts
import express from 'express';
import {
  createRetrait,
  getRetraits,
  getRetraitById,
  updateRetrait,
  deleteRetrait,
  deleteManyRetraits,
  validateRetrait,
  rejectRetrait,
  getTodayRetraits,
  getRetraitsStats,
  createRetraitCabunet,
  handlePayoutWebhook,
  resendPayoutCallback,
  getPayout,
  getPayoutDirect,
} from '../controllers/retraitController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { auditLogger } from '../middlewares/auditLogger';

const router = express.Router();

// 🔓 Webhook public (PAS d'auth, PAS d'audit user)
router.post('/cabupay-callback', handlePayoutWebhook);

// 🔐 Tout le reste est protégé + audité
router.use(authMiddleware);
router.use(auditLogger);

// Routes spécifiques d'abord
router.get('/today', getTodayRetraits);
router.get('/stats', getRetraitsStats);
router.get('/payout/direct/:payoutId', getPayoutDirect);
router.get('/payout/:referenceOrId', getPayout);

router.get('/', getRetraits);

router.post('/', createRetrait);
router.post('/resend-callback', resendPayoutCallback);
router.post('/retirer-commission', createRetraitCabunet);
router.post('/delete-many', deleteManyRetraits);

router.get('/:id', getRetraitById);
router.put('/:id', updateRetrait);
router.put('/:id/validate', validateRetrait);
router.put('/:id/reject', rejectRetrait);
router.delete('/:id', deleteRetrait);

export default router;