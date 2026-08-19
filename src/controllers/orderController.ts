import { Request, Response } from 'express';
import { Order } from '../models/Order';
import { cabupayPaymentService, CreateDepositDTO } from '../services/cabupayPaymentService';
import { getPawapayError } from '../utils/getPawapayErrors';
import { orderNotificationService } from '../services/orderNotificationService';

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

    // 3. Création de la commande en BDD
    const order = await Order.create({
      ...req.body,
      correspondent: selectedCorrespondent,
      country,
      currency,
      status: 'PENDING',
    });

    // 4. Nettoyage et formattage pour compatibilité opérateur (Airtel COD / Vodacom)
    // - Limite la clientReference à 18-20 caractères alphanumériques
    const safeClientReference = order._id.toString().slice(-18);

    // - Supprime les espaces, accents et caractères spéciaux de la description
    const rawDescription = description || `Achat${units || ''}${network || ''}`;
    const cleanDescription = rawDescription
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]/g, '')
      .slice(0, 20);

    const finalDescription = cleanDescription || `Cmd${safeClientReference}`;

    // 5. Construction du DTO Cabupay / PawaPay
    const callbackUrl = process.env.CABUPAY_CALLBACK_URL || 'https://cabunets-production.up.railway.app/api/payments/cabupay-callback';

    const depositDTO: CreateDepositDTO = {
      appId: process.env.CABUPAY_APP_ID || 'CABUNETS',
      clientReference: safeClientReference, // <= Raccourci pour respecter la limite Airtel RDC (<= 20 chars)
      amount: targetAmount.toString(),
      currency: currency,
      phone: paymentPhone,
      correspondent: selectedCorrespondent,
      country: country,
      callbackUrl: callbackUrl,
      description: finalDescription, // <= Chaîne épurée sans accents ni espaces
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
      const failureObj = paymentData?.pawaResponse?.failureReason;
      const failureMsg = failureObj?.failureMessage || paymentResponse?.message || 'Paiement rejeté par la passerelle';
      const failureCode = failureObj?.failureCode;

      order.status = 'FAILED';
      order.failureCode = failureCode;
      order.failureReason = failureCode ? `${failureCode}: ${failureMsg}` : failureMsg;
      const messageError = getPawapayError(failureCode);
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
 * Marquer une commande comme livrée (DELIVERED)
 * Uniquement si le statut actuel est "COMPLETED"
 */
export const deliverOrder = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;

    // Récupérer la commande
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    // Vérifier que le statut actuel est "COMPLETED"
    if (order.status !== 'COMPLETED') {
      return res.status(400).json({
        error: `Impossible de livrer une commande avec le statut "${order.status}". Le statut doit être "COMPLETED"`
      });
    }

    // Mettre à jour le statut vers "DELIVERED"
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      {
        status: 'DELIVERED',
        deliveredAt: new Date()
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Commande marquée comme livrée avec succès',
      order: updatedOrder
    });

  } catch (err: any) {
    console.error('Erreur deliverOrder:', err);
    return res.status(500).json({
      error: 'Erreur lors de la mise à jour de la commande'
    });
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
    const response = await cabupayPaymentService.getDeposit(order.depositId);
    const deposit = response.data;

    // 3. Cas NOT_FOUND : Le dépôt n'existe pas chez Cabupay
    if (deposit?.status === 'NOT_FOUND') {
      order.depositExistence = 'NOT_FOUND';
      await order.save();

      return res.json({
        status: order.status,
        depositExistence: order.depositExistence,
        order,
        payment: deposit
      });
    }

    // 4. Cas FOUND : Le dépôt existe chez Cabupay
    order.depositExistence = 'FOUND';

    const depositData = deposit?.data;
    const paymentStatus = depositData?.status?.toUpperCase();

    // Mises à jour des statuts finaux uniquement
    if (paymentStatus === 'COMPLETED') {
      order.status = 'COMPLETED';
    } else if (paymentStatus === 'FAILED') {
      order.status = 'FAILED';
      if (depositData?.failureReason?.failureMessage) {
        order.failureReason = depositData.failureReason.failureMessage;
        order.failureCode = depositData.failureCode;
      }
    }

    // 5. Envoi de la notification WhatsApp UNIQUEMENT si :
    //    - Le paiement est COMPLETED
    //    - ET que le message n'a PAS encore été envoyé (!order.whatsappSent)
    if (paymentStatus === 'COMPLETED' && !order.whatsappSent) {
      try {
        // ✅ Utiliser le service atomique
        const result = await orderNotificationService.sendOrderNotification(order._id.toString());
        
        if (result.success) {
          console.log(`✅ Notification envoyée avec succès pour la commande #${order._id}`);
        } else {
          console.log(`ℹ️ Notification non envoyée pour #${order._id}: ${result.reason}`);
        }
      } catch (whatsappError: any) {
        console.error(`❌ Échec d'envoi de notification pour la commande #${order._id}:`, whatsappError.message);
        // On ne bloque pas la mise à jour de la commande
      }
    }

    await order.save();

    return res.json({
      status: order.status,
      depositExistence: order.depositExistence,
      depositPaymentStatus: paymentStatus,
      order,
      payment: deposit
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

    // 1. Récupération de la commande
    const order = await Order.findById(targetId);
    if (!order) {
      return res.status(404).json({ error: 'Commande introuvable' });
    }

    // Si la commande est déjà dans un état final, on renvoie immédiatement
    if (order.status === 'COMPLETED' || order.status === 'FAILED' || order.status === 'DELIVERED') {
      return res.json({
        status: order.status,
        depositExistence: order.depositExistence,
        order
      });
    }

    // Vérification du depositId
    if (!order.depositId) {
      return res.status(400).json({
        error: "Aucun depositId (Cabupay) associé à cette commande.",
        order,
      });
    }

    // 2. Appel du service Cabupay
    const response = await cabupayPaymentService.getDeposit(order.depositId);
    const deposit = response.data;

    // 3. Cas où le dépôt n'existe pas chez Cabupay
    if (deposit?.status === 'NOT_FOUND') {
      order.depositExistence = 'NOT_FOUND';
      await order.save();

      return res.json({
        status: order.status,
        depositExistence: order.depositExistence,
        order,
        payment: deposit
      });
    }

    // 4. Le dépôt existe
    order.depositExistence = 'FOUND';

    const depositData = deposit?.data;
    const paymentStatus = depositData?.status?.toUpperCase();

    // 5. Mise à jour du statut si final
    if (paymentStatus === 'COMPLETED') {
      order.status = 'COMPLETED';
    } else if (paymentStatus === 'FAILED') {
      order.status = 'FAILED';
      if (depositData?.failureReason?.failureMessage) {
        order.failureReason = depositData.failureReason.failureMessage;
        order.failureCode = depositData.failureCode;
      }
    }

    // 6. Envoi de la notification WhatsApp UNIQUEMENT si :
    //    - Le paiement est COMPLETED
    //    - ET que le message n'a PAS encore été envoyé (!order.whatsappSent)
    if (paymentStatus === 'COMPLETED' && !order.whatsappSent) {
      try {
        // ✅ Utiliser le service atomique
        const result = await orderNotificationService.sendOrderNotification(order._id.toString());
        
        if (result.success) {
          console.log(`✅ Notification envoyée avec succès pour la commande #${order._id}`);
        } else {
          console.log(`ℹ️ Notification non envoyée pour #${order._id}: ${result.reason}`);
        }
      } catch (whatsappError: any) {
        console.error(`❌ Échec d'envoi de notification pour la commande #${order._id}:`, whatsappError.message);
        // order.whatsappSent reste false pour réessayer plus tard
      }
    }

    await order.save();

    // 7. Retour de la réponse
    return res.json({
      status: order.status,
      depositExistence: order.depositExistence,
      depositPaymentStatus: paymentStatus,
      order,
      payment: deposit
    });

  } catch (err: any) {
    console.error('❌ Erreur traitOrder:', err.message || err);
    return res.status(500).json({
      error: 'Erreur lors de la synchronisation du statut avec Cabupay',
      details: err.message || err,
    });
  }
};

/**
 * Envoie les messages WhatsApp pour toutes les commandes COMPLETED
 * dont le message n'a pas encore été envoyé
 * Endpoint: GET /api/orders/send-pending-whatsapp
 */
export const sendPendingWhatsAppMessages = async (req: Request, res: Response): Promise<Response> => {
  try {
    // ✅ Utiliser le service pour envoyer toutes les notifications en attente
    const result = await orderNotificationService.sendPendingNotifications();

    return res.status(200).json({
      success: true,
      message: 'Traitement terminé',
      total: result.total,
      sent: result.sent,
      failed: result.failed,
      alreadySent: result.alreadySent,
      notEligible: result.notEligible
    });

  } catch (err: any) {
    console.error('❌ Erreur sendPendingWhatsAppMessages:', err.message);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'envoi des messages',
      details: err.message
    });
  }
};