import { Request, Response } from 'express';
import { Order } from '../models/Order';
import { cabupayPaymentService, CreateDepositDTO } from '../services/cabupayPaymentService';

/**
 * Création de la commande PENDING + Initiation du paiement Cabupay (RDC)
 */
export const createOrder = async (req: Request, res: Response): Promise<Response> => {
  try {
    const {
      price,
      amount,
      paymentPhone,
      currency = 'USD',
      country = 'COD',
      description,
      units,
      network,
    } = req.body;

    // 1. Validation stricte du numéro de paiement (aucun fallback autorisé)
    if (!paymentPhone || typeof paymentPhone !== 'string' || !paymentPhone.trim()) {
      return res.status(400).json({
        error: 'Le numéro de téléphone pour le paiement (paymentPhone) est obligatoire.',
      });
    }

    const targetAmount = price || amount;
    if (!targetAmount) {
      return res.status(400).json({
        error: 'Le prix de la commande (price) est obligatoire.',
      });
    }

    // 2. Prédiction dynamique du réseau Mobile Money exclusivement sur paymentPhone
    let selectedCorrespondent: string | undefined = undefined;

    try {
      const predictionRes = await cabupayPaymentService.predictCorrespondent(paymentPhone);
      if (predictionRes?.success && predictionRes?.data?.correspondent) {
        selectedCorrespondent = predictionRes.data.correspondent;
      }
    } catch (predictErr: any) {
      console.warn(`⚠️ Échec prédiction réseau pour ${paymentPhone}:`, predictErr?.message || predictErr);
    }

    // Fallback par défaut si Cabupay ne prédit rien
    if (!selectedCorrespondent) {
      selectedCorrespondent = 'MPESA_COD';
    }

    // 3. Création de la commande en BDD avec le bon correspondent
    const order = await Order.create({
      ...req.body,
      correspondent: selectedCorrespondent,
      country,
      currency,
      status: 'PENDING',
    });

    // 4. Description dynamique explicite
    const finalDescription = description || `Achat de ${units || ''} unités ${network || ''} - Cmd #${order._id}`;

    // 5. Construction du DTO Cabupay avec le paymentPhone strict
    const callbackUrl = process.env.CABUPAY_CALLBACK_URL || 'https://cabunets-production.up.railway.app/api/payments/cabupay-callback';

    const depositDTO: CreateDepositDTO = {
      appId: process.env.CABUPAY_APP_ID || 'CABUNETS',
      clientReference: order._id.toString(),
      amount: targetAmount.toString(),
      currency: currency,
      phone: paymentPhone,
      correspondent: selectedCorrespondent,
      country: country,
      callbackUrl: callbackUrl,
      description: finalDescription,
    };

    // 6. Initiation de la demande de dépôt
    const paymentResponse = await cabupayPaymentService.createDeposit(depositDTO);

    // 7. Enregistrement du depositId
    const depositId = paymentResponse?.data?.depositId;

    if (depositId) {
      order.depositId = depositId;
      await order.save();
    }

    return res.status(201).json({
      success: true,
      message: 'Commande créée et paiement initialisé',
      order,
      payment: paymentResponse,
    });

  } catch (err: any) {
    console.error('❌ Erreur createOrder:', err.message || err);
    return res.status(500).json({
      error: 'Erreur lors de la création de la commande ou de l\'initiation du paiement',
      details: err.message || err,
    });
  }
};
/**
 * Récupération des commandes avec filtres temporels
 */
export const getOrders = async (req: Request, res: Response): Promise<Response> => {
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

    const orders = await Order.find(query).sort({ createdAt: -1 });
    return res.json(orders);
  } catch (err: any) {
    return res.status(500).json({ error: 'Erreur lors de la récupération des commandes' });
  }
};

/**
 * Récupérer une commande par son ID
 */
export const getOrderById = async (req: Request, res: Response): Promise<Response> => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Commande non trouvée' });
    return res.json(order);
  } catch (err: any) {
    return res.status(500).json({ error: 'Erreur lors de la récupération de la commande' });
  }
};

/**
 * Mettre à jour une commande
 */
export const updateOrder = async (req: Request, res: Response): Promise<Response> => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!order) return res.status(404).json({ error: 'Commande non trouvée' });
    return res.json(order);
  } catch (err: any) {
    return res.status(500).json({ error: 'Erreur lors de la mise à jour de la commande' });
  }
};

/**
 * Supprimer une commande
 */
export const deleteOrder = async (req: Request, res: Response): Promise<Response> => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ error: 'Commande non trouvée' });
    return res.json({ message: 'Commande supprimée avec succès' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Erreur lors de la suppression de la commande' });
  }
};