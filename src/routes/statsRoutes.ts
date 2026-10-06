// routes/stats.routes.ts
import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { adminOnly } from "../middlewares/adminOnly";
import { auditLogger } from "../middlewares/auditLogger";
import {
  getAdminOverview,
  getVendeurOverview,
} from "../controllers/statsController";

const router = express.Router();

// 🔐 Admin uniquement
router.get(
  "/admin-overview",
  authMiddleware,
  adminOnly,
  auditLogger,
  getAdminOverview
);

// 🔐 Vendeur connecté (impersonation-safe via req.user.userId)
router.get(
  "/vendeur-overview",
  authMiddleware,
  auditLogger,
  getVendeurOverview
);

export default router;