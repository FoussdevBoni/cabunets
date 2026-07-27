import { Request, Response } from 'express';
import { Order } from '../models/Order';
import { cabupayWhatsappService } from '../services/cabupayWhatsappService';


export const createOrder = async (req: Request, res: Response) => {
  try {
    // 1. Création de la commande en base
    const order = await Order.create(req.body);

    // 2. Notification WhatsApp du vendeur via le microservice cabupay
    // Exécution en tâche de fond pour ne pas bloquer la réponse de création de commande
    cabupayWhatsappService
      .notifyNewOrder({
        vendeurName: order.vendeurName || 'Vendeur',
        vendeurPhone:  order.phoneNumber,
        orderRef: `CMD-${order._id.toString().slice(-6).toUpperCase()}`,
        network: order.network,
        units: order.units,
        price: order.price,
        currency: order.currency || 'FC',
        customerPhone: order.phoneNumber,
      })
      .catch((err: any) =>
        console.error('❌ Erreur lors de l\'envoi WhatsApp asynchrone:', err)
      );

    // 3. Retour de la commande créée
    res.status(201).json({
      success: true,
      order,
    });
  } catch (err: any) {
    res.status(500).json({
      error: 'Erreur lors de la création du order',
      details: err.message || err,
    });
  }
};

export const getOrders = async (req: Request, res: Response) => {
  try {
    const { day, week, month, year, ...filters } = req.query;

    let query: any = { ...filters };

    if (day || week || month || year) {
      const now = new Date();
      let start: Date | null = null;
      let end: Date | null = null;

      if (day) {
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      } else if (week) {
        const dayOfWeek = now.getDay();
        start = new Date(now);
        start.setDate(now.getDate() - dayOfWeek);
        start.setHours(0, 0, 0, 0);

        end = new Date(start);
        end.setDate(start.getDate() + 7);
      } else if (month) {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      } else if (year) {
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear() + 1, 0, 1);
      }

      if (start && end) {
        query.createdAt = { $gte: start, $lt: end };
      }
    }

    const orders = await Order.find(query);
    res.json(orders);
  } catch (err) {
    res
      .status(500)
      .json({ error: 'Erreur lors de la récupération des orders' });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order non trouvé' });
    res.json(order);
  } catch (err) {
    res
      .status(500)
      .json({ error: 'Erreur lors de la récupération du order' });
  }
};

export const updateOrder = async (req: Request, res: Response) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!order) return res.status(404).json({ error: 'Order non trouvé' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour du order' });
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order non trouvé' });
    res.json({ message: 'Order supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la suppression du order' });
  }
};