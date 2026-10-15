// routes/metier/commissionRoutes.ts
import { Router } from "express";
import {
  getMyCommissions,
  getMyBalance,
  getMyHistory,
  validateCommission,
  cancelCommission,
  listCommissions,
  processDueCommissions,
} from "../../controllers/metier/commissionController";
import { authMiddleware } from "../../middlewares/authMiddleware";

const router = Router();

// ============================================================
// ROUTES AFFILIÉ
// ============================================================

// Mes commissions
router.get("/me", authMiddleware, getMyCommissions);

// Mon solde
router.get("/me/balance", authMiddleware, getMyBalance);

// Mon historique de mouvements (ledger)
router.get("/me/history", authMiddleware, getMyHistory);

// ============================================================
// ROUTES ADMIN
// ============================================================

// Lister toutes les commissions
router.get("/", authMiddleware, listCommissions);

// Traiter les commissions arrivées à échéance
router.post("/process-due", authMiddleware, processDueCommissions);

// Valider une commission
router.post("/:commissionId/validate", authMiddleware, validateCommission);

// Annuler une commission
router.post("/:commissionId/cancel", authMiddleware, cancelCommission);

export default router;