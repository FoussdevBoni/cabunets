import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Check,
  Phone,
  Mail,
  UserIcon,
  Lock,
  DollarSign,
  Clock,
  Eye,
  EyeOff,
  Sparkles,
  AlertCircle,
  Sun,
  Moon
} from "lucide-react"
import { authService } from "../../../services/authService"
import { Vendeur } from "../../../utils/database"
import { useAuth } from "../../../hooks/auth/useAuth"
import useToken from "../../../hooks/auth/useToken"

interface NetworkOption {
  name: string
  label: string
  color: string
}

const NETWORKS: NetworkOption[] = [
  { name: 'Airtel', label: 'Airtel Money', color: 'bg-red-100 text-red-800 border-red-200' },
  { name: 'Vodacom', label: 'M-Pesa', color: 'bg-green-100 text-green-800 border-green-200' },
  { name: 'Africell', label: 'Afrimoney', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { name: 'Orange', label: 'Orange Money', color: 'bg-orange-100 text-orange-800 border-orange-200' },
]

export default function VendeurRegisterForm() {
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
    whatsappNumber: "",
    advantage: "",
    networks: {
      Airtel: false,
      Vodacom: false,
      Africell: false,
      Orange: false,
    },
    paymentAmount: 0,
    availability: "",
    openingTime: "08:00",
    closingTime: "18:00"
  })

  const handleNetworkToggle = (network: string) => {
    setForm(prev => ({
      ...prev,
      networks: {
        ...prev.networks,
        [network]: !prev.networks[network as keyof typeof prev.networks]
      }
    }))
  }

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
      const vendeurProfile: Vendeur = {
        whatsappNumber: form.whatsappNumber,
        advantage: form.advantage,
        email: form.email,
        username: form.username,
        networks: form.networks,
        photoUrls: [],
        paymentAmount: form.paymentAmount,
        availability: form.availability,
        openingTime: form.openingTime,
        closingTime: form.closingTime,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const registerRes = await authService.register(
        form.email,
        form.password,
        form.username,
        "",
        'vendeur',
        vendeurProfile
      )

      if (registerRes.token) {
        saveToken(registerRes.token)
        const user = await authService.getUserProfile(registerRes.token)
        setUser(user)
        navigate('/vendeur/upload-photos')
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
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-4 border-b border-gray-100">
          Informations personnelles
        </h2>

        <div className="grid grid-cols-1 gap-6">
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
                placeholder="+243 XX XXX XXXX"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Montant à payer
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.paymentAmount}
                onChange={(e) => setForm(prev => ({ ...prev, paymentAmount: parseFloat(e.target.value) || 0 }))}
                className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                placeholder="10.00"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-4 border-b border-gray-100">
          Horaires d'ouverture
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Sun className="inline h-4 w-4 mr-1 text-yellow-500" />
              Heure d'ouverture
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="time"
                value={form.openingTime}
                onChange={(e) => setForm(prev => ({ ...prev, openingTime: e.target.value }))}
                className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Moon className="inline h-4 w-4 mr-1 text-indigo-500" />
              Heure de fermeture
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="time"
                value={form.closingTime}
                onChange={(e) => setForm(prev => ({ ...prev, closingTime: e.target.value }))}
                className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 bg-gray-50 rounded-lg p-3 flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-medium text-gray-700">
            🟢 Vous serez en ligne de {form.openingTime} à {form.closingTime}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-4 border-b border-gray-100">
          Réseaux mobiles acceptés
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {NETWORKS.map((network) => (
            <button
              type="button"
              key={network.name}
              onClick={() => handleNetworkToggle(network.name)}
              className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                form.networks[network.name as keyof typeof form.networks]
                  ? `${network.color} border-current`
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  form.networks[network.name as keyof typeof form.networks]
                    ? 'bg-white'
                    : 'bg-gray-100'
                }`}>
                  <Phone className="h-5 w-5" />
                </div>
                <span className="font-medium">{network.label}</span>
              </div>
              {form.networks[network.name as keyof typeof form.networks] && (
                <Check className="h-5 w-5" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Votre avantage
          </h2>
          <div className="relative">
            <Sparkles className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <textarea
              value={form.advantage}
              onChange={(e) => setForm(prev => ({ ...prev, advantage: e.target.value }))}
              rows={4}
              className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition resize-none"
              placeholder="Décrivez ce qui rend votre service unique..."
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Disponibilité
          </h2>
          <div className="relative">
            <Clock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <textarea
              value={form.availability}
              onChange={(e) => setForm(prev => ({ ...prev, availability: e.target.value }))}
              rows={4}
              className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition resize-none"
              placeholder="Décrivez votre disponibilité..."
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              <input
                type="checkbox"
                id="acceptTermsVendeur"
                checked={acceptTerms}
                onChange={(e) => {
                  setAcceptTerms(e.target.checked)
                  if (e.target.checked) setTermsError("")
                }}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20"
              />
            </div>
            <div>
              <label htmlFor="acceptTermsVendeur" className="text-sm text-gray-700 cursor-pointer">
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
            <Check className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-700">
              En créant un compte vendeur, vous acceptez nos conditions. Vos données sont protégées.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-6">
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
            "Continuer vers l'upload des photos"
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