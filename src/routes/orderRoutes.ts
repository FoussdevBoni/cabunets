import express from 'express';
import {
  createOrder, deleteOrder, deliverOrder, getOrderById, getOrders,
  sendPendingWhatsAppMessages, syncOrderStatus, traitOrder, updateOrder
} from '../controllers/orderController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { auditLogger } from '../middlewares/auditLogger';
import { getDeposit } from '../controllers/cabupayPaymentController';

const router = express.Router();

// 🔓 Routes publiques
router.post('/', createOrder);

router.get('/', getOrders);
router.get('/:id', getOrderById);
router.get('/sync-status/:orderId', syncOrderStatus);
router.get('/whatsapp/send-pending', sendPendingWhatsAppMessages);
router.put('/:id', updateOrder);
router.delete('/:id', deleteOrder);

// 🔐 Routes protégées + auditées
router.get('/trait-order/:orderId', authMiddleware, auditLogger, traitOrder);
router.get('/deposit/:depositId', authMiddleware, auditLogger, getDeposit);
router.get('/deliver-order/:id', authMiddleware, auditLogger, deliverOrder);

export default router;