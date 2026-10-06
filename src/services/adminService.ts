// services/adminService.ts
import mongoose from "mongoose";
import { Admin } from "../models/Admin";
import User from "../models/User";

interface ManageUserResult {
  success: boolean;
  message: string;
  data?: {
    adminId: string;
    managedUserId: string;
    managedRole: "client" | "vendeur";
    managedUntil?: Date | null;
  };
}

export const adminService = {
  /**
   * Active l'impersonation : l'admin agit en tant que `userId`.
   * @param adminId  id de l'admin (issu du JWT, JAMAIS du body)
   * @param userId   id du user cible (client ou vendeur)
   * @param durationMinutes  durée optionnelle (null = pas d'expiration)
   */
  async manageUser(
    adminId: string,
    userId: string,
    durationMinutes?: number | null
  ): Promise<ManageUserResult> {
    try {
      // 1) Valider l'admin
      if (!mongoose.Types.ObjectId.isValid(adminId)) {
        return { success: false, message: "AdminId invalide." };
      }
      const admin = await Admin.findById(adminId);
      if (!admin) {
        return { success: false, message: "Admin introuvable." };
      }

      // 2) Valider la cible
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return { success: false, message: "UserId hhhh invalide." };
      }
      const target = await User.findById(userId).select("role isActive username email");
      if (!target) {
        return { success: false, message: "Utilisateur cible introuvable." };
      }
      if (target.role !== "client" && target.role !== "vendeur") {
        return {
          success: false,
          message: "Impossible de gérer un utilisateur avec ce rôle.",
        };
      }
      if (!target.isActive) {
        return { success: false, message: "Utilisateur cible désactivé." };
      }

      // 3) Interdire l'auto-impersonation (admin → lui-même)
      if (String(admin._id) === String(target._id)) {
        return { success: false, message: "Impossible de se gérer soi-même." };
      }

      // 4) Calculer l'expiration éventuelle
      const managedUntil =
        durationMinutes && durationMinutes > 0
          ? new Date(Date.now() + durationMinutes * 60_000)
          : null;

      // 5) Persister
      admin.managedUserId = new mongoose.Types.ObjectId(userId) as any;
      // Si tu ajoutes `managedUntil` au schéma Admin :
      // admin.managedUntil = managedUntil ?? undefined;
      await admin.save();

      return {
        success: true,
        message: "Impersonation activée.",
        data: {
          adminId: String(admin._id),
          managedUserId: userId,
          managedRole: target.role as "client" | "vendeur",
          managedUntil,
        },
      };
    } catch (error) {
      console.error("adminService.manageUser error:", error);
      return { success: false, message: "Erreur serveur." };
    }
  },

  /**
   * Désactive l'impersonation pour cet admin.
   */
  async stopManaging(adminId: string): Promise<ManageUserResult> {
    try {
      if (!mongoose.Types.ObjectId.isValid(adminId)) {
        return { success: false, message: "AdminId invalide." };
      }

      const admin = await Admin.findById(adminId);
      if (!admin) {
        return { success: false, message: "Admin introuvable." };
      }

      admin.managedUserId = undefined;
      // admin.managedUntil = undefined;
      await admin.save();

      return { success: true, message: "Impersonation terminée." };
    } catch (error) {
      console.error("adminService.stopManaging error:", error);
      return { success: false, message: "Erreur serveur." };
    }
  },

  /**
   * Récupère l'état d'impersonation d'un admin.
   */
  async getManagedUser(adminId: string) {
    try {
      const admin = await Admin.findById(adminId).populate(
        "managedUserId",
        "username email role avatar isActive"
      );
      if (!admin) return null;

      // Si expiration dépassée → reset auto
      // if (admin.managedUntil && admin.managedUntil < new Date()) {
      //   admin.managedUserId = undefined;
      //   admin.managedUntil = undefined;
      //   await admin.save();
      //   return null;
      // }

      return admin.managedUserId ?? null;
    } catch (error) {
      console.error("adminService.getManagedUser error:", error);
      return null;
    }
  },
};