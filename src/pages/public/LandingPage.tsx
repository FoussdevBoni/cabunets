import { Link, useNavigate } from 'react-router-dom'
import { 
  Loader2, 
  CheckCircle, 
  Smartphone, 
  Clock, 
  ChevronRight,
  UserPlus,
 
} from 'lucide-react'
import useVendeurs from '../../hooks/vendeurs/useVendeurs'
import { useAuth } from '../../hooks/auth/useAuth'
import PublicLayout from '../../layouts/public/PublicLayout'

export default function LandingPage() {
  const { data: vendeurs, loading } = useVendeurs({})
  const { user } = useAuth() // Hook qui retourne l'utilisateur connecté
  const navigate = useNavigate()

 


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Chargement des marchands...</p>
        </div>
      </div>
    )
  }

  return (
    <PublicLayout>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero section */}
        <div className="text-center mb-12 pt-8">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Trouvez les meilleurs{' '}
            <span className="text-primary">marchands</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Plateforme professionnelle pour vos transactions. Simple, fiable, efficace.
          </p>
          
          {/* Bouton CTA visible si utilisateur n'est pas connecté */}
          {!user && (
            <div className="mt-8">
              <button
                onClick={() => navigate('/vendeur-register')}
                className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition-all duration-200 shadow-sm hover:shadow"
              >
                <UserPlus className="h-5 w-5" />
                Commencer maintenant
              </button>
            </div>
          )}
        </div>

     
        {/* Grille des vendeurs */}
        {vendeurs && vendeurs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendeurs.map((vendeur) => (
              <div
                key={vendeur.id}
                className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Image */}
                <div className="relative h-56 overflow-hidden bg-gray-100">
                  {vendeur.avatar ? (
                    <>
                      <img
                        src={vendeur.avatar}
                        alt={vendeur.username}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-2xl font-bold text-primary">
                          {vendeur.username?.charAt(0)?.toUpperCase() || 'M'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Contenu */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {vendeur.username}
                      </h3>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-6 line-clamp-2">
                    {vendeur.advantage}
                  </p>

                  {/* Réseaux */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Smartphone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">Réseaux actifs</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(vendeur.networks || {}).map(([name, active]) => (
                        active && (
                          <span
                            key={name}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium"
                          >
                            <CheckCircle className="h-3 w-3" />
                            {name}
                          </span>
                        )
                      ))}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="border-t border-gray-100 pt-4">
                    <button
                      onClick={() => navigate(`/vendeur-details?id=${vendeur.id}`)}
                      className="w-full flex items-center justify-between group/btn text-primary hover:text-primary/80 font-medium py-3 transition-all duration-200"
                    >
                      <span>Voir les offres</span>
                      <ChevronRight className="h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucun marchand disponible
            </h3>
            <p className="text-gray-600 mb-6">
              Soyez le premier à rejoindre la plateforme
            </p>
            <button
              onClick={() => navigate('/vendeur/register')}
              className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-primary/90 transition shadow-sm hover:shadow"
            >
              <UserPlus className="h-5 w-5" />
              Commencer maintenant
            </button>
          </div>
        )}
      </main>
    </PublicLayout>
  )
}