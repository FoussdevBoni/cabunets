import mongoose from "mongoose";
import { affiliateTransaction } from "./affiliateTransaction";
import { LedgerEntry } from "../../models/LedgerEntry";
import { Affiliate } from "../../models/Affiliate";
import { Referral } from "../../models/Referral";
import { Order } from "../../models/Order";
import { Commission } from "../../models/Commission";
import { RewardWithdrawal } from "../../models/RewardWithdrawal";
import { AffiliateIssue } from "../../models/AffiliateIssue";
import { AuditLog } from "../../models/AuditLog";
import { Vendeur } from "../../models/Vendeur";
import { pagination, period } from "../../utils/affiliateQuery";
import { ledgerService } from "./ledgerService";
import { NotFoundError, ValidationError } from "../../utils/errors";

export const affiliateAdminService = {
  async overview(query: any = {}, affiliateId?: string) {
    const scope = affiliateId ? { affiliateId } : {};
    const referrals = await Referral.find(scope).select("filleulId type").lean();
    const clients = referrals.filter(r => r.type === "client").map(r => String(r.filleulId));
    const sellers = referrals.filter(r => r.type === "vendeur").map(r => String(r.filleulId));
    const match = { ...period(query), ...(affiliateId ? { affiliateId: new mongoose.Types.ObjectId(affiliateId) } : {}) };
    const [activeAffiliates, totalAffiliates, pendingCommissions, pendingWithdrawals, commissions, withdrawals, revenue, activeClients, activeSellers, openIssues] = await Promise.all([
      Affiliate.countDocuments({ statut: "actif" }), Affiliate.countDocuments(),
      Commission.countDocuments({ ...scope, ...period(query), status: "en_attente" }),
      RewardWithdrawal.countDocuments({ ...scope, ...period(query), status: "en_attente" }),
      Commission.aggregate([{ $match: match }, { $group: {
        _id: { currency: "$currency", status: "$status" }, amount: { $sum: "$amount" }, count: { $sum: 1 }
      }}]),
      RewardWithdrawal.aggregate([{ $match: match }, { $group: {
        _id: { currency: "$currency", status: "$status" }, amount: { $sum: "$amount" }, count: { $sum: 1 }
      }}]),
      Order.aggregate([{ $match: { ...period(query), clientId: { $in: clients }, status: "DELIVERED" } },
        { $group: { _id: "$currency", amount: { $sum: "$price" }, orders: { $sum: 1 } } }]),
      Order.distinct("clientId", { ...period(query), clientId: { $in: clients }, status: "DELIVERED" }),
      Order.distinct("vendeurId", { ...period(query), vendeurId: { $in: sellers }, status: "DELIVERED" }),
      AffiliateIssue.countDocuments({ status: "open" }),
    ]);
    return { activeAffiliates, totalAffiliates, referrals: referrals.length,
      clients: clients.length, sellers: sellers.length, activeClients: activeClients.length,
      activeSellers: activeSellers.length, pendingCommissions, pendingWithdrawals,
      totalCommissions: commissions.reduce((sum, row) => sum + row.count, 0),
      totalWithdrawals: withdrawals.reduce((sum, row) => sum + row.count, 0),
      commissions, withdrawals, revenue, openIssues };
  },

  async audit(query: any) {
    const { page, limit, skip } = pagination(query);
    const filter = { ...period(query), path: { $regex: "^/api/(affiliates|commissions|reward-withdrawals|reward-rules|affiliate-admin)(/|$)" } };
    const [items, total] = await Promise.all([
      AuditLog.find(filter).select("-ip -userAgent").populate("actorId", "username email")
        .sort({ createdAt: -1, _id: -1 }).skip(skip).limit(limit).lean(),
      AuditLog.countDocuments(filter)
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async issues(query: any) {
    const { page, limit, skip } = pagination(query);
    const filter = { ...period(query, "updatedAt"), ...(query.status ? { status: String(query.status) } : {}) };
    const [items, total] = await Promise.all([
      AffiliateIssue.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit).lean(),
      AffiliateIssue.countDocuments(filter)
    ]);
    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async resolveIssue(id: string, resolution: unknown, adminId: string) {
    if (typeof resolution !== "string" || !resolution.trim()) throw new ValidationError("Motif de résolution requis.");
    const issue = await AffiliateIssue.findByIdAndUpdate(id, { $set: {
      status: "resolved", resolution: resolution.trim(), resolvedAt: new Date(), resolvedBy: adminId
    } }, { new: true });
    if (!issue) throw new NotFoundError("Anomalie introuvable.");
    return issue;
  },

  async sellers(query: any) {
    const { page, limit, skip } = pagination(query);
    const filter = { type: "vendeur" };
    const [items, total] = await Promise.all([
      Referral.find(filter).populate("filleulId", "username email isActive")
        .populate("affiliateId", "username codeParrainage").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Referral.countDocuments(filter)
    ]);
    const profiles = await Vendeur.find({ _id: { $in: items.map((r: any) => r.filleulId?._id).filter(Boolean) } }).lean();
    const byId = new Map(profiles.map(p => [String(p._id), p]));
    return { items: items.map((r: any) => ({ ...r, seller: byId.get(String(r.filleulId?._id)) ?? null })),
      total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async adjustment(body: any) {
    const { affiliateId, amount, reason, reference } = body;
    if (!mongoose.isValidObjectId(affiliateId) || typeof amount !== "number" ||
        !Number.isFinite(amount) || amount === 0 || Math.abs(amount) > 1e9 ||
        typeof reason !== "string" || !reason.trim() ||
        typeof reference !== "string" || !reference.trim() || reference.length > 100) {
      throw new ValidationError("Compte, montant signé, motif et référence sont obligatoires.");
    }
    return affiliateTransaction(affiliateId, async session => {
      const operationKey = "manual:" + affiliateId + ":" + reference.trim();
      const existing = await LedgerEntry.findOne({ operationKey }).session(session);
      if (existing) {
        if (existing.signedAmount !== Math.round(amount * 100) / 100) throw new ValidationError("Référence déjà utilisée pour un autre montant.");
        return { id: existing._id, alreadyExists: true };
      }
      const entry = await ledgerService.write({ affiliateId, type: "regularisation",
        signedAmount: amount, currency: "CDF", description: reason.trim() + " · Réf. " + reference.trim(), operationKey, session });
      return { id: entry._id, alreadyExists: false };
    });
  },

  async scan() {
    const accounts = await Affiliate.find().select("_id telephone").lean();
    const phones = new Map<string, string[]>();
    for (const account of accounts) {
      const ids = phones.get(account.telephone) ?? [];
      ids.push(String(account._id)); phones.set(account.telephone, ids);
      const balance = await ledgerService.getBalance(String(account._id));
      const key = "negative:" + account._id;
      if (balance.availableBalance < 0) {
        await AffiliateIssue.updateOne({ _id: key }, { $set: { affiliateId: account._id,
          category: "negative_balance", status: "open", message: "Solde disponible négatif : " + balance.availableBalance + " CDF." } }, { upsert: true });
      } else await AffiliateIssue.updateOne({ _id: key, status: "open" }, { $set: { status: "resolved", resolvedAt: new Date(), resolution: "Solde régularisé." } });
    }
    for (const ids of phones.values()) if (ids.length > 1) {
      const key = "phone:" + ids.slice().sort().join(":");
      await AffiliateIssue.updateOne({ _id: key }, { $setOnInsert: {
        category: "shared_phone", status: "open",
        message: "Plusieurs affiliés partagent un téléphone. Comptes à examiner : " + ids.join(", ")
      } }, { upsert: true });
    }
    return { open: await AffiliateIssue.countDocuments({ status: "open" }) };
  },
};
