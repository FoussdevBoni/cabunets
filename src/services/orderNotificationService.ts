// services/orderNotificationService.ts
import { Order } from '../models/Order';
import { cabupayWhatsappService } from './cabupayWhatsappService';

export interface OrderNotificationParams {
  orderId: string;
  vendeurName: string;
  vendeurPhone: string;
  network: string;
  units: number;
  price: number;
  currency: string;
  customerPhone: string;
}

export class OrderNotificationService {
  /**
   * Envoie une notification WhatsApp pour une commande
   * Met à jour la commande en base de données
   * @param order - L'ordre Mongoose
   * @returns boolean - True si le message a été envoyé, false sinon
   */
  static async sendWhatsAppNotification(order: any): Promise<boolean> {
    try {
      // Vérifier si le message doit être envoyé
      if (order.whatsappSent) {
        console.log(`ℹ️ WhatsApp déjà envoyé pour la commande #${order._id}`);
        return false;
      }

      // Vérifier que la commande est COMPLETED
      if (order.status !== 'COMPLETED') {
        console.log(`ℹ️ La commande #${order._id} n'est pas COMPLETED (status: ${order.status})`);
        return false;
      }

      // Vérifier que nous avons les informations nécessaires
      if (!order.vendeurPhone) {
        console.error(`❌ Pas de numéro vendeur pour la commande #${order._id}`);
        return false;
      }

      // Envoyer la notification WhatsApp
      await cabupayWhatsappService.notifyNewOrder({
        vendeurName: order.vendeurName || 'Vendeur',
        vendeurPhone: order.vendeurPhone,
        orderRef: `CMD-${order._id.toString().slice(-6).toUpperCase()}`,
        network: order.network,
        units: order.units,
        price: order.price,
        currency: order.currency || 'FC',
        customerPhone: order.phoneNumber,
      });

      // Marquer comme envoyé dans la base de données
      order.whatsappSent = true;
      order.whatsappSentAt = new Date();
      await order.save();

      console.log(`✅ WhatsApp envoyé pour la commande #${order._id}`);
      return true;

    } catch (error: any) {
      console.error(`❌ Échec d'envoi WhatsApp pour la commande #${order._id}:`, error.message);
      // On ne marque PAS comme envoyé pour pouvoir réessayer plus tard
      // La commande reste avec whatsappSent = false
      return false;
    }
  }

  /**
   * Envoie les notifications WhatsApp pour toutes les commandes COMPLETED
   * dont le message n'a pas encore été envoyé
   * @returns { sent: number, failed: number, total: number }
   */
  static async sendAllPendingWhatsAppMessages(): Promise<{ sent: number; failed: number; total: number }> {
    try {
      // Récupérer toutes les commandes COMPLETED sans message WhatsApp envoyé
      const pendingOrders = await Order.find({
        status: 'COMPLETED',
        whatsappSent: { $ne: true }
      });

      if (pendingOrders.length === 0) {
        return { sent: 0, failed: 0, total: 0 };
      }

      let sentCount = 0;
      let failedCount = 0;

      // Parcourir et envoyer chaque message
      for (const order of pendingOrders) {
        const success = await this.sendWhatsAppNotification(order);
        if (success) {
          sentCount++;
        } else {
          failedCount++;
        }
      }

      return {
        total: pendingOrders.length,
        sent: sentCount,
        failed: failedCount
      };

    } catch (error: any) {
      console.error('❌ Erreur lors du traitement des messages:', error.message);
      throw error;
    }
  }

  /**
   * Vérifie les conditions pour envoyer une notification WhatsApp
   * @param order - L'ordre Mongoose
   * @param paymentStatus - Le statut du paiement (ex: 'COMPLETED')
   * @returns boolean - True si les conditions sont remplies
   */
  static shouldSendNotification(order: any, paymentStatus: string): boolean {
    return (
      paymentStatus === 'COMPLETED' &&
      !order.whatsappSent &&
      order.status === 'COMPLETED'
    );
  }
}