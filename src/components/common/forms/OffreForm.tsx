import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { X, DollarSign, Hash, Smartphone } from "lucide-react"
import { Offre } from "../../../utils/database"

interface OffreFormProps {
  initialData?: Offre
  onSubmit: (data: Partial<Offre>) => Promise<void>
  isLoading: boolean
  isUpdate?: boolean
}

const NETWORKS = ["Airtel", "Vodacom", "Africell", "Orange"] as const

export default function OffreForm({ 
  initialData, 
  onSubmit, 
  isLoading, 
  isUpdate = false 
}: OffreFormProps) {
  const navigate = useNavigate()
  
  const [form, setForm] = useState({
    network: initialData?.network || "Airtel",
    priceFC: initialData?.priceFC || 0,
    priceUSD: initialData?.priceUSD || 0,
    units: initialData?.units || 0,
  })

  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (form.units <= 0) {
      setError("Le nombre d'unités doit être supérieur à 0")
      return
    }

    if (form.priceFC <= 0) {
      setError("Le prix en FC doit être supérieur à 0")
      return
    }

    if (form.priceUSD <= 0) {
      setError("Le prix en USD doit être supérieur à 0")
      return
    }

    try {
      await onSubmit({
        ...form,
        createdAt: isUpdate ? initialData?.createdAt : new Date(),
        updatedAt: new Date()
      })
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue")
    }
  }

  // Fonction pour valider et traiter les entrées numériques
  const handleNumericInput = (
    value: string, 
    field: 'units' | 'priceFC' | 'priceUSD',
    minValue: number = 0
  ) => {
    // Autorise uniquement les chiffres et un point décimal (pour USD)
    let sanitizedValue = value
    
    if (field === 'priceUSD') {
      // Pour USD: autorise les chiffres et un seul point décimal
      sanitizedValue = value.replace(/[^\d.]/g, '')
      
      // Empêche plus d'un point décimal
      const parts = sanitizedValue.split('.')
      if (parts.length > 2) {
        sanitizedValue = parts[0] + '.' + parts.slice(1).join('')
      }
      
      // Limite à 2 décimales après le point
      if (parts.length === 2 && parts[1].length > 2) {
        sanitizedValue = parts[0] + '.' + parts[1].substring(0, 2)
      }
    } else {
      // Pour units et priceFC: uniquement les chiffres
      sanitizedValue = value.replace(/[^\d]/g, '')
    }
    
    if (sanitizedValue === '' || sanitizedValue === '.') {
      setForm(prev => ({ ...prev, [field]: minValue }))
      return
    }
    
    // Conversion en nombre
    let num: number
    if (field === 'priceUSD' && sanitizedValue.includes('.')) {
      num = parseFloat(sanitizedValue)
    } else {
      num = parseInt(sanitizedValue, 10)
    }
    
    if (!isNaN(num)) {
      setForm(prev => ({ ...prev, [field]: num }))
    }
  }

  // Fonction pour formater l'affichage des nombres
  const formatNumber = (value: number, isDecimal: boolean = false): string => {
    if (value === 0) return ''
    
    if (isDecimal) {
      return value.toString()
    }
    
    return value.toString()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header minimaliste */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <X className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold">
          {isUpdate ? "Modifier l'offre" : "Nouvelle offre"}
        </h1>
        <div className="w-10"></div> {/* Spacer */}
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Réseau */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Réseau mobile *
          </label>
          <div className="grid grid-cols-2 gap-3">
            {NETWORKS.map((network) => (
              <button
                type="button"
                key={network}
                onClick={() => setForm(prev => ({ ...prev, network }))}
                className={`p-4 rounded-xl border-2 transition ${
                  form.network === network
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Smartphone className={`h-5 w-5 ${
                    form.network === network ? "text-primary" : "text-gray-400"
                  }`} />
                  <span className={`font-medium ${
                    form.network === network ? "text-primary" : "text-gray-700"
                  }`}>
                    {network}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Unités */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre d'unités *
          </label>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              required
              value={formatNumber(form.units)}
              onChange={(e) => handleNumericInput(e.target.value, 'units', 1)}
              onBlur={(e) => {
                if (!e.target.value.trim() || parseInt(e.target.value) < 1) {
                  setForm(prev => ({ ...prev, units: 1 }))
                }
              }}
              className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary transition"
              placeholder="100"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Seuls les chiffres sont autorisés
          </p>
        </div>

        {/* Prix en FC */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prix (FC) *
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              required
              value={formatNumber(form.priceFC)}
              onChange={(e) => handleNumericInput(e.target.value, 'priceFC', 1)}
              onBlur={(e) => {
                if (!e.target.value.trim() || parseInt(e.target.value) < 1) {
                  setForm(prev => ({ ...prev, priceFC: 1 }))
                }
              }}
              className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary transition"
              placeholder="2000"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Seuls les chiffres sont autorisés
          </p>
        </div>

        {/* Prix en USD */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prix (USD) *
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              inputMode="decimal"
              required
              value={formatNumber(form.priceUSD, true)}
              onChange={(e) => handleNumericInput(e.target.value, 'priceUSD', 0.01)}
              onBlur={(e) => {
                const value = e.target.value
                if (!value.trim() || parseFloat(value) < 0.01) {
                  setForm(prev => ({ ...prev, priceUSD: 0.01 }))
                }
              }}
              className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary transition"
              placeholder="1.00"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Format: 0.00 (chiffres et point décimal)
          </p>
        </div>

        {/* Boutons */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 py-3 px-4 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
            disabled={isLoading}
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary/90 transition disabled:opacity-50"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {isUpdate ? "Modification..." : "Création..."}
              </div>
            ) : (
              isUpdate ? "Modifier l'offre" : "Créer l'offre"
            )}
          </button>
        </div>
      </form>
    </div>
  )
}