// routes/settingsRoutes.ts
import express from "express";
import {
  getSettings,
  updateCommission,
  updateExchangeRate,
  updateDefaultCurrency,
  updateWithdrawalLimits
} from "../controllers/settingsController";

const router = express.Router();

router.get("/", getSettings);
router.put("/commission", updateCommission);
router.put("/rates", updateExchangeRate);
router.put("/currency", updateDefaultCurrency);
router.put("/limits", updateWithdrawalLimits);

export default router;