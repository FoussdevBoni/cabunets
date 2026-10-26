// src/services/metier/ledgerService.ts
import mongoose from "mongoose";
import { LedgerEntry, LedgerType } from "../../models/LedgerEntry";
import { Commission } from "../../models/Commission";
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
  async getBalance(affiliateId: string, currency = "CDF", session?: mongoose.ClientSession): Promise<BalanceResult & { pendingBalance: number }> {
    const entries = await LedgerEntry.find({ affiliateId, currency }).session(session ?? null).lean();
    const commissions = await Commission.find({ affiliateId, currency }).session(session ?? null).lean();
    const states = new Map(commissions.map(c => [String(c._id), c.status]));
    let totalCredit = 0, totalDebit = 0;
    for (const entry of entries) {
      const status = entry.commissionId ? states.get(String(entry.commissionId)) : undefined;
      // Old pending credits remain in the immutable history but cannot be withdrawn.
      if (entry.type === "commission_credit" &&
          !["disponible", "reservee", "payee"].includes(status ?? "")) continue;
      // Cancellation removes the original credit from eligibility, together with its reversal.
      if (entry.commissionId && ["annulee", "rejetee"].includes(status ?? "") &&
          ["regularisation", "adjustment"].includes(entry.type)) continue;
      if (entry.signedAmount > 0) totalCredit += entry.signedAmount;
      else totalDebit -= entry.signedAmount;
    }
    const pendingBalance = commissions
      .filter(c => ["detectee", "en_attente"].includes(c.status))
      .reduce((sum, c) => sum + c.amount, 0);
    return { totalCredit: money.round(totalCredit), totalDebit: money.round(totalDebit),
      availableBalance: money.round(totalCredit - totalDebit), currency,
      pendingBalance: money.round(pendingBalance) };
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