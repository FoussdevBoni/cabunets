import useOrders from '../../hooks/orders/useOrders'
import useOffres from '../../hooks/offres/useOffres'
import { Package, Users, DollarSign, TrendingUp, XCircle, Clock, CheckCircle } from "lucide-react"
import useVendeurs from '../../hooks/vendeurs/useVendeurs'

export default function AdminOverviewPage() {
  const { data: orders, loading: ordersLoading } = useOrders({})
  const { data: offres, loading: offresLoading } = useOffres({})
  const { data: vendeurs, loading: vendeursLoading } = useVendeurs({})

  if (ordersLoading || offresLoading || vendeursLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  // Calculs principaux
  const totalOrders = orders?.length || 0
  const totalOffres = offres?.length || 0
  const totalVendeurs = vendeurs?.length || 0
  
  // Revenu total (commandes complétées uniquement, insensible à la casse)
  const totalRevenue = orders
    ?.filter(order => order.status?.toUpperCase() === "COMPLETED")
    .reduce((sum, order) => sum + (Number(order.price) || 0), 0) || 0

  // Décompte par statut
  const completedOrders = orders?.filter(o => o.status?.toUpperCase() === "COMPLETED").length || 0
  const failedOrders = orders?.filter(o => o.status?.toUpperCase() === "FAILED").length || 0
  const pendingOrders = orders?.filter(o => {
    const status = o.status?.toUpperCase()
    return status !== "COMPLETED" && status !== "FAILED"
  }).length || 0

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord Admin</h1>
        <p className="text-gray-600 mt-1">Vue d'ensemble de la plateforme</p>
      </div>

      {/* Stats principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Vendeurs</div>
              <div className="text-xl font-bold text-gray-900">{totalVendeurs}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Package className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Offres actives</div>
              <div className="text-xl font-bold text-gray-900">{totalOffres}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Commandes</div>
              <div className="text-xl font-bold text-gray-900">{totalOrders}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Revenu total</div>
              <div className="text-xl font-bold text-gray-900">
                {totalRevenue.toLocaleString("fr-FR")} FCFA
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats commandes */}
      <div className="bg-white rounded-xl border p-5 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Statut des commandes</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4 flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">En attente</div>
              <div className="text-2xl font-bold text-yellow-600">{pendingOrders}</div>
            </div>
            <Clock className="h-6 w-6 text-yellow-500 opacity-80" />
          </div>

          <div className="border rounded-lg p-4 flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">Traitées</div>
              <div className="text-2xl font-bold text-green-600">{completedOrders}</div>
            </div>
            <CheckCircle className="h-6 w-6 text-green-500 opacity-80" />
          </div>

          <div className="border rounded-lg p-4 flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">Échouées</div>
              <div className="text-2xl font-bold text-red-600">{failedOrders}</div>
            </div>
            <XCircle className="h-6 w-6 text-red-500 opacity-80" />
          </div>
        </div>
      </div>

      {/* Accès rapides */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Accès rapide</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href="/admin/orders" className="block">
            <div className="bg-white rounded-xl border p-4 hover:bg-gray-50 transition">
              <div className="text-sm font-medium text-gray-900">Toutes les commandes</div>
              <div className="text-xs text-gray-500 mt-1">Voir et surveiller</div>
            </div>
          </a>
          
          <a href="/admin/offres" className="block">
            <div className="bg-white rounded-xl border p-4 hover:bg-gray-50 transition">
              <div className="text-sm font-medium text-gray-900">Toutes les offres</div>
              <div className="text-xs text-gray-500 mt-1">Superviser les offres</div>
            </div>
          </a>
          
          <a href="/admin/vendeurs" className="block">
            <div className="bg-white rounded-xl border p-4 hover:bg-gray-50 transition">
              <div className="text-sm font-medium text-gray-900">Gérer les vendeurs</div>
              <div className="text-xs text-gray-500 mt-1">Supprimer, surveiller</div>
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}