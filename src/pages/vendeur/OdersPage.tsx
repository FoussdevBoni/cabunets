import { useState } from "react"
import { useAuth } from "../../hooks/auth/useAuth"
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  Search,
  User,
  Smartphone,
  DollarSign,
  Calendar,
  Truck,
  Loader2
} from "lucide-react"
import useOrders, { ordersService } from "../../hooks/orders/useOrders"
import useToken from "../../hooks/auth/useToken"
import { alertSuccess, alertError } from "../../helpers/alertError"

export default function OrdersPage() {
  const { user, loading: userLoading } = useAuth()
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [deliveringId, setDeliveringId] = useState<string | null>(null)
  const { token } = useToken()
  const { 
    data: orders = [], 
    loading,
    refresh
  } = useOrders({ filters: { vendeurId: user?.id || "" } })

  const filteredOrders = orders.filter(order => {
    const currentStatus = order.status?.toUpperCase()
    const filterStatus = statusFilter.toUpperCase()

    let matchesStatus = false
    if (filterStatus === "ALL") {
      matchesStatus = true
    } else if (filterStatus === "FAILED") {
      matchesStatus = currentStatus === "FAILED"
    } else if (filterStatus === "COMPLETED") {
      matchesStatus = currentStatus === "COMPLETED"
    } else if (filterStatus === "DELIVERED") {
      matchesStatus = currentStatus === "DELIVERED"
    } else if (filterStatus === "PENDING") {
      matchesStatus = currentStatus !== "COMPLETED" && currentStatus !== "FAILED" && currentStatus !== "DELIVERED"
    }

    const matchesSearch = 
      (order.phoneNumber && order.phoneNumber.includes(searchTerm)) ||
      (order.network && order.network.toLowerCase().includes(searchTerm.toLowerCase()))
    
    return matchesStatus && matchesSearch
  })

  // Helpers pour les statuts
  const getStatusLabel = (status?: string) => {
    const normalized = status?.toUpperCase()
    if (normalized === "DELIVERED") return "Livrée"
    if (normalized === "COMPLETED") return "Payé"
    if (normalized === "FAILED") return "Échouée"
    return "En attente"
  }

  const getStatusIcon = (status?: string) => {
    const normalized = status?.toUpperCase()
    if (normalized === "DELIVERED") return <CheckCircle className="h-4 w-4 text-green-600" />
    if (normalized === "COMPLETED") return <CheckCircle className="h-4 w-4 text-blue-500" />
    if (normalized === "FAILED") return <XCircle className="h-4 w-4 text-red-500" />
    return <Clock className="h-4 w-4 text-yellow-500" />
  }

  const getStatusColor = (status?: string) => {
    const normalized = status?.toUpperCase()
    if (normalized === "DELIVERED") return "bg-green-100 text-green-800"
    if (normalized === "COMPLETED") return "bg-blue-100 text-blue-800"
    if (normalized === "FAILED") return "bg-red-100 text-red-800"
    return "bg-yellow-100 text-yellow-800"
  }

  const formatDate = (date?: Date | string) => {
    if (!date) return "-"
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Confirmer la livraison des unités au client
  const handleDeliverOrder = async (orderId: string) => {
    if (!token) {
      alertError("Vous devez être connecté")
      return
    }

    setDeliveringId(orderId)

    try {
      const result = await ordersService.deliverOrder(token, orderId)
      
      if (result.success) {
        alertSuccess("✅ Commande livrée avec succès !")
        await refresh()
      } else {
        alertError(result.error || "Erreur lors de la livraison")
      }
    } catch (error: any) {
      console.error("Erreur lors de la livraison:", error)
      alertError(error?.message || "Une erreur est survenue")
    } finally {
      setDeliveringId(null)
    }
  }

  if (loading || userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Commandes</h1>
            <p className="text-gray-600 mt-1">
              {filteredOrders.length} commande{filteredOrders.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Filtres */}
        <div className="space-y-4 mb-6">
          {/* Barre de recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par numéro ou réseau..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary transition text-sm"
            />
          </div>

          {/* Filtres de statut */}
          <div className="flex overflow-x-auto gap-2 pb-2">
            {[
              { id: "all", label: "Toutes" },
              { id: "PENDING", label: "En attente" },
              { id: "COMPLETED", label: "Payées" },
              { id: "DELIVERED", label: "Livrées" },
              { id: "FAILED", label: "Échouées" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
                  statusFilter.toUpperCase() === tab.id.toUpperCase()
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Liste des commandes */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl border p-8 text-center">
            <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">
              {searchTerm || statusFilter !== "all" 
                ? "Aucune commande correspondante" 
                : "Aucune commande"}
            </h3>
            <p className="text-gray-600 text-sm">
              {searchTerm || statusFilter !== "all" 
                ? "Modifiez vos critères de recherche" 
                : "Les commandes apparaîtront ici"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => {
              const isDelivered = order.status?.toUpperCase() === "DELIVERED"
              const isCompleted = order.status?.toUpperCase() === "COMPLETED"
              const isPending = !isCompleted && !isDelivered && order.status?.toUpperCase() !== "FAILED"
              const canDeliver = isCompleted && !isDelivered

              return (
                <div key={order.id} className="bg-white rounded-xl border overflow-hidden">
                  {/* En-tête de la carte */}
                  <div className="px-4 py-3 border-b flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.status)}
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(order.createdAt)}
                    </div>
                  </div>

                  {/* Contenu de la carte */}
                  <div className="p-4">
                    {/* Client & Montant */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-medium text-gray-900">Client</span>
                        </div>
                        <div className="text-sm text-gray-600">{order.phoneNumber}</div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center gap-1 mb-1 justify-end">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <span className="font-bold text-gray-900">{order.price} {order.currency}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.units} unité{order.units > 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>

                    {/* Réseau & Bouton livraison */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">{order.network}</span>
                      </div>

                      {/* Bouton Confirmer la livraison */}
                      {canDeliver && (
                        <button
                          onClick={() => handleDeliverOrder(order.id!)}
                          disabled={deliveringId === order.id}
                          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deliveringId === order.id ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Livraison...
                            </>
                          ) : (
                            <>
                              <Truck className="h-4 w-4" />
                              Confirmer la livraison
                            </>
                          )}
                        </button>
                      )}

                      {isDelivered && (
                        <span className="flex items-center gap-2 text-green-600 text-sm font-medium">
                          <CheckCircle className="h-4 w-4" />
                          Livrée
                        </span>
                      )}
                    </div>

                    {/* Message pour les commandes en attente */}
                    {isPending && (
                      <div className="mt-3 text-xs text-gray-500 italic">
                        En attente de paiement du client...
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}