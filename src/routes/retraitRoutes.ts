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
  getPayoutDirect as getPayoutDirectHandler
} from '../controllers/retraitController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/cabupay-callback', handlePayoutWebhook);

router.use(authMiddleware);

router.get('/', getRetraits);
router.get('/today', getTodayRetraits);
router.get('/stats', getRetraitsStats);

// Routes payout (à placer AVANT /:id pour éviter les conflits)
router.get('/payout/direct/:payoutId', getPayoutDirect);
router.get('/payout/:referenceOrId', getPayout);

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