import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../hooks/auth/useAuth"
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  Search,
  ChevronLeft,
  User,
  Smartphone,
  DollarSign,
  Calendar
} from "lucide-react"
import useOrders from "../../hooks/orders/useOrders"
import { Order } from "../../utils/database"



export default function OrdersPage() {
  const navigate = useNavigate()
  const { user , loading: userLoading } = useAuth()
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const {data: orders , loading, refresh , 
    updateItem: updateOrder} = useOrders({filters: {vendeurId: user?.id!}})



  const updateOrderStatus = async (order: Order, status: Order["status"]) => {
    try {
      updateOrder(
        {
          ...order, 
          status
        })
      // Rafraîchir la liste
      refresh()
    } catch (error) {
      console.error("Erreur:", error)
      alert("Erreur lors de la mise à jour")
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    const matchesSearch = 
      order.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phoneNumber.includes(searchTerm) ||
      order.network.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "pending": return <Clock className="h-4 w-4 text-yellow-500" />
      case "confirmed": return <CheckCircle className="h-4 w-4 text-blue-500" />
      case "completed": return <CheckCircle className="h-4 w-4 text-green-500" />
      case "cancelled": return <XCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "confirmed": return "bg-blue-100 text-blue-800"
      case "completed": return "bg-green-100 text-green-800"
      case "cancelled": return "bg-red-100 text-red-800"
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
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
     
  {/* En-tête simple */}
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
              placeholder="Rechercher une commande..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary transition text-sm"
            />
          </div>

          {/* Filtres de statut */}
          <div className="flex overflow-x-auto gap-2 pb-2">
            {["all", "pending", "confirmed", "completed", "cancelled"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
                  statusFilter === status
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {status === "all" ? "Toutes" : 
                 status === "pending" ? "En attente" :
                 status === "confirmed" ? "Confirmées" :
                 status === "completed" ? "Traitées" : "Annulées"}
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
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl border overflow-hidden">
                {/* En-tête */}
                <div className="px-4 py-3 border-b flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(order.status)}
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status === "pending" ? "En attente" :
                       order.status === "confirmed" ? "Confirmée" :
                       order.status === "completed" ? "Traité" : "Annulée"}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(order.createdAt!)}
                  </div>
                </div>

                {/* Contenu */}
                <div className="p-4">
                  {/* Client */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-gray-900">Client</span>
                      </div>
                      <div className="text-sm text-gray-600">{order.email}</div>
                      <div className="text-sm text-gray-600">{order.phoneNumber}</div>
                    </div>
                    
                    {/* Prix */}
                    <div className="text-right">
                      <div className="flex items-center gap-1 mb-1">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <span className="font-bold text-gray-900">{order.price} {order.currency}</span>
                      </div>
                      <div className="text-sm text-gray-500">{order.units} unité{order.units > 1 ? 's' : ''}</div>
                    </div>
                  </div>

                  {/* Réseau */}
                  <div className="flex items-center gap-2 mb-4">
                    <Smartphone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">{order.network}</span>
                  </div>

                  {/* Actions */}
                  {order.status === "pending" && (
                    <div className="border-t pt-4">
                      <div className="text-sm font-medium text-gray-700 mb-2">Actions</div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateOrderStatus(order, "confirmed")}
                          className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition text-sm"
                        >
                          Confirmer
                        </button>
                        <button
                          onClick={() => updateOrderStatus(order, "cancelled")}
                          className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition text-sm"
                        >
                          Refuser
                        </button>
                      </div>
                    </div>
                  )}

                  {order.status === "confirmed" && (
                    <div className="border-t pt-4">
                      <div className="text-sm font-medium text-gray-700 mb-2">Marquer comme traité</div>
                      <button
                        onClick={() => updateOrderStatus(order, "completed")}
                        className="w-full py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition text-sm"
                      >
                        <CheckCircle className="inline h-4 w-4 mr-2" />
                        Marquer comme traité
                      </button>
                    </div>
                  )}

                  {order.status === "completed" && (
                    <div className="border-t pt-4">
                      <div className="text-center">
                        <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
                        <p className="text-sm text-green-600 font-medium">Commande traitée</p>
                      </div>
                    </div>
                  )}

                  {order.status === "cancelled" && (
                    <div className="border-t pt-4">
                      <div className="text-center">
                        <XCircle className="h-6 w-6 text-red-500 mx-auto mb-2" />
                        <p className="text-sm text-red-600 font-medium">Commande annulée</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}