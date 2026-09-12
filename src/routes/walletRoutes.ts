// routes/walletRoutes.ts
import express from "express";
import {
  getWallet,
  checkRetrait,
  getAllWallets,
  getCabunetWallet
} from "../controllers/walletController";

const router = express.Router();

// ✅ Route spécifique d'abord
router.get("/all", getAllWallets);
router.get("/cabunet", getCabunetWallet);

// ✅ Route dynamique après
router.get("/:vendeurId", getWallet);
router.post("/:vendeurId/check-retrait", checkRetrait);

export default router;