import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../hooks/auth/useAuth"
import { 
  User, 
  Mail, 
  Phone, 
  Save,
  X,
  Shield,
  Edit,
  Camera,
  Upload,
  Smartphone,
  MapPin
} from "lucide-react"
import { Client, CurrentUser } from "../../utils/database"
import { authService } from "../../services/authService"
import useToken from "../../hooks/auth/useToken"
import { uploadService } from "../../services/uploadFileService"

export default function ClientProfilePage() {
  const navigate = useNavigate()
  const { user  , refreshUser} = useAuth()
  const { token } = useToken()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    username: "",
    email: "",
    whatsappNumber: "",
    rechargePhone: "",
    address: ""
  })

  const [currentAvatar, setCurrentAvatar] = useState<string>("")
  const profile = user?.profile as Client

  useEffect(() => {
    if (user) {
      setForm({
        username: user.username || "",
        email: user.email || "",
        whatsappNumber: profile?.whatsappNumber || "",
        rechargePhone: profile?.rechargePhone || "",
        address: profile?.address || ""
      })
      setCurrentAvatar(user.avatar || "")
    }
  }, [user])

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setAvatarFile(file)
    const preview = URL.createObjectURL(file)
    setAvatarPreview(preview)
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    
    setIsLoading(true)
    try {
      let finalAvatar = currentAvatar
      
      if (avatarFile) {
        const uploadedUrl = await uploadService.upload(avatarFile, token)
        finalAvatar = uploadedUrl
      }

      const updatedData: CurrentUser = {
        profile: {
          whatsappNumber: form.whatsappNumber,
          rechargePhone: form.rechargePhone,
          address: form.address
        },
        email: user.email, // L'email reste inchangé
        username: form.username,
        avatar: finalAvatar,
        role: "client"
      }
      
      const { avatar, username, profile } = updatedData
      
      await authService.updateUser(token, user?.id!, { avatar, username }, profile)
       refreshUser()
      setAvatarFile(null)
      setAvatarPreview("")
      setIsEditing(false)
      
      alert("Profil mis à jour avec succès!")
    } catch (error) {
      console.error("Erreur:", error)
      alert("Erreur lors de la mise à jour")
    } finally {
      setIsLoading(false)
    }
  }

  const cancelEdit = () => {
    setIsEditing(false)
    setAvatarFile(null)
    setAvatarPreview("")
    if (user) {
      setCurrentAvatar(user.avatar || "")
      setForm({
        username: user.username || "",
        email: user.email || "",
        whatsappNumber: profile?.whatsappNumber || "",
        rechargePhone: profile?.rechargePhone || "",
        address: profile?.address || ""
      })
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const displayAvatar = avatarPreview || currentAvatar

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-20 bg-white border-b z-10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="h-5 w-5" />
              </button>
              <h1 className="text-base font-medium">Mon profil</h1>
            </div>
            
            {isEditing ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={cancelEdit}
                  className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
                  disabled={isLoading}
                >
                  Annuler
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {isLoading ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Modifier
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* Photo de profil */}
        <div className="bg-white rounded-xl border p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <div 
                className={`h-32 w-32 rounded-full bg-gray-200 overflow-hidden ${isEditing ? 'cursor-pointer hover:opacity-80 transition' : ''}`}
                onClick={isEditing ? handleAvatarClick : undefined}
              >
                {displayAvatar ? (
                  <img
                    src={displayAvatar}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <User className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>
              {isEditing && (
                <>
                  <button
                    onClick={handleAvatarClick}
                    className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full hover:bg-primary/90 transition shadow-lg"
                    title="Changer l'avatar"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </>
              )}
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{user.username}</h2>
              <div className="flex items-center justify-center md:justify-start gap-2 text-gray-600 mb-1">
                <Mail className="h-4 w-4" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2 text-gray-600">
                <Shield className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-green-600">Client</span>
              </div>
            </div>
          </div>
        </div>

        {/* Informations de contact */}
        <div className="bg-white rounded-xl border p-6 mb-6">
          <h3 className="font-bold text-gray-900 mb-6">Mes coordonnées</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">WhatsApp</div>
                  <div className="font-medium text-gray-900">
                    {profile?.whatsappNumber || "Non renseigné"}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-b">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Numéro de recharge</div>
                  <div className="font-medium text-gray-900">
                    {profile?.rechargePhone || "Non renseigné"}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Adresse</div>
                  <div className="font-medium text-gray-900">
                    {profile?.address || "Non renseigné"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Formulaire d'édition */}
        {isEditing && (
          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-bold text-gray-900 mb-6">Modifier mes informations</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nom d'utilisateur */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom d'utilisateur
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => setForm(prev => ({ ...prev, username: e.target.value }))}
                    className="pl-10 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary transition"
                    required
                  />
                </div>
              </div>

              {/* Email - Non modifiable */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    value={form.email}
                    disabled
                    className="pl-10 w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  L'email ne peut pas être modifié
                </p>
              </div>

              {/* WhatsApp */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro WhatsApp
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    value={form.whatsappNumber}
                    onChange={(e) => setForm(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                    className="pl-10 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary transition"
                    placeholder="+243 XX XXX XXXX"
                  />
                </div>
              </div>

              {/* Numéro de recharge */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro de recharge
                </label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    value={form.rechargePhone}
                    onChange={(e) => setForm(prev => ({ ...prev, rechargePhone: e.target.value }))}
                    className="pl-10 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary transition"
                    placeholder="+243 XX XXX XXXX"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Ce numéro sera utilisé par défaut pour vos recharges
                </p>
              </div>

              {/* Adresse */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <textarea
                    value={form.address}
                    onChange={(e) => setForm(prev => ({ ...prev, address: e.target.value }))}
                    className="pl-10 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary transition resize-none"
                    rows={3}
                    placeholder="Votre adresse complète"
                  />
                </div>
              </div>

              {/* Avatar info */}
              {avatarFile && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-700 flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Nouvel avatar sélectionné, cliquez sur "Enregistrer" pour valider
                  </p>
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  )
}