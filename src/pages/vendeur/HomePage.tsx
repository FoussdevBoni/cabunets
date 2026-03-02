import { useAuth } from "../../hooks/auth/useAuth"
import useOffres from "../../hooks/offres/useOffres"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { 
  Package, 
  CheckCircle,
  Clock,
  XCircle,
  Plus,
  List

} from "lucide-react"
import useOrders from "../../hooks/orders/useOrders"

interface OrderStats {
  pending: number
  confirmed: number
  completed: number
  cancelled: number
}

interface NetworkOffers {
  [key: string]: number
}

export default function OverviewPage() {
  const { user , loading: userLoading } = useAuth()
  const navigate = useNavigate()
  const [orderStats, setOrderStats] = useState<OrderStats>({
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0
  })
  const [networkOffers, setNetworkOffers] = useState<NetworkOffers>({})

  const { data: offres , loading: offresLoading } = useOffres({ filters: { vendeurId: user?.id } })
  const {data: orders , loading: ordersLoading} = useOrders({filters: {vendeurId: user?.id}})

  useEffect(() => {
    if (user?.id) {
      fetchStats()
    }
  }, [user?.id , JSON.stringify(orders)])

  const fetchStats = async () => {
    if (!user?.id) return
    
    try {
      
      const stats: OrderStats = {
        pending: orders.filter(o => o.status === "pending").length,
        confirmed: orders.filter(o => o.status === "confirmed").length,
        completed: orders.filter(o => o.status === "completed").length,
        cancelled: orders.filter(o => o.status === "cancelled").length
      }
      
      setOrderStats(stats)

      // Compter les offres par réseau
      const networkCount: NetworkOffers = {}
      offres?.forEach(offre => {
        networkCount[offre.network] = (networkCount[offre.network] || 0) + 1
      })
      setNetworkOffers(networkCount)

    } catch (error) {
      console.error("Erreur:", error)
    } finally {
    }
  }

  const quickLinks = [
    {
      icon: <Plus className="h-5 w-5" />,
      label: "Créer une offre",
      onClick: () => navigate("/offres/create"),
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: <List className="h-5 w-5" />,
      label: "Mes offres",
      onClick: () => navigate("/offres?vendeurId=" + user?.id),
      color: "bg-green-100 text-green-600"
    },
    {
      icon: <Package className="h-5 w-5" />,
      label: "Commandes",
      onClick: () => navigate("/orders"),
      color: "bg-purple-100 text-purple-600"
    }
   
  ]

  if (userLoading || offresLoading || ordersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{user?.username}</h1>
        <p className="text-gray-600 mt-1">Tableau de bord</p>
      </div>

      {/* Stats commandes */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Statut des commandes</h2>
        <div className="grid grid-cols-2 gap-4">
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
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Confirmées</div>
                <div className="text-xl font-bold text-gray-900">{orderStats.confirmed}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Traitées</div>
                <div className="text-xl font-bold text-gray-900">{orderStats.completed}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Annulées</div>
                <div className="text-xl font-bold text-gray-900">{orderStats.cancelled}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Offres par réseau */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Offres par réseau</h2>
        <div className="bg-white rounded-xl border p-4">
          <div className="space-y-3">
            {Object.entries(networkOffers).map(([network, count]) => (
              <div key={network} className="flex justify-between items-center py-2">
                <span className="font-medium text-gray-700">{network}</span>
                <span className="font-bold text-gray-900">{count} offre{count > 1 ? 's' : ''}</span>
              </div>
            ))}
            
            {Object.keys(networkOffers).length === 0 && (
              <div className="text-center py-4 text-gray-500">
                Aucune offre publiée
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Accès rapides */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Accès rapide</h2>
        <div className="grid grid-cols-2 gap-4">
          {quickLinks.map((link, index) => (
            <button
              key={index}
              onClick={link.onClick}
              className="bg-white rounded-xl border p-4 text-left hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${link.color}`}>
                  {link.icon}
                </div>
                <span className="font-medium text-gray-900">{link.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}