import { Order } from "../../models/Order";
import { cabupayWhatsappService } from "../providers/cabupayWhatsappService";

export class OrderNotificationService {
  static async sendWhatsAppNotification(order: any, mode: "auto" | "manuel"): Promise<boolean> {
    let claimed: any;
    try {
      claimed = await Order.findOneAndUpdate({
        _id: order._id, status: { $in: ["COMPLETED", "DELIVERED"] },
        whatsappSent: { $ne: true }, whatsappProcessing: { $ne: true },
        vendeurPhone: { $exists: true, $nin: ["", null] },
      }, { $set: { whatsappProcessing: true, whatsappProcessingAt: new Date() },
        $inc: { __v: 1 } }, { new: true });
      if (!claimed) return false;
      const accepted = await cabupayWhatsappService.notifyNewOrder({
        orderId: String(claimed._id),
        vendeurName: claimed.vendeurName || "Vendeur", vendeurPhone: claimed.vendeurPhone,
        orderRef: "CMD-" + String(claimed._id).slice(-6).toUpperCase(),
        network: claimed.network, units: claimed.units, price: claimed.price,
        currency: claimed.currency || "CDF", customerPhone: claimed.phoneNumber,
      });
      if (accepted === false) {
        // A definite rejection may be retried. An uncertain network outcome is
        // thrown by the provider and deliberately keeps the claim for review.
        await Order.updateOne({ _id: claimed._id, whatsappProcessingAt: claimed.whatsappProcessingAt },
          { $set: { whatsappProcessing: false }, $inc: { __v: 1 } });
        return false;
      }
      if (accepted !== true) throw new Error("Acceptation WhatsApp non confirmée");
      await Order.updateOne({ _id: claimed._id, whatsappProcessingAt: claimed.whatsappProcessingAt },
        { $set: { whatsappSent: true, whatsappSentAt: new Date(),
          whatsappSentMode: mode, whatsappProcessing: false },
          $unset: { whatsappProcessingStuckAt: 1 }, $inc: { __v: 1 } });
      return true;
    } catch {
      // Never resend automatically after an ambiguous timeout or a failed save:
      // the provider may already have delivered the message.
      if (claimed) {
        try { await Order.updateOne({ _id: claimed._id, whatsappProcessing: true },
          { $set: { whatsappProcessingStuckAt: new Date() }, $inc: { __v: 1 } }); } catch {}
      }
      console.error("[WhatsApp] Envoi non confirmé, vérification requise pour", String(order._id));
      return false;
    }
  }

  static async sendAllPendingWhatsAppMessages() {
    const pending = await Order.find({ status: { $in: ["COMPLETED", "DELIVERED"] },
      whatsappSent: { $ne: true }, whatsappProcessing: { $ne: true } });
    let sent = 0;
    for (const order of pending) if (await this.sendWhatsAppNotification(order, "manuel")) sent++;
    return { sent, failed: pending.length - sent, total: pending.length };
  }

  static shouldSendNotification(order: any, paymentStatus: string) {
    return paymentStatus === "COMPLETED" && !order.whatsappSent && !order.whatsappProcessing &&
      ["COMPLETED", "DELIVERED"].includes(order.status);
  }
}
