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
  LogOut,
  ArrowRight
} from "lucide-react"
import { authService } from "../../services/authService"
import { User, Vendeur } from "../../utils/database"
import { useAuth } from "../../hooks/auth/useAuth"
import useToken from "../../hooks/auth/useToken"

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

export default function VendeurRegister() {
  const navigate = useNavigate()
  const { user, logout, setUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string>("")
  const { saveToken } = useToken()
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
    availability: ""
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

    if (!form.whatsappNumber || !form.email || !form.password || !form.username) {
      setError("Veuillez remplir tous les champs obligatoires")
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

  // Si l'utilisateur est déjà connecté
  if (user) {
    const profile = user.profile as Vendeur
    const hasPhotos = profile?.photoUrls && profile.photoUrls.length > 0
    const avatar = user.avatar || profile?.photoUrls?.[0]

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-4 overflow-hidden">
            {avatar ? (
              <img src={avatar} alt={user.username} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/10">
                <UserIcon className="h-12 w-12 text-primary" />
              </div>
            )}
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {user.username}
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            {user.email}
          </p>

          <div className="space-y-3">
            <button
              onClick={() => navigate(hasPhotos ? 'vendeur/overview' : '/vendeur/upload-photos')}
              className="w-full bg-primary text-white px-4 py-3 rounded-xl font-medium hover:bg-primary/90 transition flex items-center justify-center gap-2"
            >
              <ArrowRight className="h-5 w-5" />
              {hasPhotos ? "Accéder au tableau de bord" : "Continuer vers l'upload des photos"}
            </button>

            <button
              onClick={async () => {
                await logout()
                navigate('/login')
              }}
              className="w-full border border-gray-300 text-gray-700 px-4 py-3 rounded-xl font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2"
            >
              <LogOut className="h-5 w-5" />
              Se déconnecter
            </button>
          </div>
        </div>
      </div>
    )
  }



  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">
            Devenir <span className="text-primary">Vendeur</span>
          </h1>
          <p className="mt-2 text-gray-600">
            Étape 1 : Créez votre compte
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="h-2 w-16 bg-primary rounded-full"></div>
            <div className="h-2 w-16 bg-gray-200 rounded-full"></div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-4 border-b border-gray-100">
              Informations personnelles
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
              {/* Nom d'utilisateur */}
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

              {/* Email */}
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

              {/* Mot de passe */}
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

              {/* WhatsApp */}
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

              {/* Prix */}
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

          {/* Section Réseaux */}
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
                  className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${form.networks[network.name as keyof typeof form.networks]
                    ? `${network.color} border-current`
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${form.networks[network.name as
                      keyof typeof form.networks]
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

          {/* Section Avantage & Disponibilité */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Avantage */}
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
              <p className="mt-2 text-sm text-gray-500">
                Mettez en valeur vos points forts
              </p>
            </div>

            {/* Disponibilité */}
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
                  placeholder="Décrivez votre disponibilité (ex: Lundi au vendredi 9h-18h)"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Indiquez vos créneaux de disponibilité
              </p>
            </div>
          </div>

          {/* Bouton de soumission */}
          <div className="flex justify-center pt-6">
            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-white px-12 py-4 rounded-xl font-semibold text-lg hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Inscription en cours...
                </div>
              ) : (
                "Continuer vers l'upload des photos"
              )}
            </button>
          </div>

          {/* Lien de connexion */}
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
      </div>
    </div>
  )
}