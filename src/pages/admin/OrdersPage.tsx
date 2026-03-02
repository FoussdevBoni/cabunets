import { useState } from "react"
import useOrders from '../../hooks/orders/useOrders'
import { Search, ChevronLeft } from "lucide-react"
import { Order } from "../../utils/database"
import { formatDate } from "../../functions/formatDate"

export default function OrdersPage() {
  const { data: orders, loading: ordersLoading } = useOrders({})
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  if (ordersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const filteredOrders = orders?.filter(order => {
    const matchesSearch = 
      order.email.toLowerCase().includes(search.toLowerCase()) ||
      order.phoneNumber.includes(search) ||
      order.vendeurName.toLowerCase().includes(search.toLowerCase()) ||
      order.network.toLowerCase().includes(search.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    
    return matchesSearch && matchesStatus
  }) || []

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "confirmed": return "bg-blue-100 text-blue-800"
      case "completed": return "bg-green-100 text-green-800"
      case "cancelled": return "bg-red-100 text-red-800"
    }
  }

  const getStatusText = (status: Order["status"]) => {
    switch (status) {
      case "pending": return "En attente"
      case "confirmed": return "Confirmée"
      case "completed": return "Traité"
      case "cancelled": return "Annulée"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b">
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
          {/* Barre de recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par email, téléphone, vendeur..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary transition text-sm"
            />
          </div>

          {/* Filtre statut */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary transition text-sm"
          >
            <option value="all">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="confirmed">Confirmées</option>
            <option value="completed">Traitées</option>
            <option value="cancelled">Annulées</option>
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
            {/* Table responsive - scroll horizontal sur mobile */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{order.email}</div>
                          <div className="text-gray-500 text-xs">{order.phoneNumber}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{order.vendeurName}</div>
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
                        {formatDate(order.createdAt!)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}