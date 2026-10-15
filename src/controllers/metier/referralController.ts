// controllers/metier/referralController.ts
import { Request, Response } from "express";
import { referralService } from "../../services/metier/referralService";

// ================= MES FILLEULS =================
export const getMesFilleuls = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Veuillez vous connecter." });
    }

    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);
    const type = req.query.type as "client" | "vendeur" | undefined;

    const result = await referralService.getFilleuls(req.user.userId, {
      page,
      limit,
      type,
    });

    return res.status(200).json({ data: result });
  } catch (err: any) {
    return res
      .status(err.statusCode ?? 500)
      .json({ message: err.message ?? "Erreur serveur" });
  }
};

// ================= MES STATS =================
export const getMesStats = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Veuillez vous connecter." });
    }

    const stats = await referralService.compterFilleuls(req.user.userId);

    return res.status(200).json({ data: stats });
  } catch (err: any) {
    return res
      .status(err.statusCode ?? 500)
      .json({ message: err.message ?? "Erreur serveur" });
  }
};

// ================= MON PARRAIN =================
export const getMonParrain = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Veuillez vous connecter." });
    }

    const result = await referralService.getParrain(req.user.userId);

    return res.status(200).json({ data: result });
  } catch (err: any) {
    return res
      .status(err.statusCode ?? 500)
      .json({ message: err.message ?? "Erreur serveur" });
  }
};

// ================= DÉTAIL D'UN REFERRAL (admin) =================
export const getReferralById = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Veuillez vous connecter." });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Accès refusé." });
    }

    const { id } = req.params;

    const result = await referralService.getById(id);

    return res.status(200).json({ data: result });
  } catch (err: any) {
    return res
      .status(err.statusCode ?? 500)
      .json({ message: err.message ?? "Erreur serveur" });
  }
};