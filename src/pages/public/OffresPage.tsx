import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Search, ChevronLeft, Filter } from "lucide-react"
import useOffres from "../../hooks/offres/useOffres"
import { OffresTable } from "../../components/common/lists/OffresTable"
import { useVendeur } from "../../hooks/vendeurs/useVendeur"

export default function OffresPage() {
  const [searchParams] = useSearchParams()
  const network = searchParams.get("network")
  const vendeurId = searchParams.get("vendeur")
  const navigate = useNavigate()

  const { data: offres, loading } = useOffres({ filters: { network: network || undefined } })
  const { vendeur } = useVendeur({ vendeurId: vendeurId! })
  
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedNetwork, setSelectedNetwork] = useState<string>(network || "all")
  const [showMobileFilters, setShowMobileFilters] = useState(false)

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
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  // Réseaux disponibles pour les filtres
  const availableNetworks = Array.from(new Set(offres?.map(o => o.network) || []))
    .sort()
    .filter(Boolean)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              {vendeur ? (
                <div>
                  <h1 className="text-lg sm:text-xl font-medium">Offres de {vendeur.username}</h1>
                  <p className="text-sm text-gray-500">{filteredOffres.length} offre{filteredOffres.length !== 1 ? 's' : ''}</p>
                </div>
              ) : network ? (
                <div>
                  <h1 className="text-lg sm:text-xl font-medium">Offres {network}</h1>
                  <p className="text-sm text-gray-500">{filteredOffres.length} offre{filteredOffres.length !== 1 ? 's' : ''}</p>
                </div>
              ) : (
                <div>
                  <h1 className="text-lg sm:text-xl font-medium">Toutes les offres</h1>
                  <p className="text-sm text-gray-500 hidden sm:block">{filteredOffres.length} offre{filteredOffres.length !== 1 ? 's' : ''}</p>
                </div>
              )}
            </div>

            {/* Bouton filtre mobile */}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <Filter className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar filtres - Desktop */}
          <div className="hidden lg:block w-full lg:w-64 xl:w-72 flex-shrink-0">
            <div className="bg-white rounded-xl border p-6 sticky top-24">
              <h3 className="font-medium text-gray-900 mb-4">Filtres</h3>
              
              {/* Barre de recherche */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rechercher
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Vendeur ou réseau..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition"
                  />
                </div>
              </div>

              {/* Sélection réseau */}
              {!network && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Réseau
                  </label>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedNetwork("all")}
                      className={`w-full text-left px-4 py-2 rounded-lg transition ${selectedNetwork === "all"
                        ? "bg-primary/10 text-primary border border-primary"
                        : "hover:bg-gray-50 border border-transparent"
                      }`}
                    >
                      Tous les réseaux
                    </button>
                    {availableNetworks.map(net => (
                      <button
                        key={net}
                        onClick={() => setSelectedNetwork(net)}
                        className={`w-full text-left px-4 py-2 rounded-lg transition ${selectedNetwork === net
                          ? "bg-primary/10 text-primary border border-primary"
                          : "hover:bg-gray-50 border border-transparent"
                        }`}
                      >
                        {net}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Info filtre actif */}
              {network && (
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Réseau sélectionné:
                    </span>
                    <button
                      onClick={() => {
                        setSelectedNetwork("all")
                        navigate("/offres")
                      }}
                      className="text-sm text-primary hover:text-primary/80"
                    >
                      Effacer
                    </button>
                  </div>
                  <div className="text-lg font-bold text-primary">{network}</div>
                </div>
              )}

              {/* Statistiques */}
              <div className="mt-8 pt-6 border-t">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Statistiques</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Offres totales:</span>
                    <span className="font-medium">{offres?.length || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Filtrées:</span>
                    <span className="font-medium">{filteredOffres.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Réseaux:</span>
                    <span className="font-medium">{availableNetworks.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="flex-1">
            {/* Filtres mobiles */}
            {showMobileFilters && (
              <div className="lg:hidden bg-white rounded-xl border p-4 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900">Filtres</h3>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                {/* Barre de recherche mobile */}
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher un vendeur..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition text-sm"
                    />
                  </div>
                </div>

                {/* Sélection réseau mobile */}
                {!network && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Réseau
                    </label>
                    <select
                      value={selectedNetwork}
                      onChange={(e) => setSelectedNetwork(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition"
                    >
                      <option value="all">Tous les réseaux</option>
                      {availableNetworks.map(net => (
                        <option key={net} value={net}>{net}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Info filtre actif mobile */}
                {network && (
                  <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg mb-4">
                    <div>
                      <span className="text-sm text-gray-700">
                        Réseau: <span className="font-medium">{network}</span>
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedNetwork("all")
                        navigate("/offres")
                      }}
                      className="text-sm text-primary hover:text-primary/80"
                    >
                      Effacer
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Filtres rapides desktop (en haut de la liste) */}
            <div className="hidden lg:flex items-center justify-between mb-6 bg-white rounded-xl border p-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition"
                  />
                </div>
                
                {!network && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Réseau:</span>
                    <select
                      value={selectedNetwork}
                      onChange={(e) => setSelectedNetwork(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition"
                    >
                      <option value="all">Tous</option>
                      {availableNetworks.map(net => (
                        <option key={net} value={net}>{net}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="text-sm text-gray-600">
                {filteredOffres.length} résultat{filteredOffres.length !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Liste des offres */}
            {filteredOffres.length > 0 ? (
              <div className="bg-white rounded-xl border overflow-hidden">
              
                <OffresTable offres={filteredOffres} />
              </div>
            ) : (
              <div className="bg-white rounded-xl border p-8 text-center">
                <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || selectedNetwork !== "all" 
                    ? "Aucune offre correspondante" 
                    : "Aucune offre disponible"}
                </h3>
                <p className="text-gray-600">
                  {searchTerm || selectedNetwork !== "all" 
                    ? "Essayez de modifier vos critères de recherche" 
                    : vendeur 
                      ? "Ce vendeur n'a pas encore publié d'offres" 
                      : "Aucun vendeur n'a publié d'offres pour le moment"}
                </p>
                {(searchTerm || selectedNetwork !== "all") && (
                  <button
                    onClick={() => {
                      setSearchTerm("")
                      setSelectedNetwork("all")
                    }}
                    className="mt-4 px-4 py-2 text-primary hover:text-primary/80 transition"
                  >
                    Réinitialiser les filtres
                  </button>
                )}
              </div>
            )}

            {/* Pagination/info supplémentaire */}
            {filteredOffres.length > 0 && (
              <div className="mt-6 text-center text-sm text-gray-600">
                Affichage de {filteredOffres.length} offre{filteredOffres.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}