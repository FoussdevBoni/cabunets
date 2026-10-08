// controllers/orderController.ts
import { Request, Response } from "express";
import { orderService, OrderFilters } from "../services/orderService";

// Helper pour parser les filtres communs
function parseFilters(req: Request): OrderFilters {
  const {
    status, vendeurId, clientId, network, search,
    day, week, month, year, startDate, endDate,
  } = req.query;

  return {
    status: status as string,
    vendeurId: vendeurId as string,
    clientId: clientId as string,
    network: network as string,
    search: search as string,
    day: day === "true" || day === "1",
    week: week === "true" || week === "1",
    month: month === "true" || month === "1",
    year: year === "true" || year === "1",
    startDate: startDate as string,
    endDate: endDate as string,
  };
}

// ================= CREATE =================
export const createOrder = async (req: Request, res: Response): Promise<Response> => {
  try {
    const result = await orderService.createOrder(req.body);
    return res.status(201).json({
      success: true,
      message: "Commande créée et paiement initialisé",
      ...result,
    });
  } catch (err: any) {
    console.error("❌ Erreur createOrder:", err.message || err);

    // Erreur applicative (400) avec order + payment
    if (err.statusCode && err.order) {
      return res.status(err.statusCode).json({
        success: false,
        error: err.message,
        order: err.order,
        payment: err.payment,
      });
    }

    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: err.message });
    }

    return res.status(500).json({
      error: "Erreur lors de la création de la commande ou de l'initiation du paiement",
      details: err.message || err,
    });
  }
};

// ================= LIST (pagination + filtres) =================
export const getOrders = async (req: Request, res: Response): Promise<Response> => {
  try {
    const filters = parseFilters(req);
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 50;

    const result = await orderService.getOrders({ ...filters, page, limit });
    return res.json(result);
  } catch (err: any) {
    console.error("getOrders error:", err);
    return res.status(500).json({ error: "Erreur lors de la récupération des commandes" });
  }
};

// ================= STATS =================
export const getOrdersStats = async (req: Request, res: Response): Promise<Response> => {
  try {
    const filters = parseFilters(req);
    const stats = await orderService.getOrdersStats(filters);
    return res.json(stats);
  } catch (err: any) {
    console.error("getOrdersStats error:", err);
    return res.status(500).json({ error: "Erreur lors du calcul des statistiques" });
  }
};

// ================= GET ONE =================
export const getOrderById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const order = await orderService.getOrderById(req.params.id);
    return res.json(order);
  } catch (err: any) {
    if (err.statusCode === 404) return res.status(404).json({ error: err.message });
    return res.status(500).json({ error: "Erreur lors de la récupération de la commande" });
  }
};

// ================= UPDATE =================
export const updateOrder = async (req: Request, res: Response): Promise<Response> => {
  try {
    const order = await orderService.updateOrder(req.params.id, req.body);
    return res.json(order);
  } catch (err: any) {
    if (err.statusCode === 404) return res.status(404).json({ error: err.message });
    return res.status(500).json({ error: "Erreur lors de la mise à jour de la commande" });
  }
};

// ================= DELETE =================
export const deleteOrder = async (req: Request, res: Response): Promise<Response> => {
  try {
    await orderService.deleteOrder(req.params.id);
    return res.json({ message: "Commande supprimée avec succès" });
  } catch (err: any) {
    if (err.statusCode === 404) return res.status(404).json({ error: err.message });
    return res.status(500).json({ error: "Erreur lors de la suppression de la commande" });
  }
};

// ================= DELIVER =================
export const deliverOrder = async (req: Request, res: Response): Promise<Response> => {
  try {
    const order = await orderService.deliverOrder(req.params.id);
    return res.status(200).json({
      success: true,
      message: "Commande marquée comme livrée avec succès",
      order,
    });
  } catch (err: any) {
    if (err.statusCode === 404) return res.status(404).json({ error: err.message });
    if (err.statusCode === 400) return res.status(400).json({ error: err.message });
    console.error("Erreur deliverOrder:", err);
    return res.status(500).json({ error: "Erreur lors de la mise à jour de la commande" });
  }
};

// ================= SYNC STATUS =================
export const syncOrderStatus = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id, orderId } = req.params;
    const targetId = id || orderId;
    const result = await orderService.syncOrderStatus(targetId);

    return res.json({
      status: result.order.status,
      depositExistence: result.order.depositExistence,
      depositPaymentStatus: result.depositPaymentStatus,
      order: result.order,
      payment: result.payment,
    });
  } catch (err: any) {
    if (err.statusCode === 404) return res.status(404).json({ error: err.message });
    if (err.statusCode === 400) {
      return res.status(400).json({ error: err.message, order: err.order });
    }
    console.error("❌ Erreur syncOrderStatus:", err.message || err);
    return res.status(500).json({
      error: "Erreur lors de la synchronisation du statut avec Cabupay",
      details: err.message || err,
    });
  }
};

// ================= TRAIT ORDER =================
export const traitOrder = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id, orderId } = req.params;
    const targetId = id || orderId;
    const result = await orderService.traitOrder(targetId);

    return res.json({
      status: result.order.status,
      depositExistence: result.order.depositExistence,
      depositPaymentStatus: result.depositPaymentStatus,
      order: result.order,
      payment: result.payment,
    });
  } catch (err: any) {
    if (err.statusCode === 404) return res.status(404).json({ error: err.message });
    if (err.statusCode === 400) {
      return res.status(400).json({ error: err.message, order: err.order });
    }
    console.error("❌ Erreur traitOrder:", err.message || err);
    return res.status(500).json({
      error: "Erreur lors de la synchronisation du statut avec Cabupay",
      details: err.message || err,
    });
  }
};

// ================= SEND PENDING WHATSAPP =================
export const sendPendingWhatsAppMessages = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const result = await orderService.sendPendingWhatsAppMessages();

    if (result.total === 0) {
      return res.status(200).json({
        success: true,
        message: "Aucune commande en attente d'envoi WhatsApp",
        total: 0,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Traitement terminé",
      total: result.total,
      sent: result.sent,
      failed: result.failed,
    });
  } catch (err: any) {
    console.error("❌ Erreur:", err.message);
    return res.status(500).json({
      success: false,
      error: "Erreur lors de l'envoi des messages",
      details: err.message,
    });
  }
};