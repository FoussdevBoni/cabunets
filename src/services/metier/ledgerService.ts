// src/services/metier/ledgerService.ts
import mongoose from "mongoose";
import { LedgerEntry, LedgerType } from "../../models/LedgerEntry";
import { money } from "../../utils/money";

export interface BalanceResult {
  totalCredit: number;
  totalDebit: number;
  availableBalance: number;
  currency: string;
}

export const ledgerService = {
  // ----------------------------------------------------------
  // WRITE AN ENTRY (IMMUTABLE)
  // ----------------------------------------------------------
  async write(entry: {
    affiliateId: string | mongoose.Types.ObjectId;
    type: LedgerType;
    signedAmount: number;
    currency?: string;
    description: string;
    commissionId?: string | mongoose.Types.ObjectId;
    rewardWithdrawalId?: string | mongoose.Types.ObjectId; // 🆕 renommé
    session?: mongoose.ClientSession;
  }) {
    const [created] = await LedgerEntry.create(
      [
        {
          affiliateId: entry.affiliateId,
          type: entry.type,
          signedAmount: money.round(entry.signedAmount),
          currency: entry.currency ?? money.DEFAULT_CURRENCY,
          description: entry.description,
          commissionId: entry.commissionId,
          rewardWithdrawalId: entry.rewardWithdrawalId, // 🆕 renommé
        },
      ],
      { session: entry.session }
    );

    return created;
  },

  // ----------------------------------------------------------
  // GET AFFILIATE BALANCE
  // ----------------------------------------------------------
  async getBalance(affiliateId: string): Promise<BalanceResult> {
    const result = await LedgerEntry.aggregate([
      { $match: { affiliateId: new mongoose.Types.ObjectId(affiliateId) } },
      {
        $group: {
          _id: null,
          totalCredit: {
            $sum: {
              $cond: [{ $gt: ["$signedAmount", 0] }, "$signedAmount", 0],
            },
          },
          totalDebit: {
            $sum: {
              $cond: [{ $lt: ["$signedAmount", 0] }, { $abs: "$signedAmount" }, 0],
            },
          },
          currency: { $first: "$currency" },
        },
      },
    ]);

    if (!result || result.length === 0) {
      return {
        totalCredit: 0,
        totalDebit: 0,
        availableBalance: 0,
        currency: money.DEFAULT_CURRENCY,
      };
    }

    const { totalCredit, totalDebit, currency } = result[0];

    return {
      totalCredit: money.round(totalCredit),
      totalDebit: money.round(totalDebit),
      availableBalance: money.round(totalCredit - totalDebit),
      currency,
    };
  },

  // ----------------------------------------------------------
  // GET MOVEMENT HISTORY
  // ----------------------------------------------------------
  async getHistory(
    affiliateId: string,
    options: { page?: number; limit?: number } = {}
  ) {
    const page = options.page ?? 1;
    const limit = options.limit ?? 20;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      LedgerEntry.find({ affiliateId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      LedgerEntry.countDocuments({ affiliateId }),
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
  // CHECK IF AFFILIATE HAS ENOUGH FOR WITHDRAWAL
  // ----------------------------------------------------------
  async hasEnough(affiliateId: string, amount: number): Promise<boolean> {
    const { availableBalance } = await this.getBalance(affiliateId);
    return availableBalance >= amount;
  },
};

export type LedgerService = typeof ledgerService;