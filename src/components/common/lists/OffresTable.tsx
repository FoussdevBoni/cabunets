import { FC } from "react"
import { Smartphone, PlusCircle } from "lucide-react"
import OffreRow from "../items/OffreRow"
import { Offre } from "../../../utils/database"

const NETWORK_CONFIG = {
  Airtel: {
    color: "bg-red-500",
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    borderColor: "border-red-200",
    name: "Airtel"
  },
  Vodacom: {
    color: "bg-green-500",
    bgColor: "bg-green-50",
    textColor: "text-green-700",
    borderColor: "border-green-200",
    name: "Vodacom"
  },
  Africell: {
    color: "bg-purple-500",
    bgColor: "bg-purple-50",
    textColor: "text-purple-700",
    borderColor: "border-purple-200",
    name: "Africell"
  },
  Orange: {
    color: "bg-orange-500",
    bgColor: "bg-orange-50",
    textColor: "text-orange-700",
    borderColor: "border-orange-200",
    name: "Orange"
  }
}

interface OffresTableProps {
  offres: Offre[]
  userId?: string
}

export const OffresTable: FC<OffresTableProps> = ({ offres, userId }) => {
  // Grouper les offres par réseau
  const groupedOffres = offres.reduce((acc, offre) => {
    if (!acc[offre.network]) {
      acc[offre.network] = []
    }
    acc[offre.network].push(offre)
    return acc
  }, {} as Record<string, Offre[]>)

  // Trier les réseaux dans un ordre spécifique
  const networkOrder = ["Vodacom", "Airtel", "Orange", "Africell"]

  return (
    <div className="space-y-8">
      {Object.keys(groupedOffres).length === 0 ? (
        <div className="text-center py-12">
          <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Smartphone className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Aucune offre disponible
          </h3>
          <p className="text-gray-600">
            Soyez le premier à créer une offre
          </p>
        </div>
      ) : (
        networkOrder
          .filter(network => groupedOffres[network])
          .map((network) => (
            <div key={network} className="space-y-4">
              {/* En-tête du réseau */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-1 ${NETWORK_CONFIG[network as keyof typeof NETWORK_CONFIG].color} rounded-full`}></div>
                  <h2 className="text-lg md:text-2xl font-bold text-gray-900">
                    {NETWORK_CONFIG[network as keyof typeof NETWORK_CONFIG].name}
                  </h2>
                </div>
                <span className="text-sm text-gray-500">
                  {groupedOffres[network].length} offre{groupedOffres[network].length > 1 ? 's' : ''}
                </span>
              </div>

              {/* Table responsive */}
              <div className="overflow-x-auto">
                <table className="w-full min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 md:px-6 text-left text-xs md:text-sm font-medium text-gray-700 uppercase tracking-wider">
                        <span className="hidden md:inline">Réseau</span>
                        <span className="md:hidden">Offre</span>
                      </th>
                      <th className="px-4 py-3 md:px-6 text-left text-xs md:text-sm font-medium text-gray-700 uppercase tracking-wider">
                        Unités
                      </th>
                      <th className="px-4 py-3 md:px-6 text-left text-xs md:text-sm font-medium text-gray-700 uppercase tracking-wider">
                        Prix
                      </th>
                      <th className="hidden md:table-cell px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="hidden md:table-cell px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-4 py-3 md:px-6 text-left text-xs md:text-sm font-medium text-gray-700 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {groupedOffres[network]
                      .sort((a, b) => a.priceUSD - b.priceUSD)
                      .map((offre) => (
                        <OffreRow
                          key={offre.id} 
                          offre={offre} 
                          userId={userId} 
                        />
                      ))
                    }
                  </tbody>
                </table>
              </div>
            </div>
          ))
      )}

      {/* Bouton pour créer une offre */}
      {userId && (
        <div className="fixed bottom-6 md:bottom-8 right-6 md:right-8 z-10">
          <button className="bg-primary text-white p-3 md:p-4 rounded-full shadow-lg hover:bg-primary/90 transition-all duration-200 hover:scale-105 hover:shadow-xl">
            <div className="flex items-center gap-1 md:gap-2">
              <PlusCircle className="h-4 w-4 md:h-5 md:w-5" />
              <span className="hidden md:inline text-sm">Créer offre</span>
            </div>
          </button>
        </div>
      )}
    </div>
  )
}