// src/services/metier/commissionService.ts
import mongoose from "mongoose";
import { Commission, CommissionStatus } from "../../models/Commission";
import { RewardRule, ProgramType } from "../../models/RewardRule";
import { money } from "../../utils/money";
import { ledgerService } from "./ledgerService";
import {
  NotFoundError,
  ValidationError,
  ConflictError,
} from "../../utils/errors";

export interface CreateCommissionParams {
  affiliateId: string;
  referralId: string;
  program: ProgramType;
  sourceType: "order" | "seller_activation";
  sourceId: string;
  eventId: string;
  orderAmount?: number;
}

export const commissionService = {
  // ----------------------------------------------------------
  // CREATE A COMMISSION
  // ----------------------------------------------------------
  async create(params: CreateCommissionParams) {
    const {
      affiliateId,
      referralId,
      program,
      sourceType,
      sourceId,
      eventId,
      orderAmount = 0,
    } = params;

    // 1. Idempotency check
    const existing = await Commission.findOne({ affiliateId, eventId });
    if (existing) {
      return { commission: existing, alreadyExists: true };
    }

    // 2. Find active rule for this program
    const rule = await RewardRule.findOne({ program, active: true });
    if (!rule) {
      throw new NotFoundError(
        `Aucune règle active pour le programme "${program}"`
      );
    }

    // 3. Compute amount
    let amount = 0;

    switch (rule.mode) {
      case "fixe":
        amount = rule.fixedAmount ?? 0;
        break;

      case "pourcentage":
        if (orderAmount <= 0) {
          throw new ValidationError(
            "Le montant de la commande est requis pour un calcul en pourcentage"
          );
        }
        amount = money.applyPercentage(orderAmount, rule.percentage ?? 0);
        break;

      case "hybride":
        amount = money.applyHybrid(
          orderAmount,
          rule.fixedAmount ?? 0,
          rule.percentage ?? 0
        );
        break;

      default:
        throw new ValidationError("Mode de récompense inconnu");
    }

    // 4. Apply cap
    amount = money.applyCap(amount, rule.cap);

    if (amount <= 0) {
      throw new ValidationError("Le montant calculé est nul ou négatif");
    }

    // 5. Compute availability date
    const availableAt = new Date(
      Date.now() + rule.availabilityDelayDays * 24 * 60 * 60 * 1000
    );

    // 6. Create commission
    const commission = await Commission.create({
      affiliateId,
      referralId,
      sourceType,
      sourceId,
      eventId,
      program,
      amount,
      currency: rule.currency,
      status: "en_attente",
      ruleSnapshot: {
        ruleId: rule._id,
        mode: rule.mode,
        fixedAmount: rule.fixedAmount,
        percentage: rule.percentage,
        cap: rule.cap,
        availabilityDelayDays: rule.availabilityDelayDays,
      },
      availableAt,
    });

    // 7. Write to ledger (credit)
    await ledgerService.write({
      affiliateId,
      type: "commission_credit",
      signedAmount: amount,
      currency: rule.currency,
      description: `Commission ${program} - ${sourceType} ${sourceId}`,
      commissionId: commission._id,
    });

    return { commission, alreadyExists: false };
  },

  // ----------------------------------------------------------
  // VALIDATE A COMMISSION (en_attente → disponible)
  // ----------------------------------------------------------
  async validate(commissionId: string) {
    const commission = await Commission.findById(commissionId);
    if (!commission) {
      throw new NotFoundError("Commission introuvable");
    }

    if (commission.status === "disponible") {
      return { commission, alreadyValidated: true };
    }

    if (commission.status !== "en_attente" && commission.status !== "detectee") {
      throw new ConflictError(
        `Impossible de valider une commission au statut "${commission.status}"`
      );
    }

    commission.status = "disponible";
    commission.validatedAt = new Date();
    await commission.save();

    return { commission, alreadyValidated: false };
  },

  // ----------------------------------------------------------
  // CANCEL A COMMISSION
  // ----------------------------------------------------------
  async cancel(commissionId: string, reason: string) {
    const commission = await Commission.findById(commissionId);
    if (!commission) {
      throw new NotFoundError("Commission introuvable");
    }

    if (commission.status === "payee") {
      throw new ConflictError(
        "Impossible d'annuler une commission déjà payée. Créez une régularisation."
      );
    }

    if (commission.status === "annulee") {
      return { commission, alreadyCancelled: true };
    }

    // 1. Mark commission as cancelled
    commission.status = "annulee";
    commission.reason = reason;
    await commission.save();

    // 2. Write adjustment to ledger (reverse debit)
    await ledgerService.write({
      affiliateId: commission.affiliateId,
      type: "regularisation",
      signedAmount: -commission.amount,
      currency: commission.currency,
      description: `Annulation commission ${commission._id} : ${reason}`,
      commissionId: commission._id,
    });

    return { commission, alreadyCancelled: false };
  },

  // ----------------------------------------------------------
  // GET AFFILIATE COMMISSIONS
  // ----------------------------------------------------------
  async getMyCommissions(
    affiliateId: string,
    options: { status?: CommissionStatus; page?: number; limit?: number } = {}
  ) {
    const page = options.page ?? 1;
    const limit = options.limit ?? 20;
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = { affiliateId };
    if (options.status) filter.status = options.status;

    const [items, total] = await Promise.all([
      Commission.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Commission.countDocuments(filter),
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
  // LIST ALL COMMISSIONS (admin)
  // ----------------------------------------------------------
  async list(
    options: {
      status?: CommissionStatus;
      affiliateId?: string;
      program?: ProgramType;
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
    if (options.program) filter.program = options.program;

    const [items, total] = await Promise.all([
      Commission.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("affiliateId", "email username codeParrainage"),
      Commission.countDocuments(filter),
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
  // PROCESS DUE COMMISSIONS (cron)
  // ----------------------------------------------------------
  async processDueCommissions() {
    const now = new Date();

    const result = await Commission.updateMany(
      {
        status: "en_attente",
        availableAt: { $lte: now },
      },
      {
        $set: {
          status: "disponible",
          validatedAt: now,
        },
      }
    );

    return {
      modifiedCount: result.modifiedCount,
      timestamp: now,
    };
  },
};

export type CommissionService = typeof commissionService;