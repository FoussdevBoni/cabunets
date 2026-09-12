import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { profileService } from "../services/profileService";

interface JwtPayload {
  id: string;
  role: 'admin' | 'client' | 'vendeur';
  username: string;
  avatar?: string;
  email?: string;
  phone?: string;
  iat: number;
  exp: number;
}

// On déclare user sur Request globalement pour TS
declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      userId: string;
      role: 'admin' | 'client' | 'vendeur';
      username: string;
      avatar?: string;
      email?: string;
      profile: any;

    }
  }
}


export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Veuillez vous connecter." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecret") as JwtPayload;

    let profile: any;

    if (decoded.role === "vendeur") {
      const vendeur = await profileService.getProfileByRole("vendeur", decoded.id);

      if (!vendeur) {
        return res.status(404).json({ message: "Vendeur non trouvé." });
      }

      const vendeurSuperviseur = await profileService.getProfileById(vendeur.clientId, "client"
      );




      profile = {
        _id: vendeur._id,
        userId: vendeur.userId,
        ...vendeur,
        client: vendeurSuperviseur
      };


    }
    else if (decoded.role === "client") {
      const client = await profileService.getProfileByRole("client", decoded.id);

      if (!client) {
        return res.status(404).json({ message: "Client non trouvé." });
      }

      profile = {
        _id: client._id,
        userId: client.userId,
        ...client
      };


    }
    else if (decoded.role === "admin") {
      const admin = await profileService.getProfileByRole("admin", decoded.id);

      if (!admin) {
        profile = {
          _id: decoded.id,
          userId: decoded.id,
        }

      } else {
        profile = {
          _id: admin._id,
          userId: admin.userId,
          ...admin
        };

      }



    }
    else {
      // Rôle non reconnu
      return res.status(401).json({ message: "Rôle non autorisé." });
    }

    req.user = {
      userId: decoded.id,
      role: decoded.role,
      username: decoded.username,
      avatar: decoded.avatar,
      email: decoded.email,
      profile
    };

    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(401).json({ message: "Session invalide. Veuillez vous reconnecter." });
  }
};
