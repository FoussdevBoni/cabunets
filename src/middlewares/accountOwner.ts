import { Request, Response, NextFunction } from "express";
export function accountOwner(req: Request, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ message: "Veuillez vous connecter." });
  if (req.user.role !== "admin" && req.user.userId !== req.params.id) {
    return res.status(403).json({ message: "Accès refusé." });
  }
  next();
}