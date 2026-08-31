// components/orders/OrderDetailModal.tsx
import { X, Copy, Check, AlertCircle, RefreshCw, ExternalLink, MessageCircle, Clock } from "lucide-react"

import { useState } from "react"
import { Order } from "../../../utils/database"
import { formatDate } from "../../../functions/formatDate"

interface OrderDetailModalProps {
  order: Order
  isProcessing: boolean
  onClose: () => void
  onTraitOrder: (orderId: string) => void
}

export function OrderDetailModal({ order, isProcessing, onClose, onTraitOrder }: OrderDetailModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(fieldName)
    setTimeout(() => setCopiedField(null), 2000)
  }

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

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-3 md:p-4 z-50">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="p-3 sm:p-4 border-b flex items-center justify-between bg-white shrink-0">
          <div className="min-w-0 flex-1">
            <h2 className="text-sm sm:text-base font-bold text-gray-900 truncate">Détails de la commande</h2>
            <p className="text-[10px] sm:text-xs font-mono text-gray-500 truncate">
              ID: {order.id || order._id || "N/A"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-full transition shrink-0 ml-2"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-3 sm:p-4 overflow-y-auto space-y-3 sm:space-y-4 text-xs sm:text-sm">
          {order.depositId && (
            <a
              href={`/admin/deposit?depositId=${order.depositId}`}
              className="w-full py-2 sm:py-2.5 px-3 sm:px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition flex items-center justify-center gap-2 shadow-sm text-xs sm:text-sm"
            >
              <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="truncate">Inspecter le dépôt ({order.depositId})</span>
            </a>
          )}

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-50 p-3 sm:p-4 rounded-xl border gap-3">
            <div>
              <span className="text-gray-500 block text-xs">Statut</span>
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${getStatusColor(order.status)}`}>
                {getStatusText(order.status)}
              </span>
            </div>
            
            {order.status?.toUpperCase() !== "COMPLETED" && 
             order.status?.toUpperCase() !== "FAILED" && 
             order.status?.toUpperCase() !== "DELIVERED" ? (
              <button
                onClick={() => onTraitOrder(order.id || order._id || "")}
                disabled={isProcessing}
                className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-700 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isProcessing ? "animate-spin" : ""}`} />
                <span>Forcer traitement</span>
              </button>
            ) : (
              <div className="text-right text-xs w-full sm:w-auto">
                <span className="text-gray-500 block">Créée le</span>
                <span className="font-medium text-gray-800">
                  {order.createdAt ? formatDate(order.createdAt) : "-"}
                </span>
              </div>
            )}
          </div>

          <div className="bg-gray-50 p-3 sm:p-4 rounded-xl border">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500" />
                <span className="text-gray-500 text-xs sm:text-sm">Notification WhatsApp</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {order.whatsappSent ? (
                  <>
                    <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600" />
                    <span className="text-xs sm:text-sm font-medium text-green-600">Envoyée</span>
                    {order.whatsappSentAt && (
                      <span className="text-[10px] sm:text-xs text-gray-400">
                        {formatDate(order.whatsappSentAt)}
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
                    <span className="text-xs sm:text-sm font-medium text-gray-400">Non envoyée</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {order.status?.toUpperCase() === "FAILED" && order.failureReason && (
            <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs sm:text-sm">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <span className="font-bold text-red-800">Motif du rejet :</span>
                <p className="font-mono text-red-700 mt-1 break-all bg-white p-2 sm:p-3 rounded border border-red-100 text-xs">
                  {order.failureReason}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2 sm:space-y-3 bg-gray-50 p-3 sm:p-4 rounded-xl border font-mono text-xs sm:text-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
              <span className="text-gray-500">Deposit ID:</span>
              <div className="flex items-center gap-1 font-bold text-gray-900 w-full sm:w-auto">
                <span className="truncate">{order.depositId || "-"}</span>
                {order.depositId && (
                  <button onClick={() => copyToClipboard(order.depositId!, "depositId")} className="p-1 hover:bg-gray-200 rounded shrink-0">
                    {copiedField === "depositId" ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3 text-gray-500" />}
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-t pt-2 sm:pt-3 gap-1">
              <span className="text-gray-500">Provider Trans ID:</span>
              <div className="flex items-center gap-1 font-bold text-gray-900 w-full sm:w-auto">
                <span className="truncate">{order.providerTransactionId || "-"}</span>
                {order.providerTransactionId && (
                  <button onClick={() => copyToClipboard(order.providerTransactionId!, "providerTx")} className="p-1 hover:bg-gray-200 rounded shrink-0">
                    {copiedField === "providerTx" ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3 text-gray-500" />}
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-t pt-2 sm:pt-3 gap-1">
              <span className="text-gray-500">Correspondent:</span>
              <span className="font-bold text-blue-600">{order.correspondent || "-"}</span>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-t pt-2 sm:pt-3 gap-1">
              <span className="text-gray-500">Offer ID:</span>
              <span className="text-gray-800">{order.offerId}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-3 gap-2 sm:gap-3 text-xs sm:text-sm text-center">
            <div className="p-2 sm:p-3 bg-gray-50 rounded-xl border">
              <span className="text-gray-400 block text-[10px] sm:text-xs">Client</span>
              <span className="font-bold text-gray-900 text-xs sm:text-sm break-all">{order.phoneNumber}</span>
            </div>
            <div className="p-2 sm:p-3 bg-gray-50 rounded-xl border">
              <span className="text-gray-400 block text-[10px] sm:text-xs">Paiement</span>
              <span className="font-bold text-gray-900 text-xs sm:text-sm break-all">{order.paymentPhone || "-"}</span>
            </div>
            <div className="p-2 sm:p-3 bg-gray-50 rounded-xl border">
              <span className="text-gray-400 block text-[10px] sm:text-xs">Contact</span>
              <span className="font-bold text-gray-900 text-xs sm:text-sm break-all">{order.contactPhone || "-"}</span>
            </div>
          </div>

          <div className="space-y-2 bg-gray-50 p-3 sm:p-4 rounded-xl border text-xs sm:text-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
              <span className="text-gray-500">Vendeur:</span>
              <span className="font-medium text-gray-900 text-right break-all">
                {order.vendeurName} ({order.vendeurPhone})
              </span>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-t pt-2 gap-1">
              <span className="text-gray-500">Réseau & Montant:</span>
              <span className="font-medium text-gray-900 text-right">
                {order.network} — {order.price} {order.currency} ({order.units} un.)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}