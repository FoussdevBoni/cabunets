// routes/walletRoutes.ts
import express from "express";
import {
  getWallet,
  checkRetrait,
  getAllWallets,
  getCabunetWallet,
  getPawaPayBalances,
  getPawaPayBalancesByCountry,
  getPawaPayBalanceByCurrency,
} from "../controllers/walletController";

const router = express.Router();

// ✅ Routes spécifiques d'abord
router.get("/all", getAllWallets);
router.get("/cabunet", getCabunetWallet);

// ✅ Soldes PawaPay
router.get("/pawapay/balances", getPawaPayBalances);
router.get("/pawapay/balances/:country", getPawaPayBalancesByCountry);
router.get("/pawapay/balances/:country/:currency", getPawaPayBalanceByCurrency);

// ✅ Route dynamique après
router.get("/:vendeurId", getWallet);
router.post("/:vendeurId/check-retrait", checkRetrait);

export default router;