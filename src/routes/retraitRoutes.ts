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
} from '../controllers/retraitController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getRetraits);
router.get('/today', getTodayRetraits);
router.get('/stats', getRetraitsStats);
router.get('/:id', getRetraitById);

router.post('/', createRetrait);
router.post('/delete-many', deleteManyRetraits);

router.put('/:id', updateRetrait);
router.put('/:id/validate', validateRetrait);
router.put('/:id/reject', rejectRetrait);

router.delete('/:id', deleteRetrait);

export default router;