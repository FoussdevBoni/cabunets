// controllers/userController.ts
import { Request, Response } from "express";
import User from "../models/User";
import { register } from "./authController";
import { Vendeur } from "../models/Vendeur";
import { Client } from "../models/Client";

export const createUser = async (req: Request, res: Response) => {
  try {
    const user = await register(req, res);
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la création du user", details: err });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const { day, week, month, year, ...filters } = req.query;

    let query: any = { ...filters };

    if (day || week || month || year) {
      const now = new Date();
      let start: Date | null = null;
      let end: Date | null = null;

      if (day) {
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      } else if (week) {
        const dayOfWeek = now.getDay();
        start = new Date(now);
        start.setDate(now.getDate() - dayOfWeek);
        start.setHours(0, 0, 0, 0);

        end = new Date(start);
        end.setDate(start.getDate() + 7);
      } else if (month) {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      } else if (year) {
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear() + 1, 0, 1);
      }

      if (start && end) {
        query.createdAt = { $gte: start, $lt: end };
      }
    }

    const users = await User.find(query);

    const usersWithProfiles = await Promise.all(
      users.map(async (user) => {
        let profile = null;

        if (user.role === "vendeur") {
          profile = await Vendeur.findOne({ _id: user._id });
        } else if (user.role === "client") {
          profile = await Client.findOne({ _id: user._id });
        }

        return {
          _id: user._id,
          email: user.email,
          role: user.role,
          username: user.username,
          avatar: user.avatar,
          isVerified: user.isVerified,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,

          // 🆕 Suivi d'activité
          lastLoginAt: user.lastLoginAt ?? null,
          loginCount: user.loginCount ?? 0,
          actionsCount: user.actionsCount ?? 0,

          profile,
        };
      })
    );

    res.json(usersWithProfiles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur lors de la récupération des users" });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User introuvable." });
    }

    let roleInfo: any = null;
    switch (user.role) {
      case "vendeur":
        roleInfo = await Vendeur.findOne({ _id: user._id });
        break;
      case "client":
        roleInfo = await Client.findOne({ _id: user._id });
        break;
      default:
        roleInfo = null;
    }

    res.status(200).json({
      _id: user._id,
      email: user.email,
      role: user.role,
      username: user.username,
      avatar: user.avatar,
      isVerified: user.isVerified,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,

      // 🆕 Suivi d'activité
      lastLoginAt: user.lastLoginAt ?? null,
      loginCount: user.loginCount ?? 0,
      actionsCount: user.actionsCount ?? 0,

      profile: roleInfo,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const { username, avatar, profileData } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    if (username !== undefined) user.username = username;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    let profile = null;

    if (user.role === "vendeur" && profileData) {
      profile = await Vendeur.findByIdAndUpdate(
        user._id,
        { $set: profileData },
        { new: true }
      );
    }

    if (user.role === "client" && profileData) {
      profile = await Client.findByIdAndUpdate(
        user._id,
        { $set: profileData },
        { new: true }
      );
    }

    res.status(200).json({
      message: "Informations mises à jour avec succès.",
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        role: user.role,
      },
      profile,
    });
  } catch (err) {
    console.error("Erreur update user :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: "User non trouvé" });
    res.json({ message: "User supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la suppression du user" });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    // ✅ Utilise req.user (impersonation incluse) — plus de (req as any).user.id
    if (!req.user) {
      return res.status(401).json({ message: "Veuillez vous connecter." });
    }

    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    let profile = null;
    if (user.role === "vendeur") {
      profile = await Vendeur.findOne({ _id: user._id });
    } else if (user.role === "client") {
      profile = await Client.findOne({ _id: user._id });
    }

    res.status(200).json({
      _id: user._id,
      email: user.email,
      role: user.role,
      username: user.username,
      avatar: user.avatar,
      isVerified: user.isVerified,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,

      // 🆕 Suivi d'activité
      lastLoginAt: user.lastLoginAt ?? null,
      loginCount: user.loginCount ?? 0,
      actionsCount: user.actionsCount ?? 0,

      profile,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur", error: err });
  }
};

// ============================
// VERIFY USER
// ============================
export const verifyUser = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    if (user.isVerified) {
      return res.status(400).json({
        message: "Cet utilisateur est déjà vérifié.",
      });
    }

    user.isVerified = true;
    await user.save();

    let profile = null;
    if (user.role === "vendeur") {
      profile = await Vendeur.findOne({ _id: user._id });
    } else if (user.role === "client") {
      profile = await Client.findOne({ _id: user._id });
    }

    res.status(200).json({
      message: "Utilisateur vérifié avec succès.",
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        username: user.username,
        avatar: user.avatar,
        isVerified: user.isVerified,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,

        // 🆕 Suivi d'activité
        lastLoginAt: user.lastLoginAt ?? null,
        loginCount: user.loginCount ?? 0,
        actionsCount: user.actionsCount ?? 0,

        profile,
      },
    });
  } catch (err) {
    console.error("Erreur lors de la vérification de l'utilisateur :", err);
    res.status(500).json({
      message: "Erreur serveur lors de la vérification de l'utilisateur",
      error: err,
    });
  }
};

// ============================
// TOGGLE USER STATUS (Activer/Désactiver)
// ============================
export const toggleUserStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    const { isActive } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    // Empêcher la désactivation de son propre compte (impersonation-safe)
    const currentUserId = req.user?.userId;
    if (currentUserId && userId === currentUserId) {
      return res.status(400).json({
        message: "Vous ne pouvez pas désactiver votre propre compte.",
      });
    }

    user.isActive = isActive !== undefined ? isActive : !user.isActive;
    await user.save();

    let profile = null;
    if (user.role === "vendeur") {
      profile = await Vendeur.findOne({ _id: user._id });
    } else if (user.role === "client") {
      profile = await Client.findOne({ _id: user._id });
    }

    const statusText = user.isActive ? "activé" : "désactivé";

    res.status(200).json({
      message: `Compte utilisateur ${statusText} avec succès.`,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        username: user.username,
        avatar: user.avatar,
        isVerified: user.isVerified,
        isActive: user.isActive, // 🆕 fix : `s` → `isActive`
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,

        // 🆕 Suivi d'activité
        lastLoginAt: user.lastLoginAt ?? null,
        loginCount: user.loginCount ?? 0,
        actionsCount: user.actionsCount ?? 0,

        profile,
      },
    });
  } catch (err) {
    console.error("Erreur lors de l'activation/désactivation du compte :", err);
    res.status(500).json({
      message: "Erreur serveur lors de l'activation/désactivation du compte",
      error: err,
    });
  }
};