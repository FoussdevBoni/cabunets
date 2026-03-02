import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Plus, Search } from "lucide-react"
import useOffres from "../../hooks/offres/useOffres"
import { useAuth } from "../../hooks/auth/useAuth"
import { OffresTable } from "../../components/common/lists/OffresTable"

export default function OffresPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: offres, loading } = useOffres({ filters: { vendeurId: user?.id } })
  
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedNetwork, setSelectedNetwork] = useState<string>("all")

  // Filtrage des offres
  const filteredOffres = offres?.filter(offre => {
    const matchesSearch = 
      offre.vendeurName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      offre.network.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesNetwork = 
      selectedNetwork === "all" || offre.network === selectedNetwork
    
    return matchesSearch && matchesNetwork
  }) || []

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* En-tête simple */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Offres</h1>
            <p className="text-gray-600 mt-1">
              {filteredOffres.length} offre{filteredOffres.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <button
              onClick={() => navigate("/vendeur/nouvelle-offre")}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Ajouter une offre</span>
          </button>
        </div>

        {/* Filtres */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Barre de recherche */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary transition"
              />
            </div>
          </div>

          {/* Sélection réseau */}
          <select
            value={selectedNetwork}
            onChange={(e) => setSelectedNetwork(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary transition md:w-48"
          >
            <option value="all">Tous les réseaux</option>
            <option value="Airtel">Airtel</option>
            <option value="Vodacom">Vodacom</option>
            <option value="Africell">Africell</option>
            <option value="Orange">Orange</option>
          </select>
        </div>
      </div>

      {/* Liste des offres */}
      <div className="bg-white rounded-xl border border-gray-200">
        {filteredOffres.length > 0 ? (
          <OffresTable 
            offres={filteredOffres} 
            userId={user?.id} 
          />
        ) : (
          <div className="text-center py-16">
            <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucune offre trouvée
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedNetwork !== "all" 
                ? "Essayez de modifier vos critères de recherche" 
                : "Soyez le premier à créer une offre"
              }
            </p>
            <button
              onClick={() => navigate("/vendeur/nouvelle-offre")}
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition"
            >
              <Plus className="h-5 w-5" />
              Créer une offre
            </button>
          </div>
        )}
      </div>
    </div>
  )
}