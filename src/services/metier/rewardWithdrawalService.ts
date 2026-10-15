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

const MIN_WITHDRAWAL_AMOUNT = 5000;

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
    const { affiliateId, amount, channel, destination, countryCode } = params;

    // 1. Validate amount
    if (!amount || amount <= 0) {
      throw new ValidationError("Le montant doit être supérieur à zéro");
    }

    if (amount < MIN_WITHDRAWAL_AMOUNT) {
      throw new ValidationError(
        `Le montant minimum de retrait est de ${MIN_WITHDRAWAL_AMOUNT} ${money.DEFAULT_CURRENCY}`
      );
    }

    // 2. Check balance
    const hasEnough = await ledgerService.hasEnough(affiliateId, amount);
    if (!hasEnough) {
      throw new ForbiddenError("Solde insuffisant pour ce retrait");
    }

    // 3. Normalize & mask destination
    let maskedDestination = destination;

    if (channel !== "manuel") {
      const normalized = phone.normalize(destination, countryCode ?? "CD");
      if (!normalized) {
        throw new ValidationError("Numéro de téléphone invalide");
      }
      maskedDestination = phone.mask(normalized);
    }

    // 4. Create withdrawal + reserve amount in ledger (transaction)
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const [withdrawal] = await RewardWithdrawal.create(
        [
          {
            affiliateId,
            amount: money.round(amount),
            currency: money.DEFAULT_CURRENCY,
            channel,
            maskedDestination,
            status: "en_attente",
          },
        ],
        { session }
      );

      // Reserve the amount in ledger (negative entry)
      await ledgerService.write({
        affiliateId,
        type: "withdrawal_reserve",
        signedAmount: -amount,
        currency: money.DEFAULT_CURRENCY,
        description: `Réservation retrait ${withdrawal._id}`,
        rewardWithdrawalId: withdrawal._id,
        session,
      });

      await session.commitTransaction();
      session.endSession();

      return withdrawal;
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  },

  // ----------------------------------------------------------
  // APPROVE A WITHDRAWAL (admin)
  // ----------------------------------------------------------
  async approve(withdrawalId: string, adminId: string) {
    const withdrawal = await RewardWithdrawal.findById(withdrawalId);
    if (!withdrawal) {
      throw new NotFoundError("Demande de retrait introuvable");
    }

    if (withdrawal.status === "approuvee") {
      return { withdrawal, alreadyApproved: true };
    }

    if (withdrawal.status !== "en_attente") {
      throw new ConflictError(
        `Impossible d'approuver une demande au statut "${withdrawal.status}"`
      );
    }

    withdrawal.status = "approuvee";
    withdrawal.processedBy = new mongoose.Types.ObjectId(adminId);
    withdrawal.processedAt = new Date();
    await withdrawal.save();

    return { withdrawal, alreadyApproved: false };
  },

  // ----------------------------------------------------------
  // REJECT A WITHDRAWAL (admin)
  // ----------------------------------------------------------
  async reject(withdrawalId: string, adminId: string, reason: string) {
    const withdrawal = await RewardWithdrawal.findById(withdrawalId);
    if (!withdrawal) {
      throw new NotFoundError("Demande de retrait introuvable");
    }

    if (withdrawal.status === "rejetee") {
      return { withdrawal, alreadyRejected: true };
    }

    if (withdrawal.status === "payee") {
      throw new ConflictError(
        "Impossible de rejeter une demande déjà payée"
      );
    }

    // Transaction : mettre à jour le retrait + libérer le montant
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      withdrawal.status = "rejetee";
      withdrawal.reason = reason;
      withdrawal.processedBy = new mongoose.Types.ObjectId(adminId);
      withdrawal.processedAt = new Date();
      await withdrawal.save({ session });

      // Release the reserved amount
      await ledgerService.write({
        affiliateId: withdrawal.affiliateId,
        type: "withdrawal_release",
        signedAmount: withdrawal.amount,
        currency: withdrawal.currency,
        description: `Rejet retrait ${withdrawal._id} : ${reason}`,
        rewardWithdrawalId: withdrawal._id,
        session,
      });

      await session.commitTransaction();
      session.endSession();

      return { withdrawal, alreadyRejected: false };
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  },

  // ----------------------------------------------------------
  // MARK AS PAID (admin)
  // ----------------------------------------------------------
  async markAsPaid(
    withdrawalId: string,
    adminId: string,
    externalReference: string,
    paymentProof?: string
  ) {
    const withdrawal = await RewardWithdrawal.findById(withdrawalId);
    if (!withdrawal) {
      throw new NotFoundError("Demande de retrait introuvable");
    }

    if (withdrawal.status === "payee") {
      return { withdrawal, alreadyPaid: true };
    }

    if (withdrawal.status !== "approuvee") {
      throw new ConflictError(
        `Impossible de marquer comme payé une demande au statut "${withdrawal.status}"`
      );
    }

    withdrawal.status = "payee";
    withdrawal.externalReference = externalReference;
    withdrawal.paymentProof = paymentProof;
    withdrawal.processedBy = new mongoose.Types.ObjectId(adminId);
    withdrawal.processedAt = new Date();
    await withdrawal.save();

    return { withdrawal, alreadyPaid: false };
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
  async getById(withdrawalId: string) {
    const withdrawal = await RewardWithdrawal.findById(withdrawalId)
      .populate("affiliateId", "email username codeParrainage")
      .populate("processedBy", "email username");

    if (!withdrawal) {
      throw new NotFoundError("Demande de retrait introuvable");
    }

    return withdrawal;
  },
};

export type RewardWithdrawalService = typeof rewardWithdrawalService;