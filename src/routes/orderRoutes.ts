// routes/orderRoutes.ts
import express from "express";
import {
  createOrder, deleteOrder, deliverOrder, getOrderById, getOrders,
  sendPendingWhatsAppMessages, syncOrderStatus, traitOrder, updateOrder,
  getOrdersStats,  // 🆕
} from "../controllers/orderController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { auditLogger } from "../middlewares/auditLogger";
import { getDeposit } from "../controllers/cabupayPaymentController";

const router = express.Router();

// 🔓 Routes publiques
router.post("/", createOrder);

// 🔐 Routes spécifiques AVANT /:id
router.get("/stats", authMiddleware, getOrdersStats); // 🆕
router.get("/sync-status/:orderId", syncOrderStatus);
router.get("/whatsapp/send-pending", sendPendingWhatsAppMessages);

// 🔐 Routes protégées + auditées
router.get("/trait-order/:orderId", authMiddleware, auditLogger, traitOrder);
router.get("/deposit/:depositId", authMiddleware, auditLogger, getDeposit);
router.get("/deliver-order/:id", authMiddleware, auditLogger, deliverOrder);

// CRUD
router.get("/", getOrders);
router.get("/:id", getOrderById);       // ⚠️ en dernier
router.put("/:id", updateOrder);
router.delete("/:id", deleteOrder);

export default router;