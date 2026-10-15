// routes/metier/affiliateRoutes.ts
import { Router } from "express";
import {
  devenirAffilie,
  getMonProfil,
  verifierTelephone,
  activerAffilie,
  suspendreAffilie,
  reactiverAffilie,
  listerAffilies,
} from "../../controllers/metier/affiliateController";
import { authMiddleware } from "../../middlewares/authMiddleware";

const router = Router();

// ============================================================
// ROUTES AFFILIÉ
// ============================================================

router.post("/devenir", authMiddleware, devenirAffilie);
router.get("/me", authMiddleware, getMonProfil);
router.post("/verifier-telephone", authMiddleware, verifierTelephone);

// ============================================================
// ROUTES ADMIN
// ============================================================

router.get("/", authMiddleware, listerAffilies);
router.post("/:userId/activer", authMiddleware, activerAffilie);
router.post("/:userId/suspendre", authMiddleware, suspendreAffilie);
router.post("/:userId/reactiver", authMiddleware, reactiverAffilie);

export default router;