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
    try {
      const referral = await Referral.findOne({ filleulId: order.clientId });
      if (!referral) {
        return; // pas de parrain → pas de commission
      }

      await commissionService.create({
        affiliateId: referral.affiliateId.toString(),
        referralId: referral._id.toString(),
        program: "affiliation_client",
        sourceType: "order",
        sourceId: order._id.toString(),
        eventId: `order_delivered_${order._id}`,
        orderAmount: Number(order.price) || 0,
        orderCurrency: order.currency,
      });

      console.log(`✅ Commission créée pour la commande ${order._id}`);
    } catch (err) {
      console.error("❌ Erreur création commission :", err);
    }
  }

  // ----------------------------------------------------------
  // CREATE
  // ----------------------------------------------------------
  async createOrder(body: any) {
    const {
      price, amount, paymentPhone, correspondent,
      currency = "USD", country = "COD",
      description, units, network,
    } = body;

    if (!paymentPhone || typeof paymentPhone !== "string" || !paymentPhone.trim()) {
      const err: any = new Error("Le numéro de téléphone pour le paiement (paymentPhone) est obligatoire.");
      err.statusCode = 400;
      throw err;
    }

    if (!correspondent || typeof correspondent !== "string" || !correspondent.trim()) {
      const err: any = new Error("Le moyen de paiement / opérateur (correspondent) est obligatoire.");
      err.statusCode = 400;
      throw err;
    }

    const targetAmount = price || amount;
    if (!targetAmount) {
      const err: any = new Error("Le prix de la commande (price) est obligatoire.");
      err.statusCode = 400;
      throw err;
    }

    const selectedCorrespondent = correspondent.trim().toUpperCase();

    const order = await Order.create({
      ...body,
      correspondent: selectedCorrespondent,
      country,
      currency,
      status: "PENDING",
    });

    const finalDescription =
      description ||
      `Achat de ${units || ""} unités ${network || ""} - Cmd #${order._id}`;

    const callbackUrl =
      process.env.CABUPAY_CALLBACK_URL ||
      "https://cabunets-production.up.railway.app/api/payments/cabupay-callback";

    const depositDTO: CreateDepositDTO = {
      appId: process.env.CABUPAY_APP_ID || "CABUNETS",
      clientReference: order._id.toString(),
      amount: targetAmount.toString(),
      currency,
      phone: paymentPhone,
      correspondent: selectedCorrespondent,
      country,
      callbackUrl,
      description: finalDescription,
    };

    const paymentResponse = await cabupayPaymentService.createDeposit(depositDTO);
    const paymentData = paymentResponse?.data;
    const depositId = paymentData?.depositId;

    if (depositId) {
      order.depositId = depositId;
      order.depositExistence = "FOUND";
    }

    const pawaStatus =
      paymentData?.status?.toUpperCase() ||
      paymentData?.pawaResponse?.status?.toUpperCase();
    const isRejected =
      pawaStatus === "REJECTED" ||
      pawaStatus === "FAILED" ||
      paymentResponse?.success === false;

    if (isRejected) {
      const failureObj = paymentData?.pawaResponse?.failureReason;
      const failureMsg =
        failureObj?.failureMessage ||
        paymentResponse?.message ||
        "Paiement rejeté par la passerelle";
      const failureCode = failureObj?.failureCode;

      order.status = "FAILED";
      order.failureCode = failureCode;
      order.failureReason = failureCode
        ? `${failureCode}: ${failureMsg}`
        : failureMsg;

      const messageError = getPawapayError(failureCode);
      await order.save();

      const err: any = new Error(messageError || `Échec de l'initialisation du paiement: ${failureMsg}`);
      err.statusCode = 400;
      err.order = order;
      err.payment = { success: false, message: failureMsg, data: paymentData };
      throw err;
    }

    await order.save();

    return { order, payment: paymentResponse };
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
    const order = await Order.findByIdAndDelete(id);
    if (!order) {
      const err: any = new Error("Commande non trouvée");
      err.statusCode = 404;
      throw err;
    }
    return order;
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
      { status: "DELIVERED", deliveredAt: new Date() },
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

    if (order.status === "COMPLETED" || order.status === "FAILED" || order.status === "DELIVERED") {
      return { order, payment: null, depositPaymentStatus: undefined };
    }

    if (!order.depositId) {
      const err: any = new Error("Aucun depositId (Cabupay) associé à cette commande.");
      err.statusCode = 400;
      err.order = order;
      throw err;
    }

    const response = await cabupayPaymentService.getDeposit(order.depositId);
    const deposit = response.data;

    if (deposit?.status === "NOT_FOUND") {
      order.depositExistence = "NOT_FOUND";
      await order.save();
      return { order, payment: deposit, depositPaymentStatus: "NOT_FOUND" };
    }

    order.depositExistence = "FOUND";

    const depositData = deposit?.data;
    const paymentStatus = depositData?.status?.toUpperCase();

    if (paymentStatus === "COMPLETED") {
      order.status = "COMPLETED";
    } else if (paymentStatus === "FAILED") {
      order.status = "FAILED";
      if (depositData?.failureReason?.failureMessage) {
        order.failureReason = depositData.failureReason.failureMessage;
        order.failureCode = depositData.failureCode;
      }
    }

    await order.save();

    return { order, payment: deposit, depositPaymentStatus: paymentStatus };
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
      order.status === "DELIVERED"
    ) {
      return { order, payment: null, depositPaymentStatus: undefined };
    }

    if (!order.depositId) {
      const err: any = new Error("Aucun depositId (Cabupay) associé à cette commande.");
      err.statusCode = 400;
      err.order = order;
      throw err;
    }

    const response = await cabupayPaymentService.getDeposit(order.depositId);
    const deposit = response.data;

    if (deposit?.status === "NOT_FOUND") {
      order.depositExistence = "NOT_FOUND";
      await order.save();
      return { order, payment: deposit, depositPaymentStatus: "NOT_FOUND" };
    }

    order.depositExistence = "FOUND";

    const depositData = deposit?.data;
    const paymentStatus = depositData?.status?.toUpperCase();

    if (paymentStatus === "COMPLETED") {
      order.status = "COMPLETED";
    } else if (paymentStatus === "FAILED") {
      order.status = "FAILED";
      if (depositData?.failureReason?.failureMessage) {
        order.failureReason = depositData.failureReason.failureMessage;
        order.failureCode = depositData.failureCode;
      }
    }

    if (OrderNotificationService.shouldSendNotification(order, paymentStatus)) {
      await OrderNotificationService.sendWhatsAppNotification(order, "manuel");
    }

    await order.save();

    return { order, payment: deposit, depositPaymentStatus: paymentStatus };
  }

  // ----------------------------------------------------------
  // SEND PENDING WHATSAPP
  // ----------------------------------------------------------
  async sendPendingWhatsAppMessages() {
    return await OrderNotificationService.sendAllPendingWhatsAppMessages();
  }
}

export const orderService = new OrderService();