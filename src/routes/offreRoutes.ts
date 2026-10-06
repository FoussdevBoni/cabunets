import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { auditLogger } from '../middlewares/auditLogger';
import {
    createOffre, deleteOffre, getOffreById, getOffres, updateOffre
} from '../controllers/offreController';

const router = express.Router();

// 🔐 Routes protégées + auditées
router.post('/', authMiddleware, auditLogger, createOffre);
router.put('/:id', authMiddleware, auditLogger, updateOffre);
router.delete('/:id', authMiddleware, auditLogger, deleteOffre);

// 🔓 Routes publiques (pas d'auth, pas d'audit)
router.get('/', getOffres);
router.get('/:id', getOffreById);

export default router;