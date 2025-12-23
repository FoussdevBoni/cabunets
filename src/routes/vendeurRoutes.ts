import express from 'express';
import { updateUserData } from '../controllers/authController';
import { deleteVendeur, getVendeurById, getVendeurs, updateVendeur } from '../controllers/vendeurController';
import { authMiddleware } from '../middlewares/authMiddleware';



const router = express.Router();

// Routes pour les Companie
router.get('/',  getVendeurs);
router.get('/:id', getVendeurById);

router.put('/:id',authMiddleware, updateVendeur);
router.delete('/:id',authMiddleware, deleteVendeur);

export default router;
