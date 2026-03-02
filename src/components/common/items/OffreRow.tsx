import { Smartphone, DollarSign, Zap, Clock, Shield, ArrowRight } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { Offre } from "../../../utils/database"

interface OffreRowProps {
  offre: Offre
  userId?: string
}

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

export default function OffreRow({ offre, userId }: OffreRowProps) {
  const isPrivate = userId ? userId === offre.vendeurId : false
  const networkConfig = NETWORK_CONFIG[offre.network]
  const navigate = useNavigate()

  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <tr className={`bg-white border-b ${networkConfig.borderColor} hover:bg-gray-50 transition-colors`}>
      {/* Réseau - Adapté mobile */}
      <td className="px-4 py-4 md:px-6">
        <div className="flex items-center gap-3">
          <div className="min-w-0">
            <div className="font-medium text-gray-900 truncate">{networkConfig.name}</div>
            <div className="flex items-center gap-1 md:gap-2">
              <div className={`h-1.5 w-1.5 md:h-2 md:w-2 rounded-full ${networkConfig.color}`}></div>
              <span className="text-xs md:text-sm text-gray-600 truncate">{offre.network}</span>
            </div>
         
          </div>
        </div>
      </td>

      {/* Unités - Adapté mobile */}
      <td className="px-4 py-4 md:px-6">
        <div className="flex flex-col">
        
          <div className="text-lg md:text-xl font-bold text-gray-900">
            {offre.units.toLocaleString()}
          </div>
        </div>
      </td>

      {/* Prix - Adapté mobile */}
      <td className="px-4 py-4 md:px-6">
        <div className="flex flex-col">
          <div className="text-lg md:text-xl font-bold text-gray-900">
            ${offre.priceUSD.toFixed(2)}
          </div>
          <div className="text-xs md:text-sm text-gray-500">
            {offre.priceFC.toLocaleString()} FC
          </div>
        </div>
      </td>

      {/* Date (seulement sur desktop) - Adapté mobile */}
      <td className="hidden md:table-cell px-6 py-4">
        {isPrivate && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>Publié {formatDate(offre.createdAt!)}</span>
          </div>
        )}
      </td>

      

      {/* Action - Adapté mobile */}
      <td className="px-4 py-4 md:px-6">
        <div className="flex justify-end">
          <button 
            onClick={(e) => {
              e.preventDefault()
              if (isPrivate) {
                navigate(`/vendeur/modifier-offre?id=${offre.id}`)
              } else {
                navigate(`/checkout?offer=${offre.id}`)
              }
            }}
            className="flex items-center gap-1 md:gap-2 text-primary font-medium hover:text-primary/80 transition-colors"
          >
            <span className="text-sm md:text-base">{isPrivate ? "Modifier" : "Acheter"}</span>
            <ArrowRight className="h-3 w-3 md:h-4 md:w-4 transition-transform hover:translate-x-0.5" />
          </button>
        </div>
      </td>
    </tr>
  )
}