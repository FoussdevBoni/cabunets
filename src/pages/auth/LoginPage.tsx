import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Eye, EyeOff, Mail, Lock, LogIn } from "lucide-react"
import useToken from "../../hooks/auth/useToken"
import { authService } from "../../services/authService"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  const { saveToken } = useToken()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!email || !password) {
      setError("Veuillez remplir tous les champs")
      return
    }

    setLoading(true)

    try {
      const response = await authService.login(email, password)

      if (response.token) {
        saveToken(response.token)
        navigate(`/redirect?token=${response.token}`)
      } else {
        setError("Token non reçu")
      }
    } catch (error: any) {
      console.error("Erreur de connexion:", error)
      setError(error.message || "Email ou mot de passe incorrect")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header avec logo */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center cursor-pointer" onClick={() => navigate("/")}>
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="h-8 w-auto"
              />
            </div>
            
            {/* Lien d'inscription */}
            <div className="flex items-center gap-4">
              <p className="text-gray-600 text-sm hidden sm:block">
                Pas encore de compte?
              </p>
              <Link
                to="/vendeur-register"
                className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition"
              >
                <LogIn className="h-4 w-4" />
                S'inscrire
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          {/* Carte de connexion */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            {/* En-tête */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <LogIn className="h-6 w-6 text-primary" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Connexion
              </h2>
              <p className="mt-2 text-gray-600">
                Accédez à votre espace personnel
              </p>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Message d'erreur */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Champ email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                    placeholder="vous@exemple.com"
                  />
                </div>
              </div>

              {/* Champ mot de passe */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Mot de passe
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-primary hover:text-primary/80 transition"
                  >
                    Mot de passe oublié?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Bouton de soumission */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-3.5 px-4 rounded-lg font-medium hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Connexion en cours...
                  </div>
                ) : (
                  "Se connecter"
                )}
              </button>

              {/* Lien d'inscription mobile */}
              <div className="pt-4 border-t border-gray-100">
                <p className="text-center text-gray-600 text-sm">
                  Pas encore de compte?{' '}
                  <Link
                    to="/vendeur-register"
                    className="text-primary font-medium hover:text-primary/80 transition"
                  >
                    Créer un compte
                  </Link>
                </p>
              </div>
            </form>

         
          </div>

          {/* Informations légales */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              En vous connectant, vous acceptez nos{' '}
              <Link to="/terms" className="text-primary hover:underline">
                Conditions d'utilisation
              </Link>{' '}
              et notre{' '}
              <Link to="/privacy" className="text-primary hover:underline">
                Politique de confidentialité
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer simple */}
      <footer className="py-6 border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-600 text-sm">
              © {new Date().getFullYear()} Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}