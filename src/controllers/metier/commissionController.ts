// controllers/metier/commissionController.ts
import { Request, Response } from "express";
import { commissionService } from "../../services/metier/commissionService";
import { ledgerService } from "../../services/metier/ledgerService";
import { CommissionStatus } from "../../models/Commission";

// ================= MES COMMISSIONS =================
export const getMyCommissions = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Veuillez vous connecter." });
    }

    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);
    const status = req.query.status as CommissionStatus | undefined;

    const result = await commissionService.getMyCommissions(req.user.userId, {
      status,
      page,
      limit,
    });

    return res.status(200).json({ data: result });
  } catch (err: any) {
    return res
      .status(err.statusCode ?? 500)
      .json({ message: err.message ?? "Erreur serveur" });
  }
};

// ================= MON SOLDE =================
export const getMyBalance = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Veuillez vous connecter." });
    }

    const result = await ledgerService.getBalance(req.user.userId);

    return res.status(200).json({ data: result });
  } catch (err: any) {
    return res
      .status(err.statusCode ?? 500)
      .json({ message: err.message ?? "Erreur serveur" });
  }
};

// ================= MON HISTORIQUE =================
export const getMyHistory = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Veuillez vous connecter." });
    }

    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);

    const result = await ledgerService.getHistory(req.user.userId, {
      page,
      limit,
    });

    return res.status(200).json({ data: result });
  } catch (err: any) {
    return res
      .status(err.statusCode ?? 500)
      .json({ message: err.message ?? "Erreur serveur" });
  }
};

// ================= VALIDER UNE COMMISSION (admin) =================
export const validateCommission = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Veuillez vous connecter." });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Accès refusé." });
    }

    const { commissionId } = req.params;

    const result = await commissionService.validate(commissionId);

    return res.status(200).json({
      message: result.alreadyValidated
        ? "Commission déjà validée."
        : "Commission validée avec succès.",
      data: result.commission,
    });
  } catch (err: any) {
    return res
      .status(err.statusCode ?? 500)
      .json({ message: err.message ?? "Erreur serveur" });
  }
};

// ================= ANNULER UNE COMMISSION (admin) =================
export const cancelCommission = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Veuillez vous connecter." });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Accès refusé." });
    }

    const { commissionId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: "Motif requis." });
    }

    const result = await commissionService.cancel(commissionId, reason);

    return res.status(200).json({
      message: result.alreadyCancelled
        ? "Commission déjà annulée."
        : "Commission annulée avec succès.",
      data: result.commission,
    });
  } catch (err: any) {
    return res
      .status(err.statusCode ?? 500)
      .json({ message: err.message ?? "Erreur serveur" });
  }
};

// ================= LISTER TOUTES LES COMMISSIONS (admin) =================
export const listCommissions = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Veuillez vous connecter." });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Accès refusé." });
    }

    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);
    const status = req.query.status as CommissionStatus | undefined;
    const affiliateId = req.query.affiliateId as string | undefined;
    const program = req.query.program as string | undefined;

    const result = await commissionService.list({
      status,
      affiliateId,
      program: program as any,
      page,
      limit,
    });

    return res.status(200).json({ data: result });
  } catch (err: any) {
    return res
      .status(err.statusCode ?? 500)
      .json({ message: err.message ?? "Erreur serveur" });
  }
};

// ================= TRAITER LES ÉCHÉANCES (admin) =================
export const processDueCommissions = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Veuillez vous connecter." });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Accès refusé." });
    }

    const result = await commissionService.processDueCommissions();

    return res.status(200).json({
      message: `${result.modifiedCount} commission(s) traitée(s).`,
      data: result,
    });
  } catch (err: any) {
    return res
      .status(err.statusCode ?? 500)
      .json({ message: err.message ?? "Erreur serveur" });
  }
};