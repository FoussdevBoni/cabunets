// routes/reclamationRoutes.ts
import express from 'express';
import {
  createReclamation,
  getReclamations,
  getReclamationById,
  updateReclamation,
  deleteReclamation,
  deleteManyReclamations,
  updateReclamationStatut,
  getTodayReclamations,
  getReclamationsStats,
} from '../controllers/reclamationController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

router.use(authMiddleware);

router.get('/', getReclamations);
router.get('/today', getTodayReclamations);
router.get('/stats', getReclamationsStats);
router.get('/:id', getReclamationById);

router.post('/', createReclamation);
router.post('/delete-many', deleteManyReclamations);

router.put('/:id', updateReclamation);
router.put('/:id/statut', updateReclamationStatut);

router.delete('/:id', deleteReclamation);

export default router;