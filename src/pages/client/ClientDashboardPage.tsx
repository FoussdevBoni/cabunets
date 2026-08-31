import { useAuth } from "../../hooks/auth/useAuth"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { 
  CheckCircle,
  Clock,
  XCircle,
 
  DollarSign,
  AlertCircle
} from "lucide-react"
import useOrders from "../../hooks/orders/useOrders"

interface OrderStats {
  pending: number
  completed: number
  failed: number
  delivered: number
  totalSpent: number
}

export default function ClientOverviewPage() {
  const { user, loading: userLoading } = useAuth()
  const navigate = useNavigate()
  const [orderStats, setOrderStats] = useState<OrderStats>({
    pending: 0,
    completed: 0,
    failed: 0,
    delivered: 0,
    totalSpent: 0
  })
  const [error, setError] = useState<string | null>(null)

  // Récupération des commandes du client avec clientId
  const { data: orders, loading: ordersLoading } = useOrders({ 
    filters: { clientId: user?.id } 
  })

  // Calcul des statistiques
  useEffect(() => {
    if (!user?.id) {
      setError("Utilisateur non authentifié")
      return
    }

    try {
      if (orders && Array.isArray(orders)) {
        const completed = orders.filter(o => o.status?.toUpperCase() === "COMPLETED")
        const delivered = orders.filter(o => o.status?.toUpperCase() === "DELIVERED")
        const failed = orders.filter(o => o.status?.toUpperCase() === "FAILED")
        
        const stats: OrderStats = {
          pending: orders.filter(o => {
            const st = o.status?.toUpperCase()
            return st !== "COMPLETED" && st !== "FAILED" && st !== "DELIVERED"
          }).length,
          completed: completed.length,
          failed: failed.length,
          delivered: delivered.length,
          totalSpent: completed.reduce((sum, o) => sum + (Number(o.price) || 0), 0)
        }
        setOrderStats(stats)
      }

      setError(null)
    } catch (err) {
      console.error("Erreur:", err)
      setError("Une erreur est survenue lors du chargement des données")
    }
  }, [user?.id, orders])


  // Chargement
  if (userLoading || ordersLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Chargement de votre tableau de bord...</p>
      </div>
    )
  }

  // Erreur
  if (error || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md w-full">
          <div className="flex items-center gap-3 mb-4">
            <XCircle className="h-8 w-8 text-red-600" />
            <h2 className="text-lg font-bold text-red-800">Erreur</h2>
          </div>
          <p className="text-red-700 mb-4">
            {error || "Utilisateur non authentifié"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Bonjour, {user?.username || "Client"} 👋
        </h1>
        <p className="text-gray-600 mt-1">Votre espace client</p>
      </div>

      {/* Stats commandes */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Statut de vos commandes</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">En attente</div>
                <div className="text-xl font-bold text-gray-900">{orderStats.pending}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Payées</div>
                <div className="text-xl font-bold text-gray-900">{orderStats.completed}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Livrées</div>
                <div className="text-xl font-bold text-gray-900">{orderStats.delivered}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Échouées</div>
                <div className="text-xl font-bold text-gray-900">{orderStats.failed}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dépenses totales */}
      <div className="mb-8">
        <div className="bg-white rounded-xl border p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Total dépensé</div>
                <div className="text-2xl font-bold text-gray-900">
                  {orderStats.totalSpent.toLocaleString("fr-FR")} FCFA
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              {orderStats.completed} commande{orderStats.completed > 1 ? 's' : ''} payée{orderStats.completed > 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

  
    </div>
  )
}