// routes/settingsRoutes.ts
import express from "express";
import {
  getSettings,
  updateCommission,
  updateExchangeRate,
  updateDefaultCurrency,
  updateWithdrawalLimits
} from "../../controllers/metier/settingsController";

import { authMiddleware } from "../../middlewares/authMiddleware";
import { adminOnly } from "../../middlewares/adminOnly";
const router = express.Router();
router.use((req, res, next) => req.method === "GET" ? next() : authMiddleware(req, res, () => adminOnly(req, res, next)));

router.get("/", getSettings);
router.put("/commission", updateCommission);
router.put("/rates", updateExchangeRate);
router.put("/currency", updateDefaultCurrency);
router.put("/limits", updateWithdrawalLimits);

export default router;