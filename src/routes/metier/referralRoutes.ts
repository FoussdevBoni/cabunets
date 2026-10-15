// routes/metier/referralRoutes.ts
import { Router } from "express";
import {
  getMesFilleuls,
  getMesStats,
  getMonParrain,
  getReferralById,
} from "../../controllers/metier/referralController";
import { authMiddleware } from "../../middlewares/authMiddleware";

const router = Router();

// ============================================================
// ROUTES AFFILIÉ
// ============================================================

// Mes filleuls (pagination + filtre type)
router.get("/mes-filleuls", authMiddleware, getMesFilleuls);

// Mes stats (total, clients, vendeurs)
router.get("/mes-stats", authMiddleware, getMesStats);

// Qui m'a parrainé ?
router.get("/mon-parrain", authMiddleware, getMonParrain);

// ============================================================
// ROUTES ADMIN
// ============================================================

// Détail d'un referral
router.get("/:id", authMiddleware, getReferralById);

export default router;