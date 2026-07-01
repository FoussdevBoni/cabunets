import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { createOrder, deleteOrder, getOrderById, getOrders, updateOrder } from '../controllers/orderController';



const router = express.Router();

// Routes pour les Companie
router.post('/',  createOrder);

router.get('/',   getOrders);
router.get('/:id', getOrderById);

router.put('/:id', updateOrder);
router.delete('/:id', deleteOrder);

export default router;
