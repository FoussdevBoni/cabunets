// middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { profileService } from "../services/profileService";
import { Admin } from "../models/Admin";
import User from "../models/User";

interface JwtPayload {
  id: string;
  role: "admin" | "client" | "vendeur";
  username: string;
  avatar?: string;
  email?: string;
  phone?: string;
  iat: number;
  exp: number;
}

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      userId: string;
      role: "admin" | "client" | "vendeur";
      username: string;
      avatar?: string;
      email?: string;
      profile: any;
      impersonatedBy?: {
        adminId: string;
        adminUsername: string;
        adminEmail?: string;
      };
    };
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Veuillez vous connecter." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "supersecret"
    ) as JwtPayload;

    let profile: any;
    let effectiveRole: "admin" | "client" | "vendeur" = decoded.role;
    let effectiveId: string = decoded.id;
    let effectiveUsername: string = decoded.username;
    let effectiveEmail: string | undefined = decoded.email;
    let effectiveAvatar: string | undefined = decoded.avatar;

    let impersonatedBy:
      | {
          adminId: string;
          adminUsername: string;
          adminEmail?: string;
        }
      | undefined = undefined;

    // ---------- VENDEUR ----------
    if (decoded.role === "vendeur") {
      const vendeur = await profileService.getProfileByRole("vendeur", decoded.id);
      if (!vendeur) {
        return res.status(404).json({ message: "Vendeur non trouvé." });
      }

      let superviseur: any = null;
      if ((vendeur as any).clientId) {
        superviseur = await profileService.getProfileById(
          String((vendeur as any).clientId),
          "client"
        );
      }

      profile = {
        _id: vendeur._id,
        userId: (vendeur as any).userId ?? vendeur._id,
        ...(vendeur.toObject?.() ?? vendeur),
        client: superviseur,
      };
    }

    // ---------- CLIENT ----------
    else if (decoded.role === "client") {
      const client = await profileService.getProfileByRole("client", decoded.id);
      if (!client) {
        return res.status(404).json({ message: "Client non trouvé." });
      }

      profile = {
        _id: client._id,
        userId: (client as any).userId ?? client._id,
        ...(client.toObject?.() ?? client),
      };
    }

    // ---------- ADMIN (avec impersonation possible) ----------
    else if (decoded.role === "admin") {
      const adminDoc = await Admin.findById(decoded.id).lean();

      if (adminDoc?.managedUserId) {
        const managedId = String(adminDoc.managedUserId);

        // 1) Récupérer le rôle réel de la cible
        const managedUser = await User.findById(managedId)
          .select("role username email avatar isActive")
          .lean();

        if (!managedUser) {
          return res.status(404).json({ message: "Utilisateur managé introuvable." });
        }

        if (managedUser.isActive === false) {
          return res.status(403).json({ message: "Utilisateur managé désactivé." });
        }

        const targetRole = managedUser.role as "client" | "vendeur";
        if (targetRole !== "client" && targetRole !== "vendeur") {
          return res.status(400).json({ message: "Rôle managé non supporté." });
        }

        // 2) Charger le profil correspondant
        const managedProfile = await profileService.getProfileByRole(
          targetRole,
          managedId
        );

        if (!managedProfile) {
          return res.status(404).json({ message: "Profil managé introuvable." });
        }

        if (targetRole === "client") {
          profile = {
            _id: managedProfile._id,
            userId: (managedProfile as any).userId ?? managedProfile._id,
            ...(managedProfile.toObject?.() ?? managedProfile),
          };
        } else {
          let superviseur: any = null;
          if ((managedProfile as any).clientId) {
            superviseur = await profileService.getProfileById(
              String((managedProfile as any).clientId),
              "client"
            );
          }
          profile = {
            _id: managedProfile._id,
            userId: (managedProfile as any).userId ?? managedProfile._id,
            ...(managedProfile.toObject?.() ?? managedProfile),
            client: superviseur,
          };
        }

        // 3) L'identité effective devient celle de la cible
        effectiveRole = targetRole;
        effectiveId = managedId;
        effectiveUsername = managedUser.username ?? decoded.username;
        effectiveEmail = managedUser.email ?? decoded.email;
        effectiveAvatar = managedUser.avatar ?? decoded.avatar;

        // 4) Trace de l'admin réel
        impersonatedBy = {
          adminId: decoded.id,
          adminUsername: decoded.username,
          adminEmail: decoded.email,
        };
      } else {
        // Admin sans impersonation
        const admin = await profileService.getProfileByRole("admin", decoded.id);
        profile = admin
          ? {
              _id: admin._id,
              userId: (admin as any).userId ?? admin._id,
              ...(admin.toObject?.() ?? admin),
            }
          : { _id: decoded.id, userId: decoded.id };
      }
    }

    // ---------- RÔLE INCONNU ----------
    else {
      return res.status(401).json({ message: "Rôle non autorisé." });
    }

    req.user = {
      userId: effectiveId,
      role: effectiveRole,
      username: effectiveUsername,
      avatar: effectiveAvatar,
      email: effectiveEmail,
      profile,
    };

    if (impersonatedBy) {
      req.user.impersonatedBy = impersonatedBy;
    }

    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res
      .status(401)
      .json({ message: "Session invalide. Veuillez vous reconnecter." });
  }
};