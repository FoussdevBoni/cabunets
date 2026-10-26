// routes/metier/rewardWithdrawalRoutes.ts
import { Router } from "express";
import {
  createWithdrawal,
  getMyWithdrawals,
  getWithdrawalById,
  listWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
  markWithdrawalAsPaid,
} from "../../controllers/metier/rewardWithdrawalController";
import { authMiddleware } from "../../middlewares/authMiddleware";

import { auditLogger } from "../../middlewares/auditLogger";
const router = Router();
router.use(auditLogger);

// ============================================================
// ROUTES AFFILIÉ
// ============================================================

// Demander un retrait
router.post("/", authMiddleware, createWithdrawal);

// Mes retraits
router.get("/me", authMiddleware, getMyWithdrawals);

// Détail d'un retrait (affilié = ses propres retraits, admin = tous)
router.get("/:withdrawalId", authMiddleware, getWithdrawalById);

// ============================================================
// ROUTES ADMIN
// ============================================================

// Lister tous les retraits
router.get("/", authMiddleware, listWithdrawals);

// Approuver
router.post("/:withdrawalId/approve", authMiddleware, approveWithdrawal);

// Rejeter
router.post("/:withdrawalId/reject", authMiddleware, rejectWithdrawal);

// Marquer comme payé
router.post("/:withdrawalId/paid", authMiddleware, markWithdrawalAsPaid);

export default router;