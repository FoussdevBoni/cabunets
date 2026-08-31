// components/orders/OrderCard.tsx
import { Eye, RefreshCw, ExternalLink, MessageCircle, Check, Clock } from "lucide-react"
import { Order } from "../../../utils/database"
import { formatDate } from "../../../functions/formatDate"


interface OrderCardProps {
  order: Order
  isProcessing: boolean
  isPending: boolean
  onTraitOrder: (orderId: string) => void
  onViewDetails: (order: Order) => void
}

export function OrderCard({ 
  order, 
  isProcessing, 
  isPending, 
  onTraitOrder, 
  onViewDetails 
}: OrderCardProps) {
  const currentId = order.id || order._id || ""

  const getStatusColor = (status?: Order["status"]) => {
    const normalized = status?.toUpperCase()
    if (normalized === "COMPLETED") return "bg-indigo-100 text-indigo-800"
    if (normalized === "DELIVERED") return "bg-green-100 text-green-800"
    if (normalized === "FAILED") return "bg-red-100 text-red-800"
    return "bg-yellow-100 text-yellow-800"
  }

  const getStatusText = (status?: Order["status"]) => {
    const normalized = status?.toUpperCase()
    if (normalized === "COMPLETED") return "Payée"
    if (normalized === "DELIVERED") return "Livrée"
    if (normalized === "FAILED") return "Échouée"
    return "En attente"
  }

  const getWhatsAppStatus = (order: Order) => {
    if (order.whatsappSent) {
      return {
        icon: <Check className="h-3.5 w-3.5 text-green-600" />,
        label: "Envoyé",
        color: "text-green-600"
      }
    }
    return {
      icon: <Clock className="h-3.5 w-3.5 text-gray-400" />,
      label: "Non envoyé",
      color: "text-gray-400"
    }
  }

  const whatsappStatus = getWhatsAppStatus(order)

  return (
    <div className="bg-white rounded-xl border p-3 sm:p-4 shadow-sm space-y-3">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
          {getStatusText(order.status)}
        </span>
        <span className="text-xs text-gray-400">
          {order.createdAt ? formatDate(order.createdAt) : "-"}
        </span>
      </div>

      {/* Infos principales */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="min-w-0">
          <p className="text-gray-400 text-xs">Client</p>
          <p className="font-semibold text-gray-900 truncate">{order.phoneNumber}</p>
          {order.paymentPhone && (
            <p className="text-gray-500 text-xs truncate">Paiement: {order.paymentPhone}</p>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-gray-400 text-xs">Vendeur</p>
          <p className="font-medium text-gray-800 truncate">{order.vendeurName}</p>
          <p className="text-gray-500 text-xs truncate">{order.vendeurPhone}</p>
        </div>
      </div>

      {/* Offre */}
      <div className="bg-gray-50 p-2.5 sm:p-3 rounded-lg text-sm">
        <div className="flex justify-between items-center flex-wrap gap-1">
          <span className="text-gray-500 text-xs">Offre:</span>
          <span className="font-semibold text-gray-900 text-xs sm:text-sm">
            {order.network} • {order.price} {order.currency} ({order.units})
          </span>
        </div>
        {order.depositId && (
          <div className="flex justify-between items-center pt-1 border-t border-gray-200/60 font-mono text-xs mt-1">
            <span className="text-gray-500">Deposit:</span>
            <span className="text-blue-600 font-medium truncate max-w-[120px] sm:max-w-[200px]">
              {order.depositId}
            </span>
          </div>
        )}
      </div>

      {/* WhatsApp */}
      <div className="flex items-center justify-between flex-wrap gap-1">
        <div className="flex items-center gap-1.5">
          <MessageCircle className="h-3.5 w-3.5 text-gray-400" />
          <span className={`text-xs font-medium ${whatsappStatus.color}`}>
            WhatsApp: {whatsappStatus.label}
          </span>
        </div>
        {order.whatsappSentAt && (
          <span className="text-xs text-gray-400">
            {formatDate(order.whatsappSentAt)}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1 flex-wrap">
        {order.depositId && (
          <a
            href={`/admin/deposit?depositId=${order.depositId}`}
            className="flex-1 min-w-[60px] px-2.5 sm:px-3 py-1.5 sm:py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs sm:text-sm font-medium transition inline-flex items-center justify-center gap-1 border border-blue-200"
          >
            <ExternalLink className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span>Dépôt</span>
          </a>
        )}

        {isPending && (
          <button
            onClick={() => onTraitOrder(currentId)}
            disabled={isProcessing}
            className="px-2.5 sm:px-3 py-1.5 sm:py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-xs sm:text-sm font-medium transition inline-flex items-center justify-center gap-1 border disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${isProcessing ? "animate-spin" : ""}`} />
            <span>Traiter</span>
          </button>
        )}

        <button
          onClick={() => onViewDetails(order)}
          className="p-1.5 sm:p-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg transition border"
        >
          <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </button>
      </div>
    </div>
  )
}