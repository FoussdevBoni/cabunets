import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../hooks/auth/useAuth"
import { useVendeur } from "../../hooks/vendeurs/useVendeur"
import { fileService } from "../../services/uploadFileService"
import { 
  User, 
  Mail, 
  Phone, 
  DollarSign, 
  Clock, 
  Globe,
  Camera,
  Save,
  X,
  Shield,
  Edit,
  CheckCircle,
  Plus,
  Trash2,
  Upload
} from "lucide-react"
import { CurrentUser, Vendeur } from "../../utils/database"
import { authService } from "../../services/authService"
import useToken from "../../hooks/auth/useToken"

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { vendeur } = useVendeur({ vendeurId: user?.id! })
  const {token} = useToken()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [newPhotoFiles, setNewPhotoFiles] = useState<File[]>([])
  const [newPhotoPreviews, setNewPhotoPreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    username: "",
    email: "",
    whatsappNumber: "",
    advantage: "",
    paymentAmount: 0,
    availability: ""
  })

  const [currentPhotos, setCurrentPhotos] = useState<string[]>([])

  useEffect(() => {
    if (vendeur) {
      setForm({
        username: vendeur.username || "",
        email: vendeur.email || "",
        whatsappNumber: vendeur.whatsappNumber || "",
        advantage: vendeur.advantage || "",
        paymentAmount: vendeur.paymentAmount || 0,
        availability: vendeur.availability || ""
      })
      if (vendeur.photoUrls) {
        setCurrentPhotos(vendeur.photoUrls)
      }
    }
  }, [vendeur])

  const handlePhotoUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Ajouter les fichiers
    setNewPhotoFiles(prev => [...prev, ...files])
    
    // Créer des previews locales
    const newPreviews = files.map(file => URL.createObjectURL(file))
    setNewPhotoPreviews(prev => [...prev, ...newPreviews])
    
    // Clear l'input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeNewPhoto = (index: number) => {
    setNewPhotoFiles(prev => prev.filter((_, i) => i !== index))
    setNewPhotoPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const removeCurrentPhoto = (index: number) => {
    setCurrentPhotos(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!vendeur) return
    
    setIsLoading(true)
    try {
      let finalPhotoUrls = [...currentPhotos]
      
      // Upload des nouvelles photos si elles existent
      if (newPhotoFiles.length > 0) {
        const uploadedData = await fileService.uploadMultipleFiles(newPhotoFiles)
        const uploadedUrls = uploadedData.map(item=>(item.url))
        finalPhotoUrls = [...finalPhotoUrls, ...uploadedUrls]
      }

      // Mettre à jour le vendeur avec toutes les données
      const updatedData: CurrentUser = {
          profile: {
           ...form,
           photoUrls: finalPhotoUrls
          } as Vendeur,
          email: user?.email!,
          username: form.username,
          avatar: finalPhotoUrls[0] || user?.avatar!,
          role: "vendeur"
      }
      const {avatar , username , profile} = updatedData
      
     await authService.updateUser(token , user?.id! , { avatar , username} , profile)
      
      // Réinitialiser les états
      setNewPhotoFiles([])
      setNewPhotoPreviews([])
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
    setNewPhotoFiles([])
    setNewPhotoPreviews([])
    // Réinitialiser les photos actuelles
    if (vendeur?.photoUrls) {
      setCurrentPhotos(vendeur.photoUrls)
    }
  }

  if (!vendeur) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const activeNetworks = Object.values(vendeur.networks || {}).filter(Boolean).length
  const allPhotoPreviews = [...currentPhotos, ...newPhotoPreviews]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b">
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
        {/* Photo de profil principale */}
        <div className="bg-white rounded-xl border p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <div className="h-32 w-32 rounded-full bg-gray-200 overflow-hidden">
                {currentPhotos[0] ? (
                  <img
                    src={currentPhotos[0]}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <User className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{vendeur.username}</h2>
              <div className="flex items-center justify-center md:justify-start gap-2 text-gray-600 mb-1">
                <Mail className="h-4 w-4" />
                <span>{vendeur.email}</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2 text-gray-600">
                <Shield className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-green-600">Vendeur vérifié</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats et réseaux */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Stats */}
          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-bold text-gray-900 mb-4">Statistiques</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-gray-600">Réseaux actifs</div>
                <div className="font-bold">{activeNetworks}/4</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-gray-600">Prix par transaction</div>
                <div className="font-bold text-primary">${vendeur.paymentAmount}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-gray-600">Disponibilité</div>
                <div className={`font-bold ${vendeur.availability === 'En ligne' ? 'text-green-600' : 'text-gray-700'}`}>
                  {vendeur.availability || 'Disponible'}
                </div>
              </div>
            </div>
          </div>

          {/* Réseaux */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="h-5 w-5 text-gray-500" />
              <h3 className="font-bold text-gray-900">Mes réseaux</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(vendeur.networks || {}).map(([name, active]) => (
                <div
                  key={name}
                  className={`flex items-center justify-between p-3 rounded-lg ${active ? 'bg-green-50' : 'bg-gray-100'}`}
                >
                  <span className={`font-medium ${active ? 'text-green-700' : 'text-gray-500'}`}>
                    {name}
                  </span>
                  {active ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Formulaire d'édition */}
        {isEditing && (
          <div className="bg-white rounded-xl border p-6 mb-6">
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
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                    className="pl-10 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary transition"
                  />
                </div>
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

              {/* Prix */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix par transaction ($)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.paymentAmount}
                    onChange={(e) => setForm(prev => ({ ...prev, paymentAmount: parseFloat(e.target.value) || 0 }))}
                    className="pl-10 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary transition"
                  />
                </div>
              </div>

              {/* Disponibilité */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Disponibilité
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <select
                    value={form.availability}
                    onChange={(e) => setForm(prev => ({ ...prev, availability: e.target.value }))}
                    className="pl-10 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary transition"
                  >
                    <option value="">Sélectionnez...</option>
                    <option value="En ligne">En ligne</option>
                    <option value="9h-18h">9h-18h</option>
                    <option value="Weekend">Weekend</option>
                    <option value="Sur rendez-vous">Sur rendez-vous</option>
                  </select>
                </div>
              </div>

              {/* Avantage */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description / Avantage
                </label>
                <textarea
                  value={form.advantage}
                  onChange={(e) => setForm(prev => ({ ...prev, advantage: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary transition"
                  placeholder="Décrivez ce qui rend votre service unique..."
                />
              </div>
            </form>
          </div>
        )}

        {/* Gestion des photos */}
        <div className="bg-white rounded-xl border p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900">
              Mes photos ({allPhotoPreviews.length})
              {newPhotoPreviews.length > 0 && (
                <span className="ml-2 text-sm font-normal text-primary">
                  +{newPhotoPreviews.length} nouvelle(s)
                </span>
              )}
            </h3>
            
            {isEditing && (
              <button
                onClick={handlePhotoUploadClick}
                className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition"
              >
                <Upload className="h-4 w-4" />
                Ajouter des photos
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoChange}
              className="hidden"
            />
          </div>

          {allPhotoPreviews.length === 0 ? (
            <div className="text-center py-8">
              <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Aucune photo pour le moment</p>
              <p className="text-sm text-gray-500 mt-1">Ajoutez des photos pour améliorer votre profil</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Photos existantes */}
              {currentPhotos.map((url, index) => (
                <div key={`current-${index}`} className="relative group">
                  <div className="h-40 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={url}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {isEditing && (
                    <button
                      onClick={() => removeCurrentPhoto(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                  {index === 0 && (
                    <div className="absolute bottom-2 left-2 bg-primary text-white px-2 py-1 rounded text-xs">
                      Principale
                    </div>
                  )}
                </div>
              ))}
              
              {/* Nouvelles photos (previews) */}
              {newPhotoPreviews.map((url, index) => (
                <div key={`new-${index}`} className="relative group">
                  <div className="h-40 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={url}
                      alt={`Nouvelle photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {isEditing && (
                    <button
                      onClick={() => removeNewPhoto(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      title="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                  <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs">
                    Nouvelle
                  </div>
                </div>
              ))}
              
              {/* Bouton pour ajouter plus de photos (seulement en mode édition) */}
              {isEditing && (
                <button
                  onClick={handlePhotoUploadClick}
                  className="h-40 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-primary transition-colors"
                >
                  <Plus className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">Ajouter</span>
                </button>
              )}
            </div>
          )}

          <div className="mt-4 text-sm text-gray-500">
            <p>✓ La première photo est utilisée comme photo principale</p>
            <p>✓ Les modifications seront sauvegardées lorsque vous cliquerez sur "Enregistrer"</p>
            {newPhotoPreviews.length > 0 && (
              <p className="text-primary font-medium">
                ⚠️ {newPhotoPreviews.length} nouvelle(s) photo(s) en attente d'upload
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}