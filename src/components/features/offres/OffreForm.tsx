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
    priceFC: initialData?.priceFC ? initialData.priceFC.toString() : "",
    priceUSD: initialData?.priceUSD ? initialData.priceUSD.toString() : "",
    units: initialData?.units ? initialData.units.toString() : "",
  })

  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Nettoyage des virgules pour la conversion float en JavaScript
    const cleanFC = form.priceFC.replace(/,/g, '.')
    const cleanUSD = form.priceUSD.replace(/,/g, '.')

    const unitsNum = parseInt(form.units, 10) || 0
    const priceFCNum = parseFloat(cleanFC) || 0
    const priceUSDNum = parseFloat(cleanUSD) || 0

    if (unitsNum <= 0) {
      setError("Le nombre d'unités doit être supérieur à 0")
      return
    }

    if (priceFCNum <= 0) {
      setError("Le prix en FC doit être supérieur à 0")
      return
    }

    if (priceUSDNum <= 0) {
      setError("Le prix en USD doit être supérieur à 0")
      return
    }

    try {
      await onSubmit({
        network: form.network,
        units: unitsNum,
        priceFC: priceFCNum,
        priceUSD: priceUSDNum,
        createdAt: isUpdate ? initialData?.createdAt : new Date(),
        updatedAt: new Date()
      })
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue")
    }
  }

  const handleNumericChange = (
    value: string,
    field: 'units' | 'priceFC' | 'priceUSD'
  ) => {
    // Les deux prix acceptent désormais le point et la virgule avec max 2 décimales
    if (field === 'priceFC' || field === 'priceUSD') {
      if (/^\d*[.,]?\d{0,2}$/.test(value) || value === "") {
        setForm(prev => ({ ...prev, [field]: value }))
      }
    } else {
      // Seul le nombre d'unités reste un entier strict
      const sanitized = value.replace(/[^\d]/g, '')
      setForm(prev => ({ ...prev, [field]: sanitized }))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          type="button"
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <X className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold">
          {isUpdate ? "Modifier l'offre" : "Nouvelle offre"}
        </h1>
        <div className="w-10"></div>
      </div>

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
                className={`p-4 rounded-xl border-2 transition ${form.network === network
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-gray-300"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Smartphone className={`h-5 w-5 ${form.network === network ? "text-primary" : "text-gray-400"}`} />
                  <span className={`font-medium ${form.network === network ? "text-primary" : "text-gray-700"}`}>
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
              value={form.units}
              onChange={(e) => handleNumericChange(e.target.value, 'units')}
              className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary transition"
              placeholder="100"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Seuls les chiffres entiers sont autorisés
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
              inputMode="decimal"
              value={form.priceFC}
              onChange={(e) => handleNumericChange(e.target.value, 'priceFC')}
              className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary transition"
              placeholder="5000,50"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Vous pouvez utiliser le point (.) ou la virgule (,) pour les décimales
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
              value={form.priceUSD}
              onChange={(e) => handleNumericChange(e.target.value, 'priceUSD')}
              className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary transition"
              placeholder="1.00"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Vous pouvez utiliser le point (.) ou la virgule (,) pour les décimales
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