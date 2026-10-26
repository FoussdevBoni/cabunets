// src/services/metier/commissionService.ts
import { Setting } from "../../models/Setting";
import { affiliateTransaction } from "./affiliateTransaction";
import { LedgerEntry } from "../../models/LedgerEntry";
import { Affiliate } from "../../models/Affiliate";
import { Order } from "../../models/Order";
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
  orderCurrency?: string;
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
    const affiliate = await Affiliate.findById(affiliateId);
    if (!affiliate || affiliate.statut !== "actif") throw new ConflictError("Affilié non actif.");
    const now = new Date();
    const rule = await RewardRule.findOne({ program, active: true,
      $and: [
        { $or: [{ startDate: null }, { startDate: { $lte: now } }] },
        { $or: [{ endDate: null }, { endDate: { $gte: now } }] }
      ]
    }).sort({ updatedAt: -1 });
    if (!rule) {
      throw new NotFoundError(
        `Aucune règle active pour le programme "${program}"`
      );
    }

    let calculationAmount = orderAmount;
    let conversionRate = 1;
    if ((rule.mode === "pourcentage" || rule.mode === "hybride") &&
        params.orderCurrency && params.orderCurrency !== rule.currency) {
      const settings = await Setting.findOne();
      if (!settings) throw new ValidationError("Taux de change non configurés.");
      const from = settings.getExchangeRate(params.orderCurrency);
      const to = settings.getExchangeRate(rule.currency);
      if (!(from > 0 && to > 0)) throw new ValidationError("Taux de change invalides.");
      conversionRate = to / from;
      calculationAmount = money.round(orderAmount * conversionRate);
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
        amount = money.applyPercentage(calculationAmount, rule.percentage ?? 0);
        break;

      case "hybride":
        amount = money.applyHybrid(
          calculationAmount,
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
    let commission;
    try { commission = await Commission.create({
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
        sourceAmount: orderAmount,
        sourceCurrency: params.orderCurrency ?? rule.currency,
        conversionRate,
        mode: rule.mode,
        fixedAmount: rule.fixedAmount,
        percentage: rule.percentage,
        cap: rule.cap,
        availabilityDelayDays: rule.availabilityDelayDays,
      },
      availableAt,
    });

    } catch (error: any) {
      if (error.code !== 11000) throw error;
      const existing = await Commission.findOne({ affiliateId, eventId });
      if (!existing) throw error;
      return { commission: existing, alreadyExists: true };
    }
    return { commission, alreadyExists: false };
  },

  // ----------------------------------------------------------
  // VALIDATE A COMMISSION (en_attente → disponible)
  // ----------------------------------------------------------
  async validate(commissionId: string) {
    const initial = await Commission.findById(commissionId);
    if (!initial) throw new NotFoundError("Commission introuvable");
    return affiliateTransaction(String(initial.affiliateId), async session => {
      const commission = await Commission.findById(commissionId).session(session);
      if (!commission) throw new NotFoundError("Commission introuvable");
      if (commission.status === "disponible") return { commission, alreadyValidated: true };
      if (!["en_attente", "detectee"].includes(commission.status)) {
        throw new ConflictError("Cette commission ne peut pas être validée.");
      }
      if (commission.availableAt && commission.availableAt > new Date()) {
        throw new ConflictError("Le délai de disponibilité n'est pas expiré.");
      }
      if (commission.sourceType === "order") {
        const order = await Order.findById(commission.sourceId).session(session);
        if (!order || order.status !== "DELIVERED") {
          throw new ConflictError("La commande doit être payée et livrée.");
        }
      }
      const credit = await LedgerEntry.findOne({ commissionId, type: "commission_credit" }).session(session);
      if (!credit) await ledgerService.write({
        affiliateId: commission.affiliateId, type: "commission_credit",
        signedAmount: commission.amount, currency: commission.currency,
        description: "Validation commission " + commissionId, commissionId, session
      });
      commission.status = "disponible";
      commission.validatedAt = new Date();
      await commission.save({ session });
      return { commission, alreadyValidated: false };
    }, true);
  },

  async cancel(commissionId: string, reason: string) {
    if (!reason?.trim()) throw new ValidationError("Motif requis.");
    const initial = await Commission.findById(commissionId);
    if (!initial) throw new NotFoundError("Commission introuvable");
    return affiliateTransaction(String(initial.affiliateId), async session => {
      const commission = await Commission.findById(commissionId).session(session);
      if (!commission) throw new NotFoundError("Commission introuvable");
      if (commission.status === "annulee") return { commission, alreadyCancelled: true };
      if (commission.status === "payee") throw new ConflictError("Une régularisation du paiement est nécessaire.");
      const credit = await LedgerEntry.findOne({ commissionId, type: "commission_credit" }).session(session);
      if (credit) await ledgerService.write({
        affiliateId: commission.affiliateId, type: "regularisation",
        signedAmount: -commission.amount, currency: commission.currency,
        description: "Annulation commission : " + reason, commissionId, session
      });
      commission.status = "annulee"; commission.reason = reason.trim();
      await commission.save({ session });
      return { commission, alreadyCancelled: false };
    });
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
    const due = await Commission.find({ status: "en_attente", availableAt: { $lte: new Date() } }).select("_id");
    let modifiedCount = 0;
    for (const item of due) {
      try {
        const result = await this.validate(String(item._id));
        if (!result.alreadyValidated) modifiedCount++;
      } catch (error) { console.error("Commission non validée", String(item._id), error); }
    }
    return { modifiedCount, timestamp: new Date() };
  },
};

export type CommissionService = typeof commissionService;