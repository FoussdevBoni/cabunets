import { Request, Response, NextFunction } from "express";

export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  // Si impersonation en cours → l'admin réel est dans impersonatedBy
  if (req.user?.impersonatedBy) return next();
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Accès réservé aux administrateurs." });
  }
  next();
};