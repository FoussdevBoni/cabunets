import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useVendeur } from "../../hooks/vendeurs/useVendeur"
import useOffres from "../../hooks/offres/useOffres"
import { OffresTable } from "../../components/common/lists/OffresTable"
import {
  Mail,
  Shield,
  ChevronLeft,
  Phone,
  ChevronLeft as LeftIcon,
  ChevronRight as RightIcon,
  User,
  ArrowRight,
  Globe,
  DollarSign,
  ChevronDown,
  ChevronUp
} from "lucide-react"

export default function VendeurDetailsPage() {
  const [searchParams] = useSearchParams()
  const vendeurId = searchParams.get("id")
  const [currentSlide, setCurrentSlide] = useState(0)
  const [expandedNetwork, setExpandedNetwork] = useState<string | null>(null)
  const navigate = useNavigate()
  const { vendeur, vendeurLoading } = useVendeur({ vendeurId: vendeurId! })
  const { data: offres, loading } = useOffres({ filters: { vendeurId } })

  if (loading || vendeurLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!vendeur) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Marchand non trouvé</h3>
          <p className="text-gray-600">Ce vendeur n'existe pas ou a été supprimé.</p>
        </div>
      </div>
    )
  }

  const hasMultiplePhotos = vendeur.photoUrls && vendeur.photoUrls.length > 1

  const nextSlide = () => {
    if (vendeur.photoUrls) {
      setCurrentSlide((prev) =>
        prev === vendeur.photoUrls.length - 1 ? 0 : prev + 1
      )
    }
  }

  const prevSlide = () => {
    if (vendeur.photoUrls) {
      setCurrentSlide((prev) =>
        prev === 0 ? vendeur.photoUrls.length - 1 : prev - 1
      )
    }
  }

  // Fonction pour gérer le clic sur un réseau
  const handleNetworkClick = (network: string) => {
    if (expandedNetwork === network) {
      setExpandedNetwork(null)
    } else {
      setExpandedNetwork(network)
    }
  }

  // Fonction pour obtenir les offres d'un réseau spécifique
  const getOffresByNetwork = (network: string) => {
    if (!offres) return []
    return offres.filter(offre => offre.network === network)
  }

  // Liste des réseaux actifs
  const activeNetworks = Object.entries(vendeur.networks)
    .filter(([_, active]) => active)
    .map(([name]) => name)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.history.back()}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h1 className="text-base font-medium md:text-lg">Détails du marchand</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Layout desktop */}
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Colonne gauche - Infos vendeur */}
          <div className="lg:col-span-1 mb-8 lg:mb-0">
            <div className="bg-white rounded-xl border overflow-hidden">
              {/* Slider d'images */}
              <div className="relative h-64 lg:h-72 bg-gray-200">
                {vendeur.photoUrls && vendeur.photoUrls.length > 0 ? (
                  <>
                    <img
                      src={vendeur.photoUrls[currentSlide]}
                      alt={vendeur.username}
                      className="w-full h-full object-cover"
                    />

                    {/* Badge vérifié */}
                    <div className="absolute top-4 left-4">
                      <div className="flex items-center gap-1 px-3 py-1.5 bg-primary/90 text-white rounded-full text-sm">
                        <Shield className="h-3 w-3" />
                        <span>Vérifié</span>
                      </div>
                    </div>

                    {/* Navigation */}
                    {hasMultiplePhotos && (
                      <>
                        <button
                          onClick={prevSlide}
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 transition"
                        >
                          <LeftIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={nextSlide}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 transition"
                        >
                          <RightIcon className="h-5 w-5" />
                        </button>

                        {/* Compteur */}
                        <div className="absolute bottom-4 right-4 bg-black/70 text-white px-2 py-1 rounded text-sm">
                          {currentSlide + 1} / {vendeur.photoUrls.length}
                        </div>

                        {/* Dots */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                          {vendeur.photoUrls.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentSlide(index)}
                              className={`h-2 w-2 rounded-full ${index === currentSlide ? 'bg-white' : 'bg-white/50'
                                }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-3xl font-bold text-primary">
                        {vendeur.username?.charAt(0)?.toUpperCase() || 'M'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Informations */}
              <div className="p-6">
                {/* En-tête */}
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {vendeur.username}
                  </h2>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">{vendeur.email}</span>
                  </div>
                </div>

                {/* Avantage */}
                {vendeur.advantage && (
                  <div className="mb-6">
                    <p className="text-gray-700">{vendeur.advantage}</p>
                  </div>
                )}

                {/* Bouton WhatsApp */}
                <a
                  href={`https://wa.me/${vendeur.whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition flex items-center justify-center gap-2 mb-8"
                >
                  <Phone className="h-5 w-5" />
                  Contacter sur WhatsApp
                </a>
              </div>
            </div>
          </div>

          {/* Colonne droite - Réseaux en accordéon et offres */}
          <div className="lg:col-span-2">
            {/* Section Réseaux en accordéon */}
            <div className="bg-white rounded-xl border overflow-hidden mb-6">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-gray-500" />
                    <h2 className="text-xl font-bold text-gray-900">
                      Réseaux et offres ({activeNetworks.length})
                    </h2>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {activeNetworks.length > 0 ? (
                  <div className="space-y-4">
                    {activeNetworks.map((network) => {
                      const networkOffres = getOffresByNetwork(network)
                      const isExpanded = expandedNetwork === network

                      return (
                        <div
                          key={network}
                          className="border rounded-lg overflow-hidden transition-all duration-200"
                        >
                          {/* En-tête de l'accordéon */}
                          <button
                            onClick={() => handleNetworkClick(network)}
                            className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition"
                          >
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-gray-900">{network}</span>
                              <span className="bg-primary/10 text-primary text-sm px-2 py-1 rounded">
                                {networkOffres.length} offre{networkOffres.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {isExpanded ? (
                                <ChevronUp className="h-5 w-5 text-gray-500" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-gray-500" />
                              )}
                            </div>
                          </button>

                          {/* Contenu de l'accordéon */}
                          {isExpanded && (
                            <div className="border-t">
                              {networkOffres.length > 0 ? (
                                <div className="p-4">
                                  <OffresTable offres={networkOffres} />
                                  {networkOffres.length > 5 && (
                                    <div className="text-center pt-4 border-t mt-4">
                                      <button
                                        onClick={() => navigate(`/offres?network=${network}&vendeur=${vendeur?.id}`)}
                                        className="text-primary hover:text-primary/80 font-medium"
                                      >
                                        Voir toutes les offres {network} →
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="p-4 text-center py-6">
                                  <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <User className="h-6 w-6 text-gray-400" />
                                  </div>
                                  <h4 className="text-sm font-medium text-gray-900 mb-1">Aucune offre pour ce réseau</h4>
                                  <p className="text-gray-600 text-sm">
                                    Ce vendeur n'a pas encore publié d'offres pour {network}.
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Globe className="h-8 w-8 text-gray-400" />
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">Aucun réseau activé</h4>
                    <p className="text-gray-600">
                      Ce vendeur n'a pas encore activé de réseaux.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Section Toutes les offres (optionnelle) */}
            {offres && offres.length > 0 && (
              <div className="bg-white rounded-xl border overflow-hidden mb-6">
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">
                      Toutes les offres ({offres.length})
                    </h2>
                    <button
                      onClick={() => navigate(`/offres?vendeurId=${vendeurId}`)}
                      className="text-primary hover:text-primary/80 font-medium"
                    >
                      Voir toutes →
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <OffresTable offres={offres.slice(0, 5)} />
                  {offres.length > 5 && (
                    <div className="text-center pt-4 border-t mt-4">
                      <button
                        onClick={() => navigate(`/offres?vendeurId=${vendeurId}`)}
                        className="text-primary hover:text-primary/80 font-medium"
                      >
                        Voir les {offres.length - 5} offres supplémentaires
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Note */}
            <div className="text-center">
              <p className="text-sm text-gray-500">
                Toutes les transactions sont gérées directement entre le vendeur et l'acheteur
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}