import { affiliateTransaction } from "./affiliateTransaction";
import { Affiliate } from "../../models/Affiliate";
import mongoose from "mongoose";
import { Order } from "../../models/Order";
import User from "../../models/User";
import { Vendeur } from "../../models/Vendeur";
import { Referral } from "../../models/Referral";
import { Commission } from "../../models/Commission";
import { AffiliateIssue } from "../../models/AffiliateIssue";
import { commissionService } from "./commissionService";
import { ConflictError, NotFoundError, ValidationError } from "../../utils/errors";

export const affiliateLifecycleService = {
  async syncOrder(orderId: string) {
    const order = await Order.findById(orderId);
    if (!order) throw new NotFoundError("Commande introuvable.");
    if (["FAILED", "CANCELLED", "REFUNDED"].includes(order.status)) {
      const commissions = await Commission.find({ $or: [
        { sourceType: "order", sourceId: orderId }, { qualifyingOrderId: order._id }
      ], status: { $nin: ["annulee", "rejetee"] } });
      for (const commission of commissions) {
        await commissionService.cancel(String(commission._id), order.reversalReason || "Commande annulée ou remboursée.");
      }
      return;
    }
    if (order.status !== "DELIVERED") return;
    if (order.clientId && mongoose.isValidObjectId(order.clientId)) {
      const referral = await Referral.findOne({ filleulId: order.clientId, type: "client" });
      if (referral) await commissionService.create({
        affiliateId: String(referral.affiliateId), referralId: String(referral._id),
        program: "affiliation_client", sourceType: "order", sourceId: orderId,
        eventId: "order_delivered_" + orderId, orderAmount: order.price, orderCurrency: order.currency, occurredAt: order.deliveredAt ?? order.createdAt,
      });
    }
    if (order.vendeurId && mongoose.isValidObjectId(order.vendeurId)) {
      const referral = await Referral.findOne({ filleulId: order.vendeurId, type: "vendeur" });
      if (!referral) return;
      const [seller, account] = await Promise.all([
        Vendeur.findById(order.vendeurId), User.findById(order.vendeurId)
      ]);
      if (!seller?.isApproved || !account || account.isActive === false) return;
      await affiliateTransaction(String(referral.affiliateId), async session => {
        const active = await Commission.findOne({ referralId: referral._id, program: "affiliation_vendeur",
          status: { $nin: ["annulee", "rejetee"] } }).session(session);
        if (active) return;
        const first = await Order.findOne({ vendeurId: order.vendeurId, status: "DELIVERED" })
          .sort({ deliveredAt: 1, createdAt: 1, _id: 1 }).session(session);
        if (!first) return;
        const locked = await Order.findOneAndUpdate({ _id: first._id, status: "DELIVERED" },
          { $inc: { affiliateVersion: 1, __v: 1 } }, { session, new: true });
        if (!locked) throw new ConflictError("La vente a changé. Une reprise est nécessaire.");
        await commissionService.create({
          affiliateId: String(referral.affiliateId), referralId: String(referral._id),
          program: "affiliation_vendeur", sourceType: "seller_activation", sourceId: order.vendeurId,
          eventId: "seller_first_sale_" + order.vendeurId + "_" + first._id,
          qualifyingOrderId: String(first._id), orderAmount: first.price, orderCurrency: first.currency,
          occurredAt: first.deliveredAt ?? first.createdAt,
        }, session);
      }, true);
    }
  },

  async safelySync(orderId: string) {
    const key = "order:" + orderId;
    try {
      const initial = await Order.findById(orderId).select("updatedAt");
      await this.syncOrder(orderId);
      if (initial) {
        const now = new Date();
        await Order.updateOne({ _id: orderId, updatedAt: initial.updatedAt }, { $set: { affiliateSyncedAt: now, updatedAt: now } }, { timestamps: false });
      }
      await AffiliateIssue.updateOne({ _id: key, status: "open" },
        { $set: { status: "resolved", resolvedAt: new Date(), resolution: "Reprise automatique réussie." } });
      return true;
    } catch (error: any) {
      await AffiliateIssue.updateOne({ _id: key }, {
        $set: { orderId, category: "commission_sync", status: "open",
          message: error.statusCode ? error.message : "Échec technique du traitement de commission." },
        $inc: { attempts: 1 }, $unset: { resolvedAt: 1, resolution: 1 },
      }, { upsert: true });
      return false;
    }
  },

  async reconcile() {
    let processed = 0, failed = 0;
    const cursor = Order.find({ status: { $in: ["DELIVERED", "FAILED", "CANCELLED", "REFUNDED"] },
      $or: [{ affiliateSyncedAt: null }, { $expr: { $gt: ["$updatedAt", "$affiliateSyncedAt"] } }] })
      .select("_id").sort({ _id: 1 }).cursor();
    for await (const order of cursor) {
      if (!(await this.safelySync(String(order._id)))) failed++;
      processed++;
    }
    return { processed, failed };
  },

  async approveSeller(sellerId: string, adminId: string) {
    if (!mongoose.isValidObjectId(sellerId)) throw new ValidationError("Identifiant vendeur invalide.");
    const account = await User.findOne({ _id: sellerId, role: "vendeur", isActive: { $ne: false } });
    if (!account) throw new NotFoundError("Vendeur actif introuvable.");
    const seller = await Vendeur.findByIdAndUpdate(sellerId, { $set: {
      isApproved: true, approvedBy: adminId, approvedAt: new Date()
    } }, { new: true, runValidators: true });
    if (!seller) throw new NotFoundError("Profil vendeur introuvable.");
    const first = await Order.findOne({ vendeurId: sellerId, status: "DELIVERED" }).sort({ deliveredAt: 1, _id: 1 });
    if (first) await this.safelySync(String(first._id));
    return seller;
  },

  async reverseOrder(orderId: string, status: "CANCELLED" | "REFUNDED", reason: string, reference?: string) {
    if (!mongoose.isValidObjectId(orderId) || typeof reason !== "string" || !reason.trim()) {
      throw new ValidationError("Commande et motif obligatoires.");
    }
    if (status === "REFUNDED" && (typeof reference !== "string" || !reference.trim())) {
      throw new ValidationError("Référence du remboursement déjà effectué requise.");
    }
    let result: any;
    await mongoose.connection.transaction(async session => {
      const order = await Order.findById(orderId).session(session);
      if (!order) throw new NotFoundError("Commande introuvable.");
      if (order.status !== status && (order.status === "REFUNDED" ||
          (status === "CANCELLED" && ["COMPLETED", "DELIVERED"].includes(order.status)) ||
          (status === "REFUNDED" && !["COMPLETED", "DELIVERED"].includes(order.status)))) {
        throw new ConflictError("Une commande payée exige un remboursement référencé ; une commande non payée doit être annulée.");
      }
      const commissions = await Commission.find({ $or: [
        { sourceType: "order", sourceId: orderId }, { qualifyingOrderId: order._id }
      ] }).session(session);
      const ids = [...new Set(commissions.map(c => String(c.affiliateId)))].sort();
      for (const id of ids) await Affiliate.findByIdAndUpdate(id, { $inc: { ledgerVersion: 1 } }, { session });
      order.status = status;
      order.reversalReason = reason.trim();
      order.reversalReference = reference?.trim();
      order.reversedAt = new Date();
      await order.save({ session });
      for (const commission of commissions) {
        await commissionService.cancel(String(commission._id), reason.trim(), session);
      }
      result = order;
    });
    return { order: result, synchronized: true };
  },
};
