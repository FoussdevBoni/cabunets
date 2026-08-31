// routes/walletRoutes.ts
import express from "express";
import {
  getWallet,
  checkRetrait,
  getAllWallets
} from "../controllers/walletController";

const router = express.Router();

// ✅ Route spécifique d'abord
router.get("/all", getAllWallets);

// ✅ Route dynamique après
router.get("/:vendeurId", getWallet);
router.post("/:vendeurId/check-retrait", checkRetrait);

export default router;