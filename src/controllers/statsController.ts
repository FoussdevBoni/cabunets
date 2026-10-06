// controllers/statsController.ts
import { Request, Response } from "express";
import { statsService } from "../services/statsService";

export const getAdminOverview = async (_req: Request, res: Response) => {
  try {
    const data = await statsService.getAdminOverview();
    return res.json(data);
  } catch (err) {
    console.error("getAdminOverview error:", err);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};


// controllers/statsController.ts
export const getVendeurOverview = async (req: Request, res: Response) => {
  try {
    // ✅ Impersonation-safe : req.user.userId est la cible
    const vendeurId = req.user!.userId;
    const data = await statsService.getVendeurOverview(vendeurId);
    return res.json(data);
  } catch (err) {
    console.error("getVendeurOverview error:", err);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};