// components/orders/OrderRow.tsx
import { formatDate } from "../../../functions/formatDate";
;
import { MessageCircle, Check, Clock, ExternalLink, RefreshCw } from "lucide-react";
import { Order } from "../../../utils/database";
import TableRow from "../../ui/TableRow";

interface OrderRowProps {
  order: Order;
  onAction: (order: Order) => void;
  onSelect?: (order: Order, isSelected: boolean) => void;
  isSelected?: boolean;
  selectable?: boolean;
  onTraitOrder?: (orderId: string) => void;
  processingIds?: Record<string, boolean>;
}

export default function OrderRow({
  order,
  onAction,
  onSelect,
  isSelected = false,
  selectable = false,
  onTraitOrder,
  processingIds = {},
}: OrderRowProps) {
  const currentId = order.id || order._id || "";
  const isProcessing = processingIds[currentId] || false;
  const isPending = order.status?.toUpperCase() !== "COMPLETED" && 
                   order.status?.toUpperCase() !== "FAILED" && 
                   order.status?.toUpperCase() !== "DELIVERED";

  const getStatusColor = (status?: Order["status"]) => {
    const normalized = status?.toUpperCase();
    if (normalized === "COMPLETED") return "bg-indigo-100 text-indigo-800";
    if (normalized === "DELIVERED") return "bg-green-100 text-green-800";
    if (normalized === "FAILED") return "bg-red-100 text-red-800";
    return "bg-yellow-100 text-yellow-800";
  };

  const getStatusText = (status?: Order["status"]) => {
    const normalized = status?.toUpperCase();
    if (normalized === "COMPLETED") return "Payée";
    if (normalized === "DELIVERED") return "Livrée";
    if (normalized === "FAILED") return "Échouée";
    return "En attente";
  };

  const getWhatsAppStatus = () => {
    if (order.whatsappSent) {
      return {
        icon: <Check className="h-3.5 w-3.5 text-green-600" />,
        label: "Envoyé",
        color: "text-green-600"
      };
    }
    return {
      icon: <Clock className="h-3.5 w-3.5 text-gray-400" />,
      label: "Non envoyé",
      color: "text-gray-400"
    };
  };

  const whatsappStatus = getWhatsAppStatus();

  return (
    <TableRow
      item={order}
      onAction={onAction}
      onSelect={onSelect}
      isSelected={isSelected}
      selectable={selectable}
      actionable={true}
    >
      {/* Client & Paiement */}
      <td className="py-3 px-4">
        <div>
          <span className="font-medium text-gray-900 block">{order.phoneNumber}</span>
          {order.paymentPhone && (
            <span className="text-gray-500 text-xs">Paiement: {order.paymentPhone}</span>
          )}
          {order.depositId && (
            <span className="text-[11px] font-mono text-blue-600 block truncate max-w-[160px]">
              Dep: {order.depositId}
            </span>
          )}
        </div>
      </td>

      {/* Vendeur */}
      <td className="py-3 px-4">
        <div>
          <span className="text-gray-900 font-medium block">{order.vendeurName}</span>
          <span className="text-gray-500 text-xs">{order.vendeurPhone}</span>
        </div>
      </td>

      {/* Réseau & Montant */}
      <td className="py-3 px-4">
        <div>
          <span className="font-medium text-gray-900 block">{order.network}</span>
          <span className="text-gray-500 text-xs">
            {order.units} un. • {order.price} {order.currency}
          </span>
        </div>
      </td>

      {/* Statut */}
      <td className="py-3 px-4">
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
          {getStatusText(order.status)}
        </span>
      </td>

      {/* WhatsApp */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-1.5">
          <MessageCircle className="h-3.5 w-3.5 text-gray-400" />
          <span className={`text-xs font-medium ${whatsappStatus.color}`}>
            {whatsappStatus.label}
          </span>
          {order.whatsappSentAt && (
            <span className="text-[10px] text-gray-400 ml-1">
              {formatDate(order.whatsappSentAt)}
            </span>
          )}
        </div>
      </td>

      {/* Date */}
      <td className="hidden lg:table-cell py-3 px-4">
        <span className="text-gray-500 text-sm">
          {order.createdAt ? formatDate(order.createdAt) : "-"}
        </span>
      </td>

     
    </TableRow>
  );
}