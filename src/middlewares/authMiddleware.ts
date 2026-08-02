import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  id: string;
  role: 'vendeur' | 'admin' | 'client';
  iat: number;
  exp: number;
}

// On déclare user sur Request globalement pour TS
declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      userId: string;
      role: 'vendeur' | 'admin' | 'client';

    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Accès refusé. Token manquant." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecret") as JwtPayload;
    req.user = {
      userId: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Token invalide ou expiré." });
  }
};
