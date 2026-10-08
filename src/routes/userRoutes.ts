// routes/user.routes.ts
import express from "express";
import {
  deleteUser,
  getUserById,
  getUsers,
  getUsersStats,
  verifyUser,
  toggleUserStatus,
} from "../controllers/userController";
import { updateUser } from "../controllers/authController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { adminOnly } from "../middlewares/adminOnly";
import { auditLogger } from "../middlewares/auditLogger";

const router = express.Router();

// 🔐 Toutes les routes sont admin-only
router.use(authMiddleware);
router.use(adminOnly);

// Routes spécifiques AVANT /:id
router.get("/stats", getUsersStats);

// CRUD
router.get("/", getUsers);
router.get("/:id", getUserById);

router.put("/:id", auditLogger, updateUser);
router.patch("/:id/verify", auditLogger, verifyUser);
router.patch("/:id/toggle-status", auditLogger, toggleUserStatus);
router.delete("/:id", auditLogger, deleteUser);

export default router;