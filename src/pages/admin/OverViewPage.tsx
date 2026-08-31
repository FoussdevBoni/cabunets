import useOrders from '../../hooks/orders/useOrders'
import useOffres from '../../hooks/offres/useOffres'
import { Package, Users, DollarSign, TrendingUp, XCircle, Clock, CheckCircle, Truck, UserIcon, UserCog, Crown, Signal, Calendar } from "lucide-react"
import useVendeurs from '../../hooks/vendeurs/useVendeurs'
import useUsers from '../../hooks/users/useUsers'

export default function AdminOverviewPage() {
  const { data: orders, loading: ordersLoading } = useOrders({})
  const { data: offres, loading: offresLoading } = useOffres({})
  const { data: vendeurs, loading: vendeursLoading } = useVendeurs({})
  const { data: users, loading: usersLoading } = useUsers({})

  if (ordersLoading || offresLoading || vendeursLoading || usersLoading) {
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
  const totalUsers = users?.length || 0
  
  // Nombre de clients (utilisateurs avec rôle 'client')
  const totalClients = users?.filter(user => user.role === 'client').length || 0
  
  // Nombre d'admins
  const totalAdmins = users?.filter(user => user.role === 'admin').length || 0
  
  // Revenu total (commandes complétées uniquement, insensible à la casse)
  const totalRevenue = orders
    ?.filter(order => order.status?.toUpperCase() === "COMPLETED")
    .reduce((sum, order) => sum + (Number(order.price) || 0), 0) || 0

  // Décompte par statut
  const completedOrders = orders?.filter(o => o.status?.toUpperCase() === "COMPLETED").length || 0
  const deliveredOrders = orders?.filter(o => o.status?.toUpperCase() === "DELIVERED").length || 0
  const failedOrders = orders?.filter(o => o.status?.toUpperCase() === "FAILED").length || 0
  const pendingOrders = orders?.filter(o => {
    const status = o.status?.toUpperCase()
    return status !== "COMPLETED" && status !== "FAILED" && status !== "DELIVERED"
  }).length || 0

  // ============================
  // TOP VENDEURS
  // ============================
  // Calculer les stats de chaque vendeur
  const vendeurStats = vendeurs?.map(vendeur => {
    const vendeurOrders = orders?.filter(o => o.vendeurId === vendeur.id || o.vendeurId === vendeur._id) || []
    const completedVendeurOrders = vendeurOrders.filter(o => 
      o.status?.toUpperCase() === "COMPLETED" || o.status?.toUpperCase() === "DELIVERED"
    )
    const revenue = completedVendeurOrders.reduce((sum, o) => sum + (Number(o.price) || 0), 0)
    
    return {
      ...vendeur,
      totalSales: vendeurOrders.length,
      completedSales: completedVendeurOrders.length,
      revenue: revenue,
    }
  }) || []

  // Filtrer les top vendeurs (critère: plus de 50 commandes complétées OU plus de 5000 FCFA de CA)
  const topVendeurs = vendeurStats.filter(v => 
    v.completedSales >= 50 || v.revenue >= 5000
  )

  const topVendeursCount = topVendeurs.length
  const topVendeursNames = topVendeurs.map(v => v.username).join(', ')

  // Calcul du chiffre d'affaires total
  const totalRevenueAll = vendeurStats.reduce((sum, v) => sum + v.revenue, 0)

  // ============================
  // RÉSEAU LE PLUS VENDU
  // ============================
  const networkSales: Record<string, number> = {}
  
  orders?.forEach(order => {
    if (order.network) {
      const networkName = order.network.trim()
      networkSales[networkName] = (networkSales[networkName] || 0) + 1
    }
  })

  // Trouver le réseau avec le plus de ventes
  let mostSoldNetwork = ''
  let mostSoldNetworkCount = 0
  
  Object.entries(networkSales).forEach(([network, count]) => {
    if (count > mostSoldNetworkCount) {
      mostSoldNetwork = network
      mostSoldNetworkCount = count
    }
  })

  // Calculer le pourcentage du réseau le plus vendu
  const mostSoldNetworkPercentage = totalOrders > 0 
    ? Math.round((mostSoldNetworkCount / totalOrders) * 100) 
    : 0

  // Top 3 des réseaux les plus vendus
  const sortedNetworks = Object.entries(networkSales)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([network, count]) => ({
      network,
      count,
      percentage: totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0
    }))

  // ============================
  // REVENU MENSUEL
  // ============================
  const monthlyRevenue: Record<string, number> = {}
  
  orders?.forEach(order => {
    if (order.status?.toUpperCase() === "COMPLETED" || order.status?.toUpperCase() === "DELIVERED") {
      if (order.createdAt) {
        const date = new Date(order.createdAt)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + (Number(order.price) || 0)
      }
    }
  })

  // Trier les mois par ordre chronologique (du plus récent au plus ancien)
  const sortedMonths = Object.entries(monthlyRevenue)
    .sort(([a], [b]) => b.localeCompare(a))

  // Dernier mois
  const lastMonthKey = sortedMonths.length > 0 ? sortedMonths[0][0] : ''
  const lastMonthRevenue = sortedMonths.length > 0 ? sortedMonths[0][1] : 0

  // Mois précédent (pour calculer la variation)
  const previousMonthRevenue = sortedMonths.length > 1 ? sortedMonths[1][1] : 0
  
  // Variation par rapport au mois précédent
  const revenueVariation = previousMonthRevenue > 0 
    ? ((lastMonthRevenue - previousMonthRevenue) / previousMonthRevenue * 100) 
    : 0

  // Formater le nom du mois
  const formatMonthName = (monthKey: string) => {
    const [year, month] = monthKey.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1, 1)
    return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  }

  const lastMonthName = lastMonthKey ? formatMonthName(lastMonthKey) : ''

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
              <UserIcon className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Clients</div>
              <div className="text-xl font-bold text-gray-900">{totalClients}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <UserCog className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Admins</div>
              <div className="text-xl font-bold text-gray-900">{totalAdmins}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Total Utilisateurs</div>
              <div className="text-xl font-bold text-gray-900">{totalUsers}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Deuxième ligne de stats (Offres, Commandes, Revenu mensuel) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Package className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Offres actives</div>
              <div className="text-xl font-bold text-gray-900">{totalOffres}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Commandes</div>
              <div className="text-xl font-bold text-gray-900">{totalOrders}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-rose-100 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-rose-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Revenu total</div>
              <div className="text-xl font-bold text-gray-900">
                {totalRevenueAll.toLocaleString("fr-FR")} FCFA
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Revenu mensuel */}
      <div className="bg-white rounded-xl border p-5 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="h-5 w-5 text-indigo-500" />
          <h2 className="text-lg font-bold text-gray-900">Revenu mensuel</h2>
        </div>
        
        {lastMonthKey ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4 bg-gradient-to-br from-indigo-50 to-purple-50">
              <div className="text-sm text-gray-600 mb-1">Dernier mois</div>
              <div className="text-2xl font-bold text-indigo-700">
                {lastMonthRevenue.toLocaleString("fr-FR")} FCFA
              </div>
              <div className="text-sm text-gray-500 mt-1">{lastMonthName}</div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-2">Évolution mensuelle</div>
              {sortedMonths.length > 1 ? (
                <>
                  <div className={`text-lg font-bold ${revenueVariation >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {revenueVariation >= 0 ? '↑' : '↓'} {Math.abs(revenueVariation).toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Mois précédent: {previousMonthRevenue.toLocaleString("fr-FR")} FCFA
                  </div>
                </>
              ) : (
                <div className="text-sm text-gray-500">Pas assez de données</div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="text-sm text-gray-500">Aucune donnée de revenu disponible</div>
          </div>
        )}

        {/* Graphique simplifié des derniers mois */}
        {sortedMonths.length > 1 && (
          <div className="mt-4 pt-4 border-t">
            <div className="text-sm text-gray-600 mb-3">Évolution des revenus</div>
            <div className="flex items-end gap-2 h-20">
              {sortedMonths.slice(0, 6).reverse().map(([month, revenue]) => {
                const maxRevenue = Math.max(...sortedMonths.map(([, r]) => r), 1)
                const height = (revenue / maxRevenue) * 100
                return (
                  <div key={month} className="flex-1 flex flex-col items-center">
                    <div className="w-full flex justify-center">
                      <div 
                        className="w-full max-w-8 bg-indigo-500 rounded-t transition-all"
                        style={{ height: `${Math.max(height * 0.8, 4)}px` }}
                      />
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1 truncate w-full text-center">
                      {formatMonthName(month).slice(0, 3)}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Réseau le plus vendu */}
      {mostSoldNetwork && (
        <div className="bg-white rounded-xl border p-5 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Signal className="h-5 w-5 text-blue-500" />
            <h2 className="text-lg font-bold text-gray-900">Réseau le plus vendu</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
              <div className="text-sm text-gray-600 mb-1">Réseau leader</div>
              <div className="flex items-center gap-3">
                <div className="text-3xl font-bold text-blue-600">{mostSoldNetwork}</div>
                <span className="text-sm font-medium text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                  {mostSoldNetworkPercentage}% des ventes
                </span>
              </div>
              <div className="text-sm text-gray-500 mt-2">
                {mostSoldNetworkCount} commande{mostSoldNetworkCount > 1 ? 's' : ''} sur {totalOrders}
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-3">Top 3 des réseaux</div>
              <div className="space-y-2">
                {sortedNetworks.map(({ network, count, percentage }) => (
                  <div key={network} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{network}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{count} ({percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Vendeurs */}
      <div className="bg-white rounded-xl border p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Top Vendeurs</h2>
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            <span className="text-sm font-medium text-yellow-600">
              {topVendeursCount} vendeur{topVendeursCount > 1 ? 's' : ''} top
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Nombre de top vendeurs</div>
            <div className="text-3xl font-bold text-yellow-600">{topVendeursCount}</div>
            <div className="text-xs text-gray-500 mt-1">
              sur {totalVendeurs} vendeur{totalVendeurs > 1 ? 's' : ''}
            </div>
          </div>
          
          <div className="border rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Meilleurs vendeurs</div>
            {topVendeursCount > 0 ? (
              <>
                <div className="text-lg font-bold text-gray-900">
                  {topVendeursCount > 3 ? `${topVendeurs.slice(0, 3).map(v => v.username).join(', ')}...` : topVendeursNames}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {topVendeursCount > 3 ? `+ ${topVendeursCount - 3} autre(s)` : ''}
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-500">Aucun top vendeur pour le moment</div>
            )}
          </div>
        </div>
      </div>

      {/* Stats commandes */}
      <div className="bg-white rounded-xl border p-5 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Statut des commandes</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="border rounded-lg p-4 flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">En attente</div>
              <div className="text-2xl font-bold text-yellow-600">{pendingOrders}</div>
            </div>
            <Clock className="h-6 w-6 text-yellow-500 opacity-80" />
          </div>

          <div className="border rounded-lg p-4 flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">Payées</div>
              <div className="text-2xl font-bold text-indigo-600">{completedOrders}</div>
            </div>
            <CheckCircle className="h-6 w-6 text-indigo-500 opacity-80" />
          </div>

          <div className="border rounded-lg p-4 flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600 mb-1">Livrées</div>
              <div className="text-2xl font-bold text-green-600">{deliveredOrders}</div>
            </div>
            <Truck className="h-6 w-6 text-green-500 opacity-80" />
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

          <a href="/admin/users" className="block">
            <div className="bg-white rounded-xl border p-4 hover:bg-gray-50 transition">
              <div className="text-sm font-medium text-gray-900">Gérer les utilisateurs</div>
              <div className="text-xs text-gray-500 mt-1">Voir la liste des utilisateurs</div>
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}