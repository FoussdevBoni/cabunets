import { affiliateTransaction } from "./affiliateTransaction";
import { encryptDestination, decryptDestination } from "../../utils/paymentDestination";
// src/services/metier/rewardWithdrawalService.ts
import mongoose from "mongoose";
import {
  RewardWithdrawal,
  RewardWithdrawalStatus,
  RewardWithdrawalChannel,
} from "../../models/RewardWithdrawal";
import { ledgerService } from "./ledgerService";
import { phone } from "../../utils/phone";
import { money } from "../../utils/money";
import {
  NotFoundError,
  ValidationError,
  ConflictError,
  ForbiddenError,
} from "../../utils/errors";



export interface CreateWithdrawalParams {
  affiliateId: string;
  amount: number;
  channel: RewardWithdrawalChannel;
  destination: string;      // numéro de téléphone ou info
  countryCode?: string;
}

export const rewardWithdrawalService = {
  // ----------------------------------------------------------
  // CREATE A WITHDRAWAL REQUEST
  // ----------------------------------------------------------
  async create(params: CreateWithdrawalParams) {
    const { affiliateId, channel, destination, countryCode } = params;
    if (typeof params.amount !== "number" || !Number.isFinite(params.amount) || params.amount <= 0) {
      throw new ValidationError("Montant invalide.");
    }
    const amount = money.round(params.amount);
    const minimum = Number(process.env.AFFILIATE_MIN_WITHDRAWAL_CDF ?? 5000);
    if (!Number.isFinite(minimum) || minimum <= 0) throw new ValidationError("Seuil de retrait mal configuré.");
    if (amount < minimum) throw new ValidationError("Le minimum de retrait est de " + minimum + " CDF.");
    if (!["airtel_money", "vodacom_mpesa", "orange_money", "africell_money", "manuel"].includes(channel)) {
      throw new ValidationError("Canal de retrait invalide.");
    }
    if (typeof destination !== "string" || !destination.trim()) throw new ValidationError("Destination requise.");
    const normalized = phone.normalize(destination, countryCode ?? "CD");
    if (!normalized) throw new ValidationError("Numéro de téléphone invalide.");
    const destinationEncrypted = encryptDestination(normalized);
    return affiliateTransaction(affiliateId, async session => {
      const balance = await ledgerService.getBalance(affiliateId, "CDF", session);
      if (balance.availableBalance < amount) throw new ForbiddenError("Solde insuffisant pour ce retrait.");
      const [withdrawal] = await RewardWithdrawal.create([{
        affiliateId, amount, currency: "CDF", channel, maskedDestination: phone.mask(normalized),
        destinationEncrypted, status: "en_attente"
      }], { session });
      await ledgerService.write({
        affiliateId, type: "withdrawal_reserve", signedAmount: -amount, currency: "CDF",
        description: "Réservation retrait " + withdrawal._id, rewardWithdrawalId: withdrawal._id, session
      });
      // Never expose ciphertext in the creation response.
      const result = withdrawal.toObject();
      delete result.destinationEncrypted;
      return result;
    }, true);
  },

  // ----------------------------------------------------------
  // APPROVE A WITHDRAWAL (admin)
  // ----------------------------------------------------------
  async approve(withdrawalId: string, adminId: string) {
    const withdrawal = await RewardWithdrawal.findOneAndUpdate(
      { _id: withdrawalId, status: "en_attente" },
      { $set: { status: "approuvee", processedBy: adminId, processedAt: new Date() } }, { new: true }
    );
    if (withdrawal) return { withdrawal, alreadyApproved: false };
    const existing = await this.getById(withdrawalId);
    if (existing.status === "approuvee") return { withdrawal: existing, alreadyApproved: true };
    throw new ConflictError("Cette demande ne peut pas être approuvée.");
  },

  async reject(withdrawalId: string, adminId: string, reason: string) {
    if (!reason?.trim()) throw new ValidationError("Motif requis.");
    const initial = await RewardWithdrawal.findById(withdrawalId);
    if (!initial) throw new NotFoundError("Demande de retrait introuvable.");
    return affiliateTransaction(String(initial.affiliateId), async session => {
      const withdrawal = await RewardWithdrawal.findById(withdrawalId).session(session);
      if (!withdrawal) throw new NotFoundError("Demande de retrait introuvable.");
      if (withdrawal.status === "rejetee") return { withdrawal, alreadyRejected: true };
      if (withdrawal.status === "payee") throw new ConflictError("Ce retrait est déjà payé.");
      withdrawal.status = "rejetee"; withdrawal.reason = reason.trim();
      withdrawal.processedBy = new mongoose.Types.ObjectId(adminId); withdrawal.processedAt = new Date();
      await withdrawal.save({ session });
      await ledgerService.write({ affiliateId: withdrawal.affiliateId, type: "withdrawal_release",
        signedAmount: withdrawal.amount, currency: withdrawal.currency,
        description: "Rejet retrait : " + reason, rewardWithdrawalId: withdrawal._id, session });
      return { withdrawal, alreadyRejected: false };
    });
  },

  async markAsPaid(withdrawalId: string, adminId: string, externalReference: string, paymentProof?: string) {
    if (!externalReference?.trim()) throw new ValidationError("Référence de paiement requise.");
    const initial = await RewardWithdrawal.findById(withdrawalId);
    if (!initial) throw new NotFoundError("Demande de retrait introuvable.");
    return affiliateTransaction(String(initial.affiliateId), async session => {
      const withdrawal = await RewardWithdrawal.findById(withdrawalId).session(session);
      if (!withdrawal) throw new NotFoundError("Demande de retrait introuvable.");
      if (withdrawal.status === "payee") return { withdrawal, alreadyPaid: true };
      if (withdrawal.status !== "approuvee") throw new ConflictError("Le retrait doit être approuvé.");
      const balance = await ledgerService.getBalance(String(withdrawal.affiliateId), withdrawal.currency, session);
      if (balance.availableBalance < 0) throw new ConflictError("Une régularisation du solde doit être examinée avant paiement.");
      withdrawal.status = "payee"; withdrawal.externalReference = externalReference.trim();
      withdrawal.paymentProof = paymentProof; withdrawal.processedBy = new mongoose.Types.ObjectId(adminId);
      withdrawal.processedAt = new Date();
      await withdrawal.save({ session });
      // Reservation already debited the ledger: payment must not debit twice.
      return { withdrawal, alreadyPaid: false };
    });
  },

  // ----------------------------------------------------------
  // GET AFFILIATE WITHDRAWALS
  // ----------------------------------------------------------
  async getMyWithdrawals(
    affiliateId: string,
    options: { status?: RewardWithdrawalStatus; page?: number; limit?: number } = {}
  ) {
    const page = options.page ?? 1;
    const limit = options.limit ?? 20;
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = { affiliateId };
    if (options.status) filter.status = options.status;

    const [items, total] = await Promise.all([
      RewardWithdrawal.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      RewardWithdrawal.countDocuments(filter),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  // ----------------------------------------------------------
  // LIST ALL WITHDRAWALS (admin)
  // ----------------------------------------------------------
  async list(
    options: {
      status?: RewardWithdrawalStatus;
      affiliateId?: string;
      page?: number;
      limit?: number;
    } = {}
  ) {
    const page = options.page ?? 1;
    const limit = options.limit ?? 20;
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};
    if (options.status) filter.status = options.status;
    if (options.affiliateId) filter.affiliateId = options.affiliateId;

    const [items, total] = await Promise.all([
      RewardWithdrawal.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("affiliateId", "email username codeParrainage"),
      RewardWithdrawal.countDocuments(filter),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  // ----------------------------------------------------------
  // GET ONE
  // ----------------------------------------------------------
  async getById(withdrawalId: string, includeDestination = false) {
    const withdrawal = await RewardWithdrawal.findById(withdrawalId)
      .populate("affiliateId", "email username codeParrainage")
      .populate("processedBy", "email username")
      .select(includeDestination ? "+destinationEncrypted" : "");

    if (!withdrawal) {
      throw new NotFoundError("Demande de retrait introuvable");
    }

    const result = withdrawal.toObject();
    const destination = includeDestination && withdrawal.destinationEncrypted ? decryptDestination(withdrawal.destinationEncrypted) : undefined;
    delete result.destinationEncrypted;
    return { ...result, destination };
  },
};

export type RewardWithdrawalService = typeof rewardWithdrawalService;