import { useState } from "react"
import { useSearchParams } from "react-router-dom"
import {
    Smartphone,
    Mail,
    Hash,
    ChevronLeft,
    CreditCard,
    CheckCircle
} from "lucide-react"
import { useOffre } from "../../hooks/offres/useOffre"
import { useVendeur } from "../../hooks/vendeurs/useVendeur"
import { Order } from "../../utils/database"
import { ordersService } from "../../hooks/orders/useOrders"

export default function CheckoutPage() {
    const [searchParams] = useSearchParams()
    const offerId = searchParams.get("offer")

    const [form, setForm] = useState({
        email: "",
        phoneNumber: "",
        units: 1
    })

    const [currency, setCurrency] = useState<"FC" | "USD">("FC")
    const [submitting, setSubmitting] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)

    const { offre, offreLoading } = useOffre({ offreId: offerId! })
    const { vendeur, vendeurLoading } = useVendeur({ vendeurId: offre?.vendeurId! })

    if (offreLoading || vendeurLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    if (!offre || !vendeur) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center">
                    <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {!offre ? "Offre non trouvée" : "Vendeur non trouvé"}
                    </h3>
                    <p className="text-gray-600">
                        {!offre
                            ? "Cette offre n'existe pas ou a été supprimée."
                            : "Le vendeur de cette offre n'existe plus."
                        }
                    </p>
                </div>
            </div>
        )
    }

    const calculatePrice = () => {
        const unitPrice = currency === "FC" ? offre.priceFC : offre.priceUSD
        return unitPrice * form.units
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!form.email || !form.phoneNumber) {
            alert("Veuillez remplir tous les champs")
            return
        }

        if (form.units > offre.units) {
            alert(`Maximum ${offre.units} unités disponibles`)
            return
        }

        setShowConfirm(true)
    }

    const confirmOrder = async () => {
        setSubmitting(true)

        try {
            const newOrder: Order = {
                email: form.email,
                phoneNumber: form.phoneNumber,
                units: form.units,
                price: calculatePrice(),
                currency: currency,
                network: offre.network,
                offerId: offerId!,
                vendeurId: offre.vendeurId,
                vendeurName: offre.vendeurName,
                status: "pending"
            }

            await ordersService.create(newOrder)

            const message = `💰 NOUVELLE COMMANDE 💰
      
📧 Email: ${form.email}
📞 Téléphone: ${form.phoneNumber}
📊 Réseau: ${offre.network}
🔢 Unités: ${form.units}
💵 Prix: ${calculatePrice()} ${currency}
👤 Marchand: ${offre.vendeurName}`

            const encodedMessage = encodeURIComponent(message)
            const whatsappURL = `https://wa.me/${vendeur.whatsappNumber}?text=${encodedMessage}`

            window.open(whatsappURL, "_blank")
            setForm({ email: "", phoneNumber: "", units: 1 })
            setShowConfirm(false)
            alert("Commande envoyée avec succès!")

        } catch (error: any) {
            console.error("Erreur:", error)
            alert(error.message || "Une erreur est survenue")
        } finally {
            setSubmitting(false)
        }
    }

    const totalPrice = calculatePrice()

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b z-10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3 py-4">
                        <button
                            onClick={() => window.history.back()}
                            className="p-2 hover:bg-gray-100 rounded-lg transition"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <div>
                            <h1 className="text-lg sm:text-xl font-medium">Commander</h1>
                            <p className="text-sm text-gray-500">{offre.vendeurName}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="max-w-4xl mx-auto">
                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Colonne gauche - Infos de l'offre et formulaire */}
                        <div className="lg:col-span-2">
                            {/* Infos de l'offre */}
                            <div className="bg-white rounded-xl border p-6 mb-6">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <Smartphone className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold">{offre.network}</h3>
                                        <p className="text-gray-600">{offre.vendeurName}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                    <div className="border rounded-lg p-4">
                                        <div className="text-sm text-gray-600 mb-1">Unités disponibles</div>
                                        <div className="text-xl font-bold">{offre.units}</div>
                                    </div>
                                    <div className="border rounded-lg p-4">
                                        <div className="text-sm text-gray-600 mb-1">Prix unitaire</div>
                                        <div className="text-xl font-bold text-primary">
                                            ${offre.priceUSD} / {offre.priceFC} FC
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Formulaire */}
                            <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-6">Informations de contact</h3>

                                <div className="space-y-6">
                                    {/* Email */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Adresse email *
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <input
                                                type="email"
                                                required
                                                value={form.email}
                                                onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                                                className="pl-12 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition"
                                                placeholder="votre@email.com"
                                            />
                                        </div>
                                    </div>

                                    {/* Numéro de téléphone */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Numéro de téléphone *
                                        </label>
                                        <div className="relative">
                                            <Smartphone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <input
                                                type="tel"
                                                required
                                                value={form.phoneNumber}
                                                onChange={(e) => setForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                                                className="pl-12 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition"
                                                placeholder="+243 XX XXX XXXX"
                                            />
                                        </div>
                                    </div>

                                    {/* Unités et devise */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Nombre d'unités *
                                            </label>
                                            <div className="relative">
                                                <Hash className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max={offre.units}
                                                    required
                                                    value={form.units}
                                                    onChange={(e) => setForm(prev => ({
                                                        ...prev,
                                                        units: Math.min(offre.units, parseInt(e.target.value) || 1)
                                                    }))}
                                                    className="pl-12 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition"
                                                />
                                            </div>
                                            <p className="text-sm text-gray-500 mt-2">
                                                Maximum: {offre.units} unités
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Devise de paiement
                                            </label>
                                            <div className="flex gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setCurrency("FC")}
                                                    className={`flex-1 py-3 rounded-lg border transition ${currency === "FC"
                                                        ? "border-primary bg-primary/10 text-primary"
                                                        : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                                                        }`}
                                                >
                                                    FC
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setCurrency("USD")}
                                                    className={`flex-1 py-3 rounded-lg border transition ${currency === "USD"
                                                        ? "border-primary bg-primary/10 text-primary"
                                                        : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                                                        }`}
                                                >
                                                    USD
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Prix unitaire */}
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Prix unitaire:</span>
                                            <span className="font-medium">
                                                {currency === "FC" ? offre.priceFC : offre.priceUSD} {currency}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Colonne droite - Résumé et paiement */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl border p-6 sticky top-24">
                                <h3 className="text-lg font-medium text-gray-900 mb-6">Récapitulatif</h3>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Unités:</span>
                                        <span className="font-medium">{form.units}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Prix unitaire:</span>
                                        <span className="font-medium">
                                            {currency === "FC" ? offre.priceFC : offre.priceUSD} {currency}
                                        </span>
                                    </div>
                                    <div className="border-t pt-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-medium text-gray-900">Total:</span>
                                            <span className="text-2xl font-bold text-primary">
                                                {totalPrice} {currency}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition disabled:opacity-50 text-lg"
                                >
                                    {submitting ? "Envoi en cours..." : "Continuer vers WhatsApp"}
                                </button>

                                <div className="mt-6 pt-6 border-t">
                                    <div className="flex items-start gap-3">
                                        <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                            <Smartphone className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">
                                                Vous serez redirigé vers WhatsApp pour finaliser la transaction avec {vendeur.username}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de confirmation */}
            {showConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <div className="text-center mb-6">
                            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Confirmer la commande</h3>
                            <p className="text-gray-600">
                                Votre commande sera envoyée à {vendeur.username} via WhatsApp
                            </p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Email:</span>
                                    <span className="font-medium">{form.email}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Téléphone:</span>
                                    <span className="font-medium">{form.phoneNumber}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Réseau:</span>
                                    <span className="font-medium">{offre.network}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Unités:</span>
                                    <span className="font-medium">{form.units}</span>
                                </div>
                                <div className="flex justify-between pt-3 border-t">
                                    <span className="text-gray-900 font-medium">Total:</span>
                                    <span className="font-bold text-primary">
                                        {totalPrice} {currency}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="flex-1 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
                                disabled={submitting}
                            >
                                Annuler
                            </button>
                            <button
                                onClick={confirmOrder}
                                disabled={submitting}
                                className="flex-1 bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition disabled:opacity-50"
                            >
                                {submitting ? "Envoi..." : "Confirmer"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}