import { Order } from "../../models/Order";
import { OrderNotificationService } from "./orderNotificationService";
import { NotFoundError } from "../../utils/errors";

// Only a pending payment can be transitioned. All writers increment the document
// version so financial transactions using optimistic concurrency still detect races.
export async function applyOrderPayment(orderId: string, status: string, details: {
  depositId?: string; providerTransactionId?: string; failureReason?: any;
} = {}, mode: "auto" | "manuel" = "auto") {
  const normalized = status?.toUpperCase();
  const fields: Record<string, any> = { depositExistence: "FOUND" };
  if (details.depositId) fields.depositId = details.depositId;
  if (normalized === "COMPLETED" || normalized === "FAILED") {
    fields.status = normalized;
    fields.depositPaymentStatus = normalized;
    fields.paymentInitiationState = "accepted";
  }
  if (details.providerTransactionId) fields.providerTransactionId = details.providerTransactionId;
  if (normalized === "FAILED") {
    const failure = details.failureReason;
    fields.failureReason = typeof failure === "string" ? failure : failure?.failureMessage || "Paiement échoué";
    if (failure?.failureCode) fields.failureCode = failure.failureCode;
  }
  await Order.findOneAndUpdate({ _id: orderId, status: "PENDING" },
    { $set: fields, $inc: { __v: 1 } }, { new: true });
  let order = await Order.findById(orderId);
  if (!order) throw new NotFoundError("Commande introuvable.");
  if (normalized === "COMPLETED" && ["COMPLETED", "DELIVERED"].includes(order.status)) {
    await OrderNotificationService.sendWhatsAppNotification(order, mode);
    order = (await Order.findById(orderId))!;
  }
  return order;
}
