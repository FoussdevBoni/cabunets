import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { createOffre, deleteOffre, getOffreById, getOffres, updateOffre } from '../controllers/offreController';



const router = express.Router();

// Routes pour les Companie
router.post('/', authMiddleware,  createOffre);
router.get('/',  getOffres);
router.get('/:id', getOffreById);

router.put('/:id',authMiddleware, updateOffre);
router.delete('/:id',authMiddleware, deleteOffre);

export default router;
