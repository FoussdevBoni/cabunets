import affiliateAdminRoutes from "./metier/affiliateAdminRoutes";
import rewardRuleRoutes from "./metier/rewardRuleRoutes";
// routes/index.ts
import { Router } from "express";

import userRoutes from "./metier/userRoutes";
import authRoute from "./metier/authRoutes";
import offreRoutes from "./metier/offreRoutes";
import vendeurRoutes from "./metier/vendeurRoutes";
import orderRoutes from "./metier/orderRoutes";
import paymentRoutes from "./metier/paymentRoutes";
import retraitRoutes from "./metier/retraitRoutes";
import reclamationRoutes from "./metier/reclamationRoutes";
import walletRoutes from "./metier/walletRoutes";
import settingsRoutes from "./metier/settingsRoutes";
import adminRoutes from "./metier/adminRoutes";
import statsRoutes from "./metier/statsRoutes";
import affiliateRoutes from "./metier/affiliateRoutes";
import referralRoutes from "./metier/referralRoutes";
import commissionRoutes from "./metier/commissionRoutes";
import rewardWithdrawalRoutes from "./metier/rewardWithdrawalRoutes"; // 🆕

import uploadRoutes from "./utilitaires/uploadRoutes";
import notificationRoutes from "./utilitaires/notificationRoutes";

const router = Router();

// Métier
router.use("/auth", authRoute);
router.use("/users", userRoutes);
router.use("/vendeurs", vendeurRoutes);
router.use("/offres", offreRoutes);
router.use("/orders", orderRoutes);
router.use("/payments", paymentRoutes);
router.use("/retraits", retraitRoutes);
router.use("/reclamations", reclamationRoutes);
router.use("/settings", settingsRoutes);
router.use("/wallet", walletRoutes);
router.use("/admin", adminRoutes);
router.use("/affiliate-admin", affiliateAdminRoutes);
router.use("/stats", statsRoutes);
router.use("/commissions", commissionRoutes);
router.use("/reward-rules", rewardRuleRoutes);
router.use("/affiliates", affiliateRoutes);
router.use("/referrals", referralRoutes);
router.use("/reward-withdrawals", rewardWithdrawalRoutes);

// Utilitaires
router.use("/upload", uploadRoutes);
router.use("/notifications", notificationRoutes);

export default router;