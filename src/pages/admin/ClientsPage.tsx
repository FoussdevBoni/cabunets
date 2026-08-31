import { useState, useMemo } from "react"
import { Search, Trash2, AlertCircle, ChevronLeft, Users, UserIcon, Filter, Phone, MapPin } from "lucide-react"
import { User } from "../../utils/database"
import useUsers from "../../hooks/users/useUsers"

interface FilterState {
  search: string
}

export default function ClientsPage() {
  const { data: users, loading, refresh, deleteItem: deleteUser } = useUsers({})
  const [filters, setFilters] = useState<FilterState>({
    search: ''
  })
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Filtrer uniquement les clients
  const clients = useMemo(() => {
    if (!users) return []
    return users.filter(user => user.role === 'client')
  }, [users])

  // Statistiques
  const stats = useMemo(() => {
    return {
      total: clients.length,
      avecWhatsapp: clients.filter(u => {
        const profile = u.profile as any
        return profile?.whatsappNumber
      }).length,
      avecAdresse: clients.filter(u => {
        const profile = u.profile as any
        return profile?.address
      }).length,
    }
  }, [clients])

  // Filtrage
  const filteredClients = useMemo(() => {
    if (!clients) return []
    
    return clients.filter(user => {
      // Filtre par recherche
      const searchTerm = filters.search.toLowerCase()
      if (searchTerm) {
        const profile = user.profile as any
        return (
          user.username.toLowerCase().includes(searchTerm) ||
          user.email.toLowerCase().includes(searchTerm) ||
          (profile?.nom && profile.nom.toLowerCase().includes(searchTerm)) ||
          (profile?.whatsappNumber && profile.whatsappNumber.includes(searchTerm)) ||
          (profile?.tel && profile.tel.includes(searchTerm)) ||
          (profile?.address && profile.address.toLowerCase().includes(searchTerm))
        )
      }

      return true
    })
  }, [clients, filters])

  const getProfileInfo = (user: User) => {
    const profile = user.profile as any
    return {
      nom: profile?.nom || 'Non renseigné',
      whatsapp: profile?.whatsappNumber || 'Non renseigné',
      tel: profile?.tel || 'Non renseigné',
      address: profile?.address || 'Adresse non renseignée',
      paymentAmount: profile?.paymentAmount || 0
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
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
              <h1 className="text-base font-medium">
                Clients ({filteredClients.length})
              </h1>
              <p className="text-xs text-gray-500">Gestion des clients</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Total Clients</span>
              <UserIcon className="h-4 w-4 text-blue-400" />
            </div>
            <p className="text-2xl font-bold mt-1 text-blue-600">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">WhatsApp</span>
              <Phone className="h-4 w-4 text-green-400" />
            </div>
            <p className="text-2xl font-bold mt-1 text-green-600">{stats.avecWhatsapp}</p>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Avec adresse</span>
              <MapPin className="h-4 w-4 text-purple-400" />
            </div>
            <p className="text-2xl font-bold mt-1 text-purple-600">{stats.avecAdresse}</p>
          </div>
        </div>

        {/* Filtres */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un client (nom, WhatsApp, téléphone, adresse...)"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-10 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary transition text-sm"
            />
          </div>
        </div>

        {/* Tableau */}
        {filteredClients.length === 0 ? (
          <div className="bg-white rounded-xl border p-8 text-center">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="font-medium text-gray-900 mb-2">
              {filters.search 
                ? "Aucun client correspondant" 
                : "Aucun client"}
            </h3>
            <p className="text-sm text-gray-500">
              {filters.search 
                ? "Essayez de modifier votre recherche" 
                : "Aucun client n'est encore inscrit"}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      WhatsApp
                    </th>
                 
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Adresse
                    </th>
              
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Inscrit le
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredClients.map((user) => {
                    const profile = getProfileInfo(user)
                    return (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            {user.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.username}
                                className="h-8 w-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-xs font-bold text-blue-600">
                                  {user.username.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {user.username}
                              </div>
                              <div className="text-xs text-gray-500 truncate max-w-[120px]">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {profile.whatsapp}
                          </div>
                        </td>
                       
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-500 max-w-[200px] truncate">
                            {profile.address}
                          </div>
                        </td>
                    
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          }) : 'N/A'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button
                            onClick={() => setDeleteConfirm(user.id!)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal confirmation suppression */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <div className="text-center mb-6">
                <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">
                  Supprimer ce client ?
                </h3>
                <p className="text-gray-600 text-sm">
                  Cette action est irréversible. Toutes les données associées à ce client seront également supprimées.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2.5 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
                  disabled={deleting}
                >
                  Annuler
                </button>
                <button
                  onClick={async () => {
                    setDeleting(true)
                    try {
                      await deleteUser(deleteConfirm)
                      refresh()
                      setDeleteConfirm(null)
                    } catch (error) {
                      console.error("Erreur:", error)
                      alert("Erreur lors de la suppression")
                    } finally {
                      setDeleting(false)
                    }
                  }}
                  disabled={deleting}
                  className="flex-1 bg-red-600 text-white py-2.5 rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50"
                >
                  {deleting ? "Suppression..." : "Supprimer"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}