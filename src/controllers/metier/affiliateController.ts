// controllers/metier/affiliateController.ts
import { Request, Response } from "express";
import { affiliateService } from "../../services/metier/affiliateService";

// ================= DEVENIR AFFILIÉ =================
export const devenirAffilie = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Veuillez vous connecter." });
    }

    const { telephone, countryCode } = req.body;

    const result = await affiliateService.devenirAffilie({
      userId: req.user.userId,
      telephone,
      countryCode,
    });

    return res.status(201).json({
      message:
        "Inscription affilié réussie. En attente de validation par l'administrateur.",
      data: result,
    });
  } catch (err: any) {
    return res
      .status(err.statusCode ?? 500)
      .json({ message: err.message ?? "Erreur serveur" });
  }
};

// ================= MON PROFIL AFFILIÉ =================
export const getMonProfil = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Veuillez vous connecter." });
    }

    const result = await affiliateService.getProfil(req.user.userId);

    return res.status(200).json({ data: result });
  } catch (err: any) {
    return res
      .status(err.statusCode ?? 500)
      .json({ message: err.message ?? "Erreur serveur" });
  }
};

// ================= VÉRIFIER MON TÉLÉPHONE =================
export const verifierTelephone = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Veuillez vous connecter." });
    }

    const result = await affiliateService.verifierTelephone(req.user.userId);

    return res.status(200).json({
      message: "Téléphone vérifié avec succès.",
      data: result,
    });
  } catch (err: any) {
    return res
      .status(err.statusCode ?? 500)
      .json({ message: err.message ?? "Erreur serveur" });
  }
};

// ================= ACTIVER UN AFFILIÉ (admin) =================
export const activerAffilie = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Veuillez vous connecter." });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Accès refusé." });
    }

    const { userId } = req.params;

    const result = await affiliateService.activer(userId);

    return res.status(200).json({
      message: result.alreadyActive
        ? "Affilié déjà actif."
        : "Affilié activé avec succès.",
      data: result,
    });
  } catch (err: any) {
    return res
      .status(err.statusCode ?? 500)
      .json({ message: err.message ?? "Erreur serveur" });
  }
};

// ================= SUSPENDRE UN AFFILIÉ (admin) =================
export const suspendreAffilie = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Veuillez vous connecter." });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Accès refusé." });
    }

    const { userId } = req.params;
    const { motif } = req.body;

    const result = await affiliateService.suspendre(userId, motif);

    return res.status(200).json({
      message: result.alreadySuspended
        ? "Affilié déjà suspendu."
        : "Affilié suspendu avec succès.",
      data: result,
    });
  } catch (err: any) {
    return res
      .status(err.statusCode ?? 500)
      .json({ message: err.message ?? "Erreur serveur" });
  }
};

// ================= RÉACTIVER UN AFFILIÉ (admin) =================
export const reactiverAffilie = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Veuillez vous connecter." });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Accès refusé." });
    }

    const { userId } = req.params;

    const result = await affiliateService.reactiver(userId);

    return res.status(200).json({
      message: "Affilié réactivé avec succès.",
      data: result,
    });
  } catch (err: any) {
    return res
      .status(err.statusCode ?? 500)
      .json({ message: err.message ?? "Erreur serveur" });
  }
};

// ================= LISTER LES AFFILIÉS (admin) =================
export const listerAffilies = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Veuillez vous connecter." });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Accès refusé." });
    }

    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);
    const statut = req.query.statut as
      | "en_attente"
      | "actif"
      | "suspendu"
      | undefined;

    const result = await affiliateService.lister({ statut, page, limit });

    return res.status(200).json({ data: result });
  } catch (err: any) {
    return res
      .status(err.statusCode ?? 500)
      .json({ message: err.message ?? "Erreur serveur" });
  }
};