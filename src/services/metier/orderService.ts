import { createHash } from "crypto";
import { ValidationError, ConflictError } from "../../utils/errors";
import { applyOrderPayment } from "./orderPaymentLifecycle";
import { affiliateLifecycleService } from "./affiliateLifecycleService";
// services/metier/orderService.ts
import { Order } from "../../models/Order";
import { cabupayPaymentService, CreateDepositDTO } from "../providers/cabupayPaymentService";
import { getPawapayError } from "../../utils/getPawapayErrors";
import { OrderNotificationService } from "./orderNotificationService";
import { commissionService } from "./commissionService";
import { Referral } from "../../models/Referral";

// ============================================================
// TYPES
// ============================================================

export interface OrderFilters {
  status?: string;
  vendeurId?: string;
  clientId?: string;
  network?: string;
  search?: string;
  day?: boolean;
  week?: boolean;
  month?: boolean;
  year?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface OrderListParams extends OrderFilters {
  page?: number;
  limit?: number;
}

export interface OrderStats {
  total: number;
  pending: number;
  completed: number;
  delivered: number;
  failed: number;
  whatsappPending: number;
  ca: number;
}

// ============================================================
// HELPERS
// ============================================================

function buildOrderQuery(filters: OrderFilters): any {
  const query: any = {};

  if (filters.status) query.status = filters.status.toUpperCase();
  if (filters.vendeurId) query.vendeurId = filters.vendeurId;
  if (filters.clientId) query.clientId = filters.clientId;
  if (filters.network) query.network = filters.network;

  if (filters.search) {
    const s = filters.search.trim();
    query.$or = [
      { depositId: { $regex: s, $options: "i" } },
      { phoneNumber: { $regex: s, $options: "i" } },
      { paymentPhone: { $regex: s, $options: "i" } },
      { vendeurName: { $regex: s, $options: "i" } },
      { vendeurPhone: { $regex: s, $options: "i" } },
      { network: { $regex: s, $options: "i" } },
    ];
  }

  const now = new Date();
  let start: Date | null = null;
  let end: Date | null = null;

  if (filters.startDate || filters.endDate) {
    if (filters.startDate) {
      start = new Date(filters.startDate);
      start.setHours(0, 0, 0, 0);
    }
    if (filters.endDate) {
      end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
    }
  } else if (filters.day) {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  } else if (filters.week) {
    const d = now.getDay();
    start = new Date(now);
    start.setDate(now.getDate() - d);
    start.setHours(0, 0, 0, 0);
    end = new Date(start);
    end.setDate(start.getDate() + 7);
  } else if (filters.month) {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  } else if (filters.year) {
    start = new Date(now.getFullYear(), 0, 1);
    end = new Date(now.getFullYear() + 1, 0, 1);
  }

  if (start || end) {
    query.createdAt = {};
    if (start) query.createdAt.$gte = start;
    if (end) query.createdAt.$lte = end;
  }

  return query;
}

// ============================================================
// SERVICE
// ============================================================

class OrderService {
  // ----------------------------------------------------------
  // TRIGGER COMMISSION
  // ----------------------------------------------------------
  /**
   * Déclenche la création d'une commission pour le parrain du client,
   * quand la commande passe à DELIVERED.
   *
   * Ne bloque JAMAIS le flux principal en cas d'erreur.
   */
  private async triggerCommission(order: any) {
    await affiliateLifecycleService.safelySync(String(order._id));
  }

  // ----------------------------------------------------------
  // CREATE
  // ----------------------------------------------------------
  async createOrder(body: any, requestKey?: string) {
    const { price, amount, paymentPhone, correspondent, currency = "USD", country = "COD",
      description, units, network } = body;
    if (!paymentPhone || typeof paymentPhone !== "string" || !paymentPhone.trim())
      throw new ValidationError("Le numéro de paiement est obligatoire.");
    if (!correspondent || typeof correspondent !== "string" || !correspondent.trim())
      throw new ValidationError("Le moyen de paiement est obligatoire.");
    const targetAmount = Number(price || amount);
    if (!Number.isFinite(targetAmount) || targetAmount <= 0) throw new ValidationError("Prix invalide.");
    if (requestKey !== undefined && !/^[A-Za-z0-9_-]{16,100}$/.test(requestKey))
      throw new ValidationError("Clé de commande invalide.");
    const values = {
      phoneNumber: body.phoneNumber, paymentPhone, contactPhone: body.contactPhone,
      units, price: targetAmount, currency, country, network, offerId: body.offerId,
      vendeurId: body.vendeurId, clientId: body.clientId, vendeurName: body.vendeurName,
      vendeurPhone: body.vendeurPhone, correspondent: correspondent.trim().toUpperCase(), description,
    };
    const digest = (value: string) => createHash("sha256").update(value).digest("hex");
    const checkoutKey = requestKey ? digest(requestKey) : undefined;
    const checkoutFingerprint = digest(JSON.stringify(values));
    await Order.init(); // The unique sparse index must exist before accepting a keyed checkout.
    const replay = async () => {
      const prior = await Order.findOne({ checkoutKey }).select("+checkoutFingerprint");
      if (!prior) throw new ConflictError("Cette commande est en cours. Réessayez avec la même référence.");
      if (prior.checkoutFingerprint !== checkoutFingerprint)
        throw new ConflictError("Cette référence correspond à une autre commande. Retrouvez son suivi avant de recommencer.");
      return { order: prior, payment: null, replayed: true };
    };
    if (checkoutKey && await Order.exists({ checkoutKey })) return replay();
    let order: any;
    try {
      order = await Order.create({ ...values, status: "PENDING", checkoutKey,
        checkoutFingerprint, paymentInitiationState: "starting", whatsappSent: false,
        whatsappProcessing: false, affiliateVersion: 0 });
    } catch (error: any) {
      if (checkoutKey && error.code === 11000) return replay();
      throw error;
    }
    const dto: CreateDepositDTO = {
      appId: process.env.CABUPAY_APP_ID || "CABUNETS", clientReference: String(order._id),
      amount: String(targetAmount), currency, phone: paymentPhone,
      correspondent: values.correspondent, country,
      callbackUrl: process.env.CABUPAY_CALLBACK_URL ||
        "https://cabunets-production.up.railway.app/api/payments/cabupay-callback",
      description: description || "Achat de " + units + " unités " + network,
    };
    let response: any;
    try { response = await cabupayPaymentService.createDeposit(dto); }
    catch {
      await Order.updateOne({ _id: order._id, status: "PENDING" },
        { $set: { paymentInitiationState: "unknown" }, $inc: { __v: 1 } });
      return { order: await Order.findById(order._id), payment: null, initializationUncertain: true };
    }
    const data = response?.data;
    const status = data?.status?.toUpperCase() || data?.pawaResponse?.status?.toUpperCase();
    if (status === "REJECTED" || status === "FAILED" || response?.success === false) {
      const reason = data?.pawaResponse?.failureReason || response?.message || "Paiement rejeté";
      order = await applyOrderPayment(String(order._id), "FAILED", { depositId: data?.depositId, failureReason: reason });
      // A confirmed callback wins over a late or contradictory initiation response.
      if (order.status !== "FAILED") return { order, payment: response };
      const error: any = new ValidationError(getPawapayError(reason?.failureCode) || "Paiement rejeté.");
      error.order = order; error.payment = response; throw error;
    }
    if (data?.depositId) {
      await Order.updateOne({ _id: order._id, status: "PENDING" },
        { $set: { depositId: data.depositId, depositExistence: "FOUND", paymentInitiationState: "accepted" },
          $inc: { __v: 1 } });
    }
    order = await Order.findById(order._id);
    // Final status is verified by the callback or an explicit status query.
    return { order, payment: response };
  }

  // ----------------------------------------------------------
  // LIST
  // ----------------------------------------------------------
  async getOrders(params: OrderListParams) {
    const { page = 1, limit = 50, ...filters } = params;

    const query = buildOrderQuery(filters);

    const pageNum = Math.max(1, page);
    const limitNum = Math.min(200, Math.max(1, limit));
    const skip = (pageNum - 1) * limitNum;

    const [data, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Order.countDocuments(query),
    ]);

    return {
      data,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }

  // ----------------------------------------------------------
  // STATS
  // ----------------------------------------------------------
  async getOrdersStats(filters: OrderFilters): Promise<OrderStats> {
    const query = buildOrderQuery(filters);

    const [agg] = await Order.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ["$status", "PENDING"] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] } },
          delivered: { $sum: { $cond: [{ $eq: ["$status", "DELIVERED"] }, 1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ["$status", "FAILED"] }, 1, 0] } },
          whatsappPending: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$status", "COMPLETED"] },
                    { $ne: ["$whatsappSent", true] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          ca: {
            $sum: {
              $cond: [
                { $in: ["$status", ["COMPLETED", "DELIVERED"]] },
                { $toDouble: "$price" },
                0,
              ],
            },
          },
        },
      },
    ]);

    return (
      agg ?? {
        total: 0,
        pending: 0,
        completed: 0,
        delivered: 0,
        failed: 0,
        whatsappPending: 0,
        ca: 0,
      }
    );
  }

  // ----------------------------------------------------------
  // GET ONE
  // ----------------------------------------------------------
  async getOrderById(id: string) {
    const order = await Order.findById(id);
    if (!order) {
      const err: any = new Error("Commande non trouvée");
      err.statusCode = 404;
      throw err;
    }
    return order;
  }

  // ----------------------------------------------------------
  // UPDATE
  // ----------------------------------------------------------
  async updateOrder(id: string, body: any) {
    if (body.status !== undefined) {
      const error: any = new Error("Utilisez les actions de livraison, annulation ou remboursement pour changer le statut.");
      error.statusCode = 400; throw error;
    }
    const order = await Order.findByIdAndUpdate(id, body, { new: true });
    if (!order) {
      const err: any = new Error("Commande non trouvée");
      err.statusCode = 404;
      throw err;
    }
    return order;
  }

  // ----------------------------------------------------------
  // DELETE
  // ----------------------------------------------------------
  async deleteOrder(id: string) {
    const result = await affiliateLifecycleService.reverseOrder(id, "CANCELLED", "Annulation administrateur.");
    return result.order;
  }

  // ----------------------------------------------------------
  // DELIVER
  // ----------------------------------------------------------
  async deliverOrder(id: string, actor: { userId: string; role: string }) {
    const target = await Order.findById(id);
    if (target && actor.role !== "admin" &&
        !(actor.role === "vendeur" && String(target.vendeurId) === actor.userId)) {
      const error: any = new Error("Seul le vendeur de cette commande ou un administrateur peut confirmer la livraison.");
      error.statusCode = 403;
      throw error;
    }
    const order = target;
    if (!order) {
      const err: any = new Error("Commande non trouvée");
      err.statusCode = 404;
      throw err;
    }

    // 🆕 Si déjà livrée → on ne fait rien
    if (order.status === "DELIVERED") {
      await this.triggerCommission(order);
      return order;
    }

    if (order.status !== "COMPLETED") {
      const err: any = new Error(
        `Impossible de livrer une commande avec le statut "${order.status}". Le statut doit être "COMPLETED"`
      );
      err.statusCode = 400;
      throw err;
    }

    const updated = await Order.findOneAndUpdate(
      { _id: id, status: "COMPLETED", ...(actor.role === "admin" ? {} : { vendeurId: actor.userId }) },
      { $set: { status: "DELIVERED", deliveredAt: new Date() }, $inc: { __v: 1 } },
      { new: true }
    );

    // Déclencher la commission
    if (updated) {
      await this.triggerCommission(updated);
    }

    if (!updated) {
      const current = await Order.findById(id);
      if (current?.status === "DELIVERED") {
        await this.triggerCommission(current);
        return current;
      }
      const error: any = new Error("La commande a changé. Veuillez actualiser.");
      error.statusCode = 409;
      throw error;
    }
    return updated;
  }
  // ----------------------------------------------------------
  // SYNC STATUS
  // ----------------------------------------------------------
  async syncOrderStatus(id: string) {
    const order = await Order.findById(id);
    if (!order) {
      const err: any = new Error("Commande introuvable");
      err.statusCode = 404;
      throw err;
    }

    if (order.status === "COMPLETED" || ["FAILED", "DELIVERED", "CANCELLED", "REFUNDED"].includes(order.status)) {
      return { order, payment: null, depositPaymentStatus: undefined };
    }

    if (!order.depositId) {
      return { order, payment: null, depositPaymentStatus: "INITIALIZING" };
    }

    const response = await cabupayPaymentService.getDeposit(order.depositId);
    const deposit = response.data;

    if (deposit?.status === "NOT_FOUND") {
      order.depositExistence = "NOT_FOUND";
      await Order.updateOne({ _id: id, status: "PENDING" }, { $set: { depositExistence: "NOT_FOUND" }, $inc: { __v: 1 } });
      return { order: (await Order.findById(id))!, payment: deposit, depositPaymentStatus: "NOT_FOUND" };
    }

    const depositData = deposit?.data;
    const paymentStatus = depositData?.status?.toUpperCase();
    const updated = await applyOrderPayment(id, paymentStatus || "PENDING", {
      depositId: order.depositId, providerTransactionId: depositData?.providerTransactionId,
      failureReason: depositData?.failureReason,
    }, "auto");

    return { order: updated, payment: deposit, depositPaymentStatus: paymentStatus };
  }

  // ----------------------------------------------------------
  // TRAIT ORDER
  // ----------------------------------------------------------
  async traitOrder(id: string) {
    const order = await Order.findById(id);
    if (!order) {
      const err: any = new Error("Commande introuvable");
      err.statusCode = 404;
      throw err;
    }

    if (
      order.status === "COMPLETED" ||
      order.status === "FAILED" ||
      ["DELIVERED", "CANCELLED", "REFUNDED"].includes(order.status)
    ) {
      return { order, payment: null, depositPaymentStatus: undefined };
    }

    if (!order.depositId) {
      return { order, payment: null, depositPaymentStatus: "INITIALIZING" };
    }

    const response = await cabupayPaymentService.getDeposit(order.depositId);
    const deposit = response.data;

    if (deposit?.status === "NOT_FOUND") {
      order.depositExistence = "NOT_FOUND";
      await Order.updateOne({ _id: id, status: "PENDING" }, { $set: { depositExistence: "NOT_FOUND" }, $inc: { __v: 1 } });
      return { order: (await Order.findById(id))!, payment: deposit, depositPaymentStatus: "NOT_FOUND" };
    }

    const depositData = deposit?.data;
    const paymentStatus = depositData?.status?.toUpperCase();
    const updated = await applyOrderPayment(id, paymentStatus || "PENDING", {
      depositId: order.depositId, providerTransactionId: depositData?.providerTransactionId,
      failureReason: depositData?.failureReason,
    }, "manuel");

    return { order: updated, payment: deposit, depositPaymentStatus: paymentStatus };
  }

  // ----------------------------------------------------------
  // SEND PENDING WHATSAPP
  // ----------------------------------------------------------
  async sendPendingWhatsAppMessages() {
    return await OrderNotificationService.sendAllPendingWhatsAppMessages();
  }
}

export const orderService = new OrderService();