// routes/orderRoutes.ts
import express from "express";
import {
  createOrder, deleteOrder, deliverOrder, getOrderById, getOrders,
  sendPendingWhatsAppMessages, syncOrderStatus, traitOrder, updateOrder,
  getOrdersStats,  // 🆕
} from "../../controllers/metier/orderController";
import { authMiddleware } from "../../middlewares/authMiddleware";
import { adminOnly } from "../../middlewares/adminOnly";
import { auditLogger } from "../../middlewares/auditLogger";
import { getDeposit } from "../../controllers/utilitaires/cabupayPaymentController";

const router = express.Router();

// 🔓 Routes publiques
router.post("/", (req, res, next) => req.headers.authorization ? authMiddleware(req, res, next) : next(), createOrder);

// 🔐 Routes spécifiques AVANT /:id
router.get("/stats", authMiddleware, getOrdersStats); // 🆕
router.get("/sync-status/:orderId", syncOrderStatus);
router.get("/whatsapp/send-pending", authMiddleware, adminOnly, sendPendingWhatsAppMessages);

// 🔐 Routes protégées + auditées
router.get("/trait-order/:orderId", authMiddleware, auditLogger, traitOrder);
router.get("/deposit/:depositId", authMiddleware, auditLogger, getDeposit);
router.get("/deliver-order/:id", authMiddleware, auditLogger, deliverOrder);

// CRUD
router.get("/", getOrders);
router.get("/:id", getOrderById);       // ⚠️ en dernier
router.put("/:id", authMiddleware, adminOnly, auditLogger, updateOrder);
router.delete("/:id", authMiddleware, adminOnly, auditLogger, deleteOrder);

export default router;