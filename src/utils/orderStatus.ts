export const ORDER_STATUSES = ["PENDING", "COMPLETED", "DELIVERED", "FAILED", "CANCELLED", "REFUNDED"] as const;
export type OrderStatus = typeof ORDER_STATUSES[number];
const labels: Record<OrderStatus, string> = { PENDING: "En attente", COMPLETED: "Payée", DELIVERED: "Livrée", FAILED: "Échouée", CANCELLED: "Annulée", REFUNDED: "Remboursée" };
export function normalizeOrderStatus(status?: string): OrderStatus | undefined { const value = status?.toUpperCase(); return ORDER_STATUSES.includes(value as OrderStatus) ? value as OrderStatus : undefined; }
export function getOrderStatusLabel(status?: string) { const value = normalizeOrderStatus(status); return value ? labels[value] : "Statut inconnu"; }
export function getOrderStatusColor(status?: string) {
  switch (normalizeOrderStatus(status)) {
    case "COMPLETED": return "bg-indigo-100 text-indigo-800";
    case "DELIVERED": return "bg-green-100 text-green-800";
    case "FAILED": return "bg-red-100 text-red-800";
    case "CANCELLED": return "bg-gray-100 text-gray-800";
    case "REFUNDED": return "bg-purple-100 text-purple-800";
    case "PENDING": return "bg-yellow-100 text-yellow-800";
    default: return "bg-gray-100 text-gray-800";
  }
}
export const canProcessOrder = (status?: string) => normalizeOrderStatus(status) === "PENDING";
export const canCancelOrder = (status?: string) => ["PENDING", "FAILED"].includes(normalizeOrderStatus(status) ?? "");
export const canDeliverOrder = (status?: string) => normalizeOrderStatus(status) === "COMPLETED";
