import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Phone,
  Mail,
  UserIcon,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { authService } from "../../../services/authService"
import { useAuth } from "../../../hooks/auth/useAuth"
import useToken from "../../../hooks/auth/useToken"

export default function AcheteurRegisterForm() {
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string>("")
  const { saveToken } = useToken()
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [termsError, setTermsError] = useState<string>("")

  const [form, setForm] = useState({
    email: '',
    username: '',
    password: '',
    whatsappNumber: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setTermsError("")

    if (!form.whatsappNumber || !form.email || !form.password || !form.username) {
      setError("Veuillez remplir tous les champs obligatoires")
      return
    }

    if (!acceptTerms) {
      setTermsError("Vous devez accepter les conditions d'utilisation et la politique de confidentialité")
      return
    }

    setLoading(true)

    try {
      const registerRes = await authService.register(
        form.email,
        form.password,
        form.username,
        "",
        'client',
        { whatsappNumber: form.whatsappNumber }
      )

      if (registerRes.token) {
        saveToken(registerRes.token)
        const user = await authService.getUserProfile(registerRes.token)
        setUser(user)
        navigate('/client/overview')
      }

    } catch (error: any) {
      console.error("Erreur lors de l'inscription:", error)
      const errorMessage = authService.getAuthError(error)
      setError(errorMessage || "Une erreur est survenue lors de l'inscription")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-4 border-b border-gray-100">
          Informations personnelles
        </h3>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom d'utilisateur *
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                required
                value={form.username}
                onChange={(e) => setForm(prev => ({ ...prev, username: e.target.value }))}
                className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                placeholder="johndoe"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Numéro WhatsApp *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="tel"
                required
                value={form.whatsappNumber}
                onChange={(e) => setForm(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                placeholder="+243 81 562 5169"
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Nous utiliserons ce numéro WhatsApp pour vous contacter
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={form.password}
                onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
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
            <p className="mt-1 text-sm text-gray-500">
              Minimum 8 caractères
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              <input
                type="checkbox"
                id="acceptTermsAcheteur"
                checked={acceptTerms}
                onChange={(e) => {
                  setAcceptTerms(e.target.checked)
                  if (e.target.checked) setTermsError("")
                }}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20"
              />
            </div>
            <div>
              <label htmlFor="acceptTermsAcheteur" className="text-sm text-gray-700 cursor-pointer">
                J'accepte les{' '}
                <a href="/terms" target="_blank" className="text-primary hover:underline font-medium">
                  Conditions d'utilisation
                </a>
                {' '}et la{' '}
                <a href="/privacy" target="_blank" className="text-primary hover:underline font-medium">
                  Politique de confidentialité
                </a>
              </label>
              {termsError && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {termsError}
                </p>
              )}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start gap-2">
            <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-700">
              En créant un compte, vous acceptez nos conditions. Vos données sont protégées.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-white px-12 py-4 rounded-xl font-semibold text-lg hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed w-full"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Inscription en cours...
            </div>
          ) : (
            "Créer mon compte"
          )}
        </button>
      </div>

      <div className="text-center">
        <p className="text-gray-600">
          Vous avez déjà un compte?{' '}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-primary font-medium hover:text-primary/80 transition"
          >
            Se connecter
          </button>
        </p>
      </div>
    </form>
  )
}