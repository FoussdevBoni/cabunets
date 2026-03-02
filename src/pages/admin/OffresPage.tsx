import { useState } from "react"
import useOffres from '../../hooks/offres/useOffres'
import { Search, ChevronLeft } from "lucide-react"
import { formatDate } from "../../functions/formatDate"


export default function AdminOffresPage() {
  const { data: offres, loading: offresLoading } = useOffres({})
  const [search, setSearch] = useState("")
  const [networkFilter, setNetworkFilter] = useState<string>("all")

  if (offresLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const filteredOffres = offres?.filter(offre => {
    const matchesSearch = 
      offre.vendeurName.toLowerCase().includes(search.toLowerCase()) ||
      offre.network.toLowerCase().includes(search.toLowerCase())
    
    const matchesNetwork = networkFilter === "all" || offre.network === networkFilter
    
    return matchesSearch && matchesNetwork
  }) || []

  const getNetworkColor = (network: string) => {
    switch (network) {
      case "Airtel": return "bg-red-100 text-red-800"
      case "Vodacom": return "bg-green-100 text-green-800"
      case "Africell": return "bg-purple-100 text-purple-800"
      case "Orange": return "bg-orange-100 text-orange-800"
      default: return "bg-gray-100 text-gray-800"
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
              <h1 className="text-base font-medium">Toutes les offres</h1>
              <p className="text-xs text-gray-500">{filteredOffres.length} offre{filteredOffres.length !== 1 ? 's' : ''}</p>
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
              placeholder="Rechercher par vendeur ou réseau..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary transition text-sm"
            />
          </div>

          {/* Filtre réseau */}
          <select
            value={networkFilter}
            onChange={(e) => setNetworkFilter(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary transition text-sm"
          >
            <option value="all">Tous les réseaux</option>
            <option value="Airtel">Airtel</option>
            <option value="Vodacom">Vodacom</option>
            <option value="Africell">Africell</option>
            <option value="Orange">Orange</option>
          </select>
        </div>

        {/* Tableau */}
        {filteredOffres.length === 0 ? (
          <div className="bg-white rounded-xl border p-8 text-center">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="font-medium text-gray-900 mb-2">
              {search || networkFilter !== "all" 
                ? "Aucune offre correspondante" 
                : "Aucune offre"}
            </h3>
            <p className="text-gray-600 text-sm">
              {search || networkFilter !== "all" 
                ? "Modifiez vos critères de recherche" 
                : "Aucune offre n'a été publiée"}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vendeur
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Réseau
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prix
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unités
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredOffres.map((offre) => (
                    <tr key={offre.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{offre.vendeurName}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getNetworkColor(offre.network)}`}>
                          {offre.network}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{offre.priceFC} FC</div>
                          <div className="text-gray-500 text-xs">${offre.priceUSD}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {offre.units.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(offre.createdAt!)}
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