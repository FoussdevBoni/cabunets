// services/orderNotificationService.ts
import { Order } from '../models/Order';
import { cabupayWhatsappService } from './cabupayWhatsappService';

export interface OrderNotificationResult {
  success: boolean;
  reason?: 'already_processed' | 'not_eligible' | 'concurrent_update' | 'send_failed' | 'order_not_found';
  order?: any;
}

export class OrderNotificationService {
  constructor() {}

  async sendOrderNotification(orderId: string): Promise<OrderNotificationResult> {
    try {
      const order = await Order.findById(orderId);
      
      if (!order) {
        console.log(`[OrderNotification] Commande #${orderId} introuvable`);
        return { success: false, reason: 'order_not_found' };
      }

      if (order.status !== 'COMPLETED') {
        console.log(`[OrderNotification] Commande #${orderId} non éligible (statut: ${order.status})`);
        return { success: false, reason: 'not_eligible' };
      }

      if (order.whatsappSent === true) {
        console.log(`[OrderNotification] Notification déjà envoyée pour #${orderId}`);
        return { success: false, reason: 'already_processed' };
      }

      // ✅ Verrouillage atomique
      const lockedOrder = await Order.findOneAndUpdate(
        {
          _id: orderId,
          status: 'COMPLETED',
          whatsappSent: { $ne: true },
          $or: [
            { whatsappProcessing: { $ne: true } },
            { whatsappProcessing: null },
            { whatsappProcessing: { $exists: false } }
          ]
        },
        {
          $set: {
            whatsappProcessing: true,
            whatsappProcessingAt: new Date()
          }
        },
        { new: true }
      );

      if (!lockedOrder) {
        const currentOrder = await Order.findById(orderId);
        if (currentOrder?.whatsappProcessing === true) {
          console.log(`[OrderNotification] Commande #${orderId} en cours de traitement`);
          return { success: false, reason: 'concurrent_update' };
        }
        console.log(`[OrderNotification] Commande #${orderId} déjà traitée`);
        return { success: false, reason: 'already_processed' };
      }

      console.log(`[OrderNotification] Début envoi pour la commande #${orderId}`);

      const orderRef = `CMD-${orderId.slice(-6).toUpperCase()}`;
      
      const sendResult = await cabupayWhatsappService.notifyNewOrder({
        vendeurName: lockedOrder.vendeurName || 'Vendeur',
        vendeurPhone: lockedOrder.vendeurPhone,
        orderRef: orderRef,
        network: lockedOrder.network,
        units: lockedOrder.units,
        price: lockedOrder.price,
        currency: lockedOrder.currency || 'FC',
        customerPhone: lockedOrder.phoneNumber,
      });

      if (!sendResult) {
        await Order.updateOne(
          { _id: orderId },
          { $set: { whatsappProcessing: false } }
        );
        console.error(`[OrderNotification] Échec d'envoi pour #${orderId}`);
        return { success: false, reason: 'send_failed' };
      }

      const updatedOrder = await Order.findOneAndUpdate(
        {
          _id: orderId,
          whatsappSent: { $ne: true },
          whatsappProcessing: true
        },
        {
          $set: {
            whatsappSent: true,
            whatsappSentAt: new Date(),
            whatsappProcessing: false
          }
        },
        { new: true }
      );

      if (!updatedOrder) {
        await Order.updateOne(
          { _id: orderId },
          { $set: { whatsappProcessing: false } }
        );
        console.warn(`[OrderNotification] Conflit détecté pour #${orderId}`);
        return { success: false, reason: 'concurrent_update' };
      }

      console.log(`✅ Notification envoyée avec succès pour #${orderId}`);
      return { success: true, order: updatedOrder };

    } catch (error: any) {
      console.error(`❌ Erreur sendOrderNotification #${orderId}:`, error);
      
      try {
        await Order.updateOne(
          { _id: orderId },
          { $set: { whatsappProcessing: false } }
        );
      } catch (cleanupError) {
        console.error(`❌ Erreur cleanup #${orderId}:`, cleanupError);
      }
      
      throw error;
    }
  }

  async cleanupStuckProcessing(): Promise<number> {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      
      const result = await Order.updateMany(
        {
          whatsappProcessing: true,
          whatsappProcessingAt: { $lt: fiveMinutesAgo }
        },
        {
          $set: {
            whatsappProcessing: false,
            whatsappProcessingStuckAt: new Date()
          }
        }
      );

      if (result.modifiedCount > 0) {
        console.log(`🧹 Nettoyage: ${result.modifiedCount} verrous bloqués libérés`);
      }

      return result.modifiedCount;
    } catch (error) {
      console.error('❌ Erreur nettoyage verrous:', error);
      throw error;
    }
  }

  async sendPendingNotifications(): Promise<{
    total: number;
    sent: number;
    failed: number;
    alreadySent: number;
    notEligible: number;
  }> {
    try {
      // ✅ Correction : un seul objet avec un seul $or
      const pendingOrders = await Order.find({
        status: 'COMPLETED',
        whatsappSent: { $ne: true },
        $or: [
          { whatsappProcessing: { $ne: true } },
          { whatsappProcessing: null },
          { whatsappProcessing: { $exists: false } }
        ]
      });

      if (pendingOrders.length === 0) {
        return {
          total: 0,
          sent: 0,
          failed: 0,
          alreadySent: 0,
          notEligible: 0
        };
      }

      let sentCount = 0;
      let failedCount = 0;
      let alreadySentCount = 0;
      let notEligibleCount = 0;

      for (const order of pendingOrders) {
        try {
          const result = await this.sendOrderNotification(order._id.toString());

          if (result.success) {
            sentCount++;
          } else if (result.reason === 'already_processed') {
            alreadySentCount++;
          } else if (result.reason === 'not_eligible') {
            notEligibleCount++;
          } else {
            failedCount++;
          }
        } catch (error: any) {
          failedCount++;
          console.error(`❌ Échec pour #${order._id}:`, error.message);
        }
      }

      return {
        total: pendingOrders.length,
        sent: sentCount,
        failed: failedCount,
        alreadySent: alreadySentCount,
        notEligible: notEligibleCount
      };

    } catch (error: any) {
      console.error('❌ Erreur sendPendingNotifications:', error);
      throw error;
    }
  }
}

export const orderNotificationService = new OrderNotificationService();