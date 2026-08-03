import express from 'express';
import { createOrder, deleteOrder, deliverOrder, getOrderById, getOrders, sendPendingWhatsAppMessages, syncOrderStatus, traitOrder, updateOrder } from '../controllers/orderController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { getDeposit } from '../controllers/cabupayPaymentController';



const router = express.Router();

// Routes pour les Companie
router.post('/',  createOrder);

router.get('/',   getOrders);
router.get('/:id', getOrderById);
router.get('/sync-status/:orderId', syncOrderStatus);
router.get('/trait-order/:orderId', authMiddleware, traitOrder);
router.get('/deposit/:depositId', authMiddleware, getDeposit);
router.get('/deliver-order/:id', authMiddleware, deliverOrder);
router.get('/whatsapp/send-pending', sendPendingWhatsAppMessages);
router.put('/:id', updateOrder);
router.delete('/:id', deleteOrder);

export default router;
