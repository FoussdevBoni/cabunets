// controllers/metier/rewardWithdrawalController.ts
import { Request, Response } from "express";
import { rewardWithdrawalService } from "../../services/metier/rewardWithdrawalService";
import { RewardWithdrawalStatus } from "../../models/RewardWithdrawal";

// ================= DEMANDER UN RETRAIT =================
export const createWithdrawal = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Veuillez vous connecter." });
    }

    const { amount, channel, destination, countryCode } = req.body;

    const result = await rewardWithdrawalService.create({
      affiliateId: req.user.userId,
      amount: Number(amount),
      channel,
      destination,
      countryCode,
    });

    return res.status(201).json({
      message: "Demande de retrait créée avec succès.",
      data: result,
    });
  } catch (err: any) {
    return res
      .status(err.statusCode ?? 500)
      .json({ message: err.message ?? "Erreur serveur" });
  }
};

// ================= MES RETRAITS =================
export const getMyWithdrawals = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Veuillez vous connecter." });
    }

    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);
    const status = req.query.status as RewardWithdrawalStatus | undefined;

    const result = await rewardWithdrawalService.getMyWithdrawals(
      req.user.userId,
      { status, page, limit }
    );

    return res.status(200).json({ data: result });
  } catch (err: any) {
    return res
      .status(err.statusCode ?? 500)
      .json({ message: err.message ?? "Erreur serveur" });
  }
};

// ================= DÉTAIL D'UN RETRAIT =================
export const getWithdrawalById = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Veuillez vous connecter." });
    }

    const { withdrawalId } = req.params;

    const result = await rewardWithdrawalService.getById(withdrawalId, req.user.role === "admin");

    // Un affilié ne peut voir que ses propres retraits
    if (
      req.user.role !== "admin" &&
      result.affiliateId._id.toString() !== req.user.userId
    ) {
      return res.status(403).json({ message: "Accès refusé." });
    }

    return res.status(200).json({ data: result });
  } catch (err: any) {
    return res
      .status(err.statusCode ?? 500)
      .json({ message: err.message ?? "Erreur serveur" });
  }
};

// ================= LISTER TOUS LES RETRAITS (admin) =================
export const listWithdrawals = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Veuillez vous connecter." });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Accès refusé." });
    }

    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);
    const status = req.query.status as RewardWithdrawalStatus | undefined;
    const affiliateId = req.query.affiliateId as string | undefined;

    const result = await rewardWithdrawalService.list({
      status,
      affiliateId,
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

// ================= APPROUVER UN RETRAIT (admin) =================
export const approveWithdrawal = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Veuillez vous connecter." });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Accès refusé." });
    }

    const { withdrawalId } = req.params;

    const result = await rewardWithdrawalService.approve(
      withdrawalId,
      req.user.userId
    );

    return res.status(200).json({
      message: result.alreadyApproved
        ? "Retrait déjà approuvé."
        : "Retrait approuvé avec succès.",
      data: result.withdrawal,
    });
  } catch (err: any) {
    return res
      .status(err.statusCode ?? 500)
      .json({ message: err.message ?? "Erreur serveur" });
  }
};

// ================= REJETER UN RETRAIT (admin) =================
export const rejectWithdrawal = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Veuillez vous connecter." });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Accès refusé." });
    }

    const { withdrawalId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: "Motif requis." });
    }

    const result = await rewardWithdrawalService.reject(
      withdrawalId,
      req.user.userId,
      reason
    );

    return res.status(200).json({
      message: result.alreadyRejected
        ? "Retrait déjà rejeté."
        : "Retrait rejeté avec succès.",
      data: result.withdrawal,
    });
  } catch (err: any) {
    return res
      .status(err.statusCode ?? 500)
      .json({ message: err.message ?? "Erreur serveur" });
  }
};

// ================= MARQUER COMME PAYÉ (admin) =================
export const markWithdrawalAsPaid = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Veuillez vous connecter." });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Accès refusé." });
    }

    const { withdrawalId } = req.params;
    const { externalReference, paymentProof } = req.body;

    if (!externalReference) {
      return res.status(400).json({ message: "Référence externe requise." });
    }

    const result = await rewardWithdrawalService.markAsPaid(
      withdrawalId,
      req.user.userId,
      externalReference,
      paymentProof
    );

    return res.status(200).json({
      message: result.alreadyPaid
        ? "Retrait déjà payé."
        : "Retrait marqué comme payé.",
      data: result.withdrawal,
    });
  } catch (err: any) {
    return res
      .status(err.statusCode ?? 500)
      .json({ message: err.message ?? "Erreur serveur" });
  }
};