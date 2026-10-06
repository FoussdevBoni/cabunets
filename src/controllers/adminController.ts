// controllers/adminController.ts
import { Request, Response } from "express";
import { adminService } from "../services/adminService";

/**
 * POST /admin/manage/:userId
 * Active l'impersonation : l'admin agit en tant que :userId
 * Body optionnel : { durationMinutes?: number }
 */
export const manageUser = async (req: Request, res: Response) => {
    try {
        // ⚠️ Toujours prendre adminId côté serveur (jamais du body)
        const adminId = req.user?.impersonatedBy?.adminId ?? req.user?.userId;

        if (!adminId) {
            return res.status(401).json({ message: "Admin non identifié." });
        }

        const { userId } = req.params;
        const { durationMinutes } = req.body ?? {};

        if (!userId) {
            return res.status(400).json({ message: "userId requis." });
        }

        const result = await adminService.manageUser(
            adminId,
            userId,
            typeof durationMinutes === "number" ? durationMinutes : null
        );

        return res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
        console.error("adminController.manageUser error:", err);
        return res.status(500).json({ message: "Erreur serveur." });
    }
};

/**
 * POST /admin/manage/stop
 * Désactive l'impersonation pour cet admin.
 */
export const stopManaging = async (req: Request, res: Response) => {
    try {
        const adminId = req.user?.impersonatedBy?.adminId ?? req.user?.userId;

        if (!adminId) {
            return res.status(401).json({ message: "Admin non identifié." });
        }

        const result = await adminService.stopManaging(adminId);
        return res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
        console.error("adminController.stopManaging error:", err);
        return res.status(500).json({ message: "Erreur serveur." });
    }
};

/**
 * GET /admin/manage/current
 * Renvoie l'utilisateur actuellement managé (ou null).
 */
export const getManagedUser = async (req: Request, res: Response) => {
    try {
        const adminId = req.user?.impersonatedBy?.adminId ?? req.user?.userId;

        if (!adminId) {
            return res.status(401).json({ message: "Admin non identifié." });
        }

        const managed = await adminService.getManagedUser(adminId);

        return res.status(200).json({ managed });
    } catch (err) {
        console.error("adminController.getManagedUser error:", err);
        return res.status(500).json({ message: "Erreur serveur." });
    }
};