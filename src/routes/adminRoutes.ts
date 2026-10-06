// routes/admin.routes.ts
import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { adminOnly } from "../middlewares/adminOnly";
import { auditLogger } from "../middlewares/auditLogger";
import {
  manageUser,
  stopManaging,
  getManagedUser,
} from "../controllers/adminController";

const router = express.Router();

// Toutes les routes admin sont protégées + auditées
router.use(authMiddleware);
router.use(auditLogger);

// ⚠️ adminOnly doit autoriser un admin EN impersonation (pour pouvoir stop)
router.post("/manage/stop" ,adminOnly, stopManaging);  
router.post("/manage/:userId", adminOnly, manageUser);
router.get("/manage/current", getManagedUser);

export default router;