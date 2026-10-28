import express from 'express';
import { deleteVendeur, getVendeurById, getVendeurs, updateVendeur } from '../../controllers/metier/vendeurController';
import { authMiddleware } from '../../middlewares/authMiddleware';



import { accountOwner } from "../../middlewares/accountOwner";
const router = express.Router();

// Routes pour les Companie
router.get('/',  getVendeurs);
router.get('/:id', getVendeurById);

router.put('/:id',authMiddleware, accountOwner, updateVendeur);
router.delete('/:id',authMiddleware, accountOwner, deleteVendeur);

export default router;
