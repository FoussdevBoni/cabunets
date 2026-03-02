import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Upload,
  Check,
  Phone,
  Mail,
  User,
  Lock,
  DollarSign,
  Clock,
  Eye,
  EyeOff,
  X,
  Pencil,
  Sparkles
} from "lucide-react"
import { authService } from "../../services/authService"
import { Vendeur } from "../../utils/database"
import { fileService, UploadedData } from "../../services/uploadFileService"

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
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [error, setError] = useState<string>("")

  const [form, setForm] = useState({
    email: '',
    username: '',
    password: '',
    fullName: "",
    whatsappNumber: "",
    advantage: "",
    networks: {
      Airtel: false,
      Vodacom: false,
      Africell: false,
      Orange: false,
    },
    photosFile: [] as File[],
    paymentAmount: 0,
    availability: ""
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const fileArray = Array.from(files)
      setForm(prev => ({
        ...prev,
        photosFile: [...prev.photosFile, ...fileArray]
      }))

      // Créer des previews
      const newPreviewUrls = fileArray.map(file => URL.createObjectURL(file))
      setPreviewUrls(prev => [...prev, ...newPreviewUrls])
    }
  }

  const removeImage = (index: number) => {
    setForm(prev => ({
      ...prev,
      photosFile: prev.photosFile.filter((_, i) => i !== index)
    }))
    setPreviewUrls(prev => prev.filter((_, i) => i !== index))
  }

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

    // Validation
    if (form.photosFile.length === 0) {
      setError("Ajouter au moins une photo")
      return
    }

    if (!form.whatsappNumber || !form.email || !form.password || !form.username) {
      setError("Veuillez remplir tous les champs obligatoires")
      return
    }

    setLoading(true)

    try {
      const uploadedData: UploadedData[] = await fileService.uploadMultipleFiles(form.photosFile)
      const photoUrls = uploadedData.map((item) => (item.url))
      const vendeurProfile: Vendeur = {
        whatsappNumber: form.whatsappNumber,
        advantage: form.advantage,
        email: form.email,
        username: form.username,
        networks: form.networks,
        photoUrls: photoUrls,
        paymentAmount: form.paymentAmount,
        availability: form.availability,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      console.log(vendeurProfile)
      await authService.register(
        form.email,
        form.password,
        form.username,
        photoUrls[0],
        'vendeur',
        vendeurProfile
      )
      navigate('/login')

    } catch (error: any) {
      console.error("Erreur lors de l'inscription:", error)
      setError(error.message || "Une erreur est survenue lors de l'inscription")
    } finally {
      setLoading(false)
    }
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
            Rejoignez notre plateforme et commencez à vendre dès aujourd'hui
          </p>
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
                  Nom complet *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
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

          {/* Section Photos */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 pb-4 border-b border-gray-100">
              Photos de profil *
            </h2>

            <div className="space-y-6">
              {/* Upload area */}
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-primary/50 transition">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">
                  Glissez-déposez vos photos ou cliquez pour sélectionner
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  PNG, JPG jusqu'à 5MB
                </p>
                <input
                  type="file"
                  id="photos"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="photos"
                  className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition cursor-pointer"
                >
                  Choisir des photos
                </label>
              </div>

              {/* Previews */}
              {previewUrls.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    {previewUrls.length} photo{previewUrls.length > 1 ? 's' : ''} sélectionnée{previewUrls.length > 1 ? 's' : ''}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition opacity-0 group-hover:opacity-100"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                    <div className={`p-2 rounded-lg ${form.networks[network.name as keyof typeof form.networks]
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
                  placeholder="Décrivez votre disponibilité (ex: Lundi au vendredi 9h-18h, disponible le weekend sur rendez-vous)"
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
                "Créer mon compte vendeur"
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