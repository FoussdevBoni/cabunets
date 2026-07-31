import { Request, Response } from 'express';
import { Order } from '../models/Order'; // Ajuste le chemin selon ton projet
import { cabupayPaymentService, CreateDepositDTO } from '../services/cabupayPaymentService'; // Ajuste le chemin
import { cabupayWhatsappService } from '../services/cabupayWhatsappService';
import { getPawapayError } from '../utils/getPawapayErrors';



export const createOrder = async (req: Request, res: Response): Promise<Response> => {
  try {
    const {
      price,
      amount,
      paymentPhone,
      correspondent,
      currency = 'USD',
      country = 'COD',
      description,
      units,
      network,
    } = req.body;

    // 1. Validation stricte des données requises pour le paiement
    if (!paymentPhone || typeof paymentPhone !== 'string' || !paymentPhone.trim()) {
      return res.status(400).json({
        error: 'Le numéro de téléphone pour le paiement (paymentPhone) est obligatoire.',
      });
    }

    if (!correspondent || typeof correspondent !== 'string' || !correspondent.trim()) {
      return res.status(400).json({
        error: 'Le moyen de paiement / opérateur (correspondent) est obligatoire.',
      });
    }

    const targetAmount = price || amount;
    if (!targetAmount) {
      return res.status(400).json({
        error: 'Le prix de la commande (price) est obligatoire.',
      });
    }

    // 2. Opérateur de paiement transmis directement par le client
    const selectedCorrespondent = correspondent.trim().toUpperCase();

    // 3. Création de la commande en BDD avec le moyen de paiement choisi
    const order = await Order.create({
      ...req.body,
      correspondent: selectedCorrespondent,
      country,
      currency,
      status: 'PENDING',
    });

    // 4. Description dynamique
    const finalDescription = description || `Achat de ${units || ''} unités ${network || ''} - Cmd #${order._id}`;

    // 5. Construction du DTO Cabupay
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

    // Extraction des informations clés du retour paiement
    const paymentData = paymentResponse?.data;
    const depositId = paymentData?.depositId;

    if (depositId) {
      order.depositId = depositId;
      order.depositExistence = 'FOUND';
    }

    // 7. Vérification d'un rejet ou échec synchrone (REJECTED / FAILED / success = false)
    const pawaStatus = paymentData?.status?.toUpperCase() || paymentData?.pawaResponse?.status?.toUpperCase();
    const isRejected = pawaStatus === 'REJECTED' || pawaStatus === 'FAILED' || paymentResponse?.success === false;

    if (isRejected) {
      // Extraction du message d'erreur précis renvoyé par PawaPay/Cabupay
      const failureObj = paymentData?.pawaResponse?.failureReason;
      const failureMsg = failureObj?.failureMessage || paymentResponse?.message || 'Paiement rejeté par la passerelle';
      const failureCode = failureObj?.failureCode;

      order.status = 'FAILED';
      order.failureReason = failureCode ? `${failureCode}: ${failureMsg}` : failureMsg;
      const messageError = getPawapayError(failureCode)
      await order.save();

      return res.status(400).json({
        success: false,
        error: messageError || `Échec de l'initialisation du paiement: ${failureMsg}`,
        order,
        payment: {
          success: false,
          message: failureMsg,
          data: paymentData,
        },
      });
    }

    // 8. Succès de l'initialisation (statut ACCEPTED ou PROCESSING)
    await order.save();

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



/**
 * Vérifie le statut d'une transaction auprès de Cabupay et met à jour la commande en BDD
 * Endpoint: GET /api/orders/:id/sync-status (ou /api/orders/:orderId/sync-status)
 */
export const syncOrderStatus = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id, orderId } = req.params;
    const targetId = id || orderId;

    // 1. Récupération de la commande Mongoose
    const order = await Order.findById(targetId);
    if (!order) {
      return res.status(404).json({ error: 'Commande introuvable' });
    }

    // Si la commande est déjà terminée localement, on ne re-synchronise pas
    if (order.status === 'COMPLETED' || order.status === 'FAILED') {
      return res.json({ 
        status: order.status, 
        depositExistence: order.depositExistence,
        order 
      });
    }

    // Vérification de la présence du depositId
    if (!order.depositId) {
      return res.status(400).json({
        error: "Aucun depositId (Cabupay) associé à cette commande.",
        order,
      });
    }

    // 2. Appel de l'API externe
    const paymentResponse = await cabupayPaymentService.getDeposit(order.depositId);

    // 3. Cas NOT_FOUND : Le dépôt n'existe pas chez Cabupay
    if (paymentResponse?.status === 'NOT_FOUND') {
      order.depositExistence = 'NOT_FOUND';
      await order.save();

      return res.json({
        status: order.status, // Reste PENDING
        depositExistence: order.depositExistence, // NOT_FOUND
        order,
        payment: paymentResponse
      });
    }

    // 4. Cas FOUND : Le dépôt existe chez Cabupay
    order.depositExistence = 'FOUND';
    
    const depositData = paymentResponse?.data;
    const paymentStatus = depositData?.status?.toUpperCase();

    // Mises à jour des statuts finaux uniquement
    if (paymentStatus === 'COMPLETED') {
      order.status = 'COMPLETED';
    } else if (paymentStatus === 'FAILED') {
      order.status = 'FAILED';
      if (depositData?.failureReason?.failureMessage) {
        order.failureReason = depositData.failureReason.failureMessage;
      }
    }
    // Pour ACCEPTED, PROCESSING, IN_RECONCILIATION -> order.status reste PENDING

    await order.save();

    return res.json({
      status: order.status,
      depositExistence: order.depositExistence,
      depositPaymentStatus: paymentStatus,
      order,
      payment: paymentResponse
    });

  } catch (err: any) {
    console.error('❌ Erreur syncOrderStatus:', err.message || err);
    return res.status(500).json({
      error: 'Erreur lors de la synchronisation du statut avec Cabupay',
      details: err.message || err,
    });
  }
};


/**
 * Vérifie le statut d'une transaction auprès de Cabupay,
 * met à jour la commande en BDD et envoie un message au vendeur s'il s'agit d'une nouvelle validation.
 * Endpoint: GET /api/orders/traite-order/:orderId 
 */
export const traitOrder = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id, orderId } = req.params;
    const targetId = id || orderId;

    // 1. Récupération de la commande Mongoose
    const order = await Order.findById(targetId);
    if (!order) {
      return res.status(404).json({ error: 'Commande introuvable' });
    }

    // Si la commande est déjà dans un état final en BDD, on renvoie immédiatement le résultat
    if (order.status === 'COMPLETED' || order.status === 'FAILED') {
      return res.json({ 
        status: order.status, 
        depositExistence: order.depositExistence,
        order 
      });
    }

    // Vérification de la présence du depositId Cabupay
    if (!order.depositId) {
      return res.status(400).json({
        error: "Aucun depositId (Cabupay) associé à cette commande.",
        order,
      });
    }

    // 2. Appel du service Cabupay avec le depositId
    const paymentResponse = await cabupayPaymentService.getDeposit(order.depositId);

    // 3. Traitement du cas NOT_FOUND (Le dépôt n'existe pas chez Cabupay)
    if (paymentResponse?.status === 'NOT_FOUND') {
      order.depositExistence = 'NOT_FOUND';
      await order.save();

      return res.json({
        status: order.status, // Reste PENDING
        depositExistence: order.depositExistence, // NOT_FOUND
        order,
        payment: paymentResponse
      });
    }

    // 4. Traitement du cas FOUND (Le dépôt existe chez Cabupay)
    order.depositExistence = 'FOUND';

    const depositData = paymentResponse?.data;
    const paymentStatus = depositData?.status?.toUpperCase();

    // 5. Mise à jour de l'état en BDD uniquement si le statut est final (COMPLETED ou FAILED)
    if (paymentStatus === 'COMPLETED') {
      order.status = 'COMPLETED';
    } else if (paymentStatus === 'FAILED') {
      order.status = 'FAILED';
      if (depositData?.failureReason?.failureMessage) {
        order.failureReason = depositData.failureReason.failureMessage;
      }
    }

    await order.save();

    // 6. Notification WhatsApp (uniquement si le paiement vient d'être validé en COMPLETED)
    if (paymentStatus === 'COMPLETED') {
      cabupayWhatsappService
        .notifyNewOrder({
          vendeurName: order.vendeurName || 'Vendeur',
          vendeurPhone: order.vendeurPhone,
          orderRef: `CMD-${order._id.toString().slice(-6).toUpperCase()}`,
          network: order.network,
          units: order.units,
          price: order.price,
          currency: order.currency || 'FC',
          customerPhone: order.phoneNumber,
        })
        .catch((err) => {
          console.error(`[WhatsApp Error] Échec de notification pour commande #${order._id}:`, err.message || err);
        });
    }

    // 7. Retour de la commande mise à jour
    return res.json({
      status: order.status,
      depositExistence: order.depositExistence,
      depositPaymentStatus: paymentStatus,
      order,
      payment: paymentResponse
    });

  } catch (err: any) {
    console.error('❌ Erreur traitOrder:', err.message || err);
    return res.status(500).json({
      error: 'Erreur lors de la synchronisation du statut avec Cabupay',
      details: err.message || err,
    });
  }
};



