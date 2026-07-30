import { useState } from "react"
import useOrders, { ordersService } from '../../hooks/orders/useOrders'
import { Search, ChevronLeft, Eye, X, Copy, Check, AlertCircle, RefreshCw, CheckCircle2 } from "lucide-react"
import { Order } from "../../utils/database"
import { formatDate } from "../../functions/formatDate"
import useToken from "../../hooks/auth/useToken"

export default function OrdersPage() {
  const { data: orders, loading: ordersLoading, refresh } = useOrders({})
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const {token}= useToken()
  // Tracking des IDs de commande en cours de traitement manuel
  const [processingIds, setProcessingIds] = useState<Record<string, boolean>>({})

  // Appel direct à votre endpoint de synchro backend avec mise à jour UI
  const handleTraitOrder = async (orderId: string) => {
    if (!orderId || processingIds[orderId]) return

    setProcessingIds(prev => ({ ...prev, [orderId]: true }))

    try {
      const updatedOrder = await ordersService.traitOrder(token , orderId)
      
      // Si la commande consultée dans le modal est celle qui est mise à jour
      if (selectedOrder && (selectedOrder.id === orderId || selectedOrder._id === orderId)) {
        setSelectedOrder(prev => prev ? { ...prev, ...updatedOrder?.order } : null)
      }

      // Rafraîchir la liste si la fonction est fournie par le hook
      if (typeof refresh === "function") {
        await refresh()
      }
    } catch (error) {
      console.error("Erreur synchro Cabupay:", error)
    } finally {
      setProcessingIds(prev => ({ ...prev, [orderId]: false }))
    }
  }

  if (ordersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(fieldName)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const filteredOrders = orders?.filter(order => {
    const searchLower = search.toLowerCase()
    const orderIdStr = order.id || order._id || ""
    
    const matchesSearch = 
      (orderIdStr && orderIdStr.toLowerCase().includes(searchLower)) ||
      (order.depositId && order.depositId.toLowerCase().includes(searchLower)) ||
      (order.providerTransactionId && order.providerTransactionId.toLowerCase().includes(searchLower)) ||
      (order.phoneNumber && order.phoneNumber.includes(search)) ||
      (order.paymentPhone && order.paymentPhone.includes(search)) ||
      (order.contactPhone && order.contactPhone.includes(search)) ||
      (order.vendeurName && order.vendeurName.toLowerCase().includes(searchLower)) ||
      (order.vendeurPhone && order.vendeurPhone.includes(search)) ||
      (order.network && order.network.toLowerCase().includes(searchLower))
    
    const currentStatus = order.status?.toUpperCase()
    const filterStatus = statusFilter.toUpperCase()

    let matchesStatus = false
    if (filterStatus === "ALL") {
      matchesStatus = true
    } else if (filterStatus === "FAILED") {
      matchesStatus = currentStatus === "FAILED"
    } else if (filterStatus === "COMPLETED") {
      matchesStatus = currentStatus === "COMPLETED"
    } else if (filterStatus === "PENDING") {
      matchesStatus = currentStatus !== "COMPLETED" && currentStatus !== "FAILED"
    }
    
    return matchesSearch && matchesStatus
  }) || []

  const getStatusColor = (status?: Order["status"]) => {
    const normalized = status?.toUpperCase()
    if (normalized === "COMPLETED") return "bg-green-100 text-green-800"
    if (normalized === "FAILED") return "bg-red-100 text-red-800"
    return "bg-yellow-100 text-yellow-800"
  }

  const getStatusText = (status?: Order["status"]) => {
    const normalized = status?.toUpperCase()
    if (normalized === "COMPLETED") return "Traitée"
    if (normalized === "FAILED") return "Échouée"
    return "En attente"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b z-10">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.history.back()}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-base font-medium">Toutes les commandes</h1>
              <p className="text-xs text-gray-500">{filteredOrders.length} commande{filteredOrders.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Filtres */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par ID, depositId, téléphone, vendeur, réseau..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary transition text-sm"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary transition text-sm"
          >
            <option value="all">Tous les statuts</option>
            <option value="PENDING">En attente</option>
            <option value="COMPLETED">Traitées</option>
            <option value="FAILED">Échouées</option>
          </select>
        </div>

        {/* Tableau */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl border p-8 text-center">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="font-medium text-gray-900 mb-2">
              {search || statusFilter !== "all" 
                ? "Aucune commande correspondante" 
                : "Aucune commande"}
            </h3>
            <p className="text-gray-600 text-sm">
              {search || statusFilter !== "all" 
                ? "Modifiez vos critères de recherche" 
                : "Aucune commande n'a été passée"}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client & Paiement
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendeur
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Réseau
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredOrders.map((order) => {
                    const currentId = order.id || order._id || ""
                    const isProcessing = processingIds[currentId]
                    const isPending = order.status?.toUpperCase() !== "COMPLETED" && order.status?.toUpperCase() !== "FAILED"

                    return (
                      <tr key={currentId || Math.random().toString()} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">{order.phoneNumber}</div>
                            {order.paymentPhone && (
                              <div className="text-gray-500 text-xs">Paiement: {order.paymentPhone}</div>
                            )}
                            {order.depositId && (
                              <div className="text-[11px] font-mono text-blue-600 truncate max-w-[150px]">
                                Dep: {order.depositId}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{order.vendeurName}</div>
                          <div className="text-gray-500 text-xs">{order.vendeurPhone}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">{order.network}</div>
                            <div className="text-gray-500 text-xs">
                              {order.units} unité{order.units > 1 ? 's' : ''} • {order.price} {order.currency}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {order.createdAt ? formatDate(order.createdAt) : "-"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1">
                            {/* Bouton de Traitement Manuel */}
                            {isPending && (
                              <button
                                onClick={() => handleTraitOrder(currentId)}
                                disabled={isProcessing}
                                className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition inline-flex items-center gap-1 text-xs font-medium border border-blue-200 disabled:opacity-50"
                                title="Vérifier et traiter auprès de Cabupay"
                              >
                                <RefreshCw className={`h-3.5 w-3.5 ${isProcessing ? "animate-spin" : ""}`} />
                                <span className="hidden sm:inline">Traiter</span>
                              </button>
                            )}

                            {/* Bouton Inspecter */}
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="p-1.5 hover:bg-gray-100 text-gray-600 rounded-lg transition inline-flex items-center gap-1 text-xs font-medium"
                              title="Voir les détails techniques"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal d'inspection technique */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-4 border-b flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-base font-bold text-gray-900">Détails de la commande</h2>
                <p className="text-xs font-mono text-gray-500">ID: {selectedOrder.id || selectedOrder._id || "N/A"}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 hover:bg-gray-100 rounded-full transition"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Statut & Action synchro */}
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border text-xs">
                <div>
                  <span className="text-gray-500 block">Statut</span>
                  <span className={`inline-block px-2 py-0.5 rounded-full font-medium mt-1 ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusText(selectedOrder.status)}
                  </span>
                </div>
                
                {selectedOrder.status?.toUpperCase() !== "COMPLETED" && selectedOrder.status?.toUpperCase() !== "FAILED" ? (
                  <button
                    onClick={() => handleTraitOrder(selectedOrder.id || selectedOrder._id || "")}
                    disabled={processingIds[selectedOrder.id || selectedOrder._id || ""]}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${processingIds[selectedOrder.id || selectedOrder._id || ""] ? "animate-spin" : ""}`} />
                    Forcer le traitement
                  </button>
                ) : (
                  <div className="text-right">
                    <span className="text-gray-500 block">Créée le</span>
                    <span className="font-medium text-gray-800">
                      {selectedOrder.createdAt ? formatDate(selectedOrder.createdAt) : "-"}
                    </span>
                  </div>
                )}
              </div>

              {selectedOrder.status?.toUpperCase() === "FAILED" && selectedOrder.failureReason && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-xs">
                  <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-red-800">Motif du rejet :</span>
                    <p className="font-mono text-red-700 mt-1 break-all bg-white p-2 rounded border border-red-100">
                      {selectedOrder.failureReason}
                    </p>
                  </div>
                </div>
              )}

              {/* IDs et Passerelle */}
              <div className="space-y-2 bg-gray-50 p-3 rounded-lg border font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Deposit ID (Cabupay):</span>
                  <div className="flex items-center gap-1 font-bold text-gray-900">
                    <span>{selectedOrder.depositId || "-"}</span>
                    {selectedOrder.depositId && (
                      <button onClick={() => copyToClipboard(selectedOrder.depositId!, "depositId")} className="p-1 hover:bg-gray-200 rounded">
                        {copiedField === "depositId" ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3 text-gray-500" />}
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t pt-2">
                  <span className="text-gray-500">Provider Trans ID:</span>
                  <div className="flex items-center gap-1 font-bold text-gray-900">
                    <span>{selectedOrder.providerTransactionId || "-"}</span>
                    {selectedOrder.providerTransactionId && (
                      <button onClick={() => copyToClipboard(selectedOrder.providerTransactionId!, "providerTx")} className="p-1 hover:bg-gray-200 rounded">
                        {copiedField === "providerTx" ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3 text-gray-500" />}
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t pt-2">
                  <span className="text-gray-500">Correspondent:</span>
                  <span className="font-bold text-blue-600">{selectedOrder.correspondent || "-"}</span>
                </div>

                <div className="flex items-center justify-between border-t pt-2">
                  <span className="text-gray-500">Offer ID:</span>
                  <span className="text-gray-800">{selectedOrder.offerId}</span>
                </div>
              </div>

              {/* Téléphones */}
              <div className="grid grid-cols-3 gap-2 text-xs text-center">
                <div className="p-2 bg-gray-50 rounded border">
                  <span className="text-gray-500 block text-[10px]">Client</span>
                  <span className="font-bold text-gray-900">{selectedOrder.phoneNumber}</span>
                </div>
                <div className="p-2 bg-gray-50 rounded border">
                  <span className="text-gray-500 block text-[10px]">Paiement</span>
                  <span className="font-bold text-gray-900">{selectedOrder.paymentPhone || "-"}</span>
                </div>
                <div className="p-2 bg-gray-50 rounded border">
                  <span className="text-gray-500 block text-[10px]">Contact</span>
                  <span className="font-bold text-gray-900">{selectedOrder.contactPhone || "-"}</span>
                </div>
              </div>

              {/* Vendeur & Transaction */}
              <div className="text-xs space-y-2 bg-gray-50 p-3 rounded-lg border">
                <div className="flex justify-between">
                  <span className="text-gray-500">Vendeur:</span>
                  <span className="font-medium text-gray-900">{selectedOrder.vendeurName} ({selectedOrder.vendeurPhone})</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-500">Réseau & Montant:</span>
                  <span className="font-medium text-gray-900">{selectedOrder.network} — {selectedOrder.price} {selectedOrder.currency} ({selectedOrder.units} un.)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}