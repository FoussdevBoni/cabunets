// src/pages/NotFoundPage.tsx
import { useNavigate } from "react-router-dom"
import { Home, ArrowLeft, Search, Package } from "lucide-react"

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-8 text-center">
        {/* Image/Icon */}
        <div className="relative w-32 h-32 mx-auto mb-6">
          <div className="absolute inset-0 bg-primary/10 rounded-full animate-pulse"></div>
          <div className="relative flex items-center justify-center w-full h-full">
            <Package className="w-16 h-16 text-primary" />
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center">
              404
            </div>
          </div>
        </div>

        {/* Titre */}
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Page non trouvée
        </h1>
        
        <p className="text-gray-600 mb-2">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        
        <p className="text-sm text-gray-400 mb-8">
          Erreur 404 - Page introuvable
        </p>

        {/* Suggestions */}
        <div className="bg-gray-50 rounded-xl p-4 mb-8 text-left">
          <p className="text-sm font-medium text-gray-700 mb-2">
            🔍 Suggestions :
          </p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Vérifiez l'URL dans la barre d'adresse</li>
            <li>• Utilisez la navigation du site</li>
            <li>• Retournez à l'accueil</li>
          </ul>
        </div>

        {/* Boutons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate("/")}
            className="w-full bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary/90 transition flex items-center justify-center gap-2 font-medium shadow-lg shadow-primary/20"
          >
            <Home className="w-5 h-5" />
            Retour à l'accueil
          </button>
          
          <button
            onClick={() => navigate(-1)}
            className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition flex items-center justify-center gap-2 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Page précédente
          </button>

          <button
            onClick={() => window.location.reload()}
            className="w-full border border-gray-300 text-gray-600 px-6 py-3 rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-2 font-medium"
          >
            <Search className="w-5 h-5" />
            Rechercher
          </button>
        </div>

        {/* Footer */}
        <p className="mt-6 text-xs text-gray-400">
          Besoin d'aide ? Contactez le support
        </p>
      </div>
    </div>
  )
}