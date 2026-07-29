import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import {
    Smartphone,
    ChevronLeft,
    CreditCard,
    CheckCircle,
    Wallet
} from "lucide-react"
import { useOffre } from "../../hooks/offres/useOffre"
import { useVendeur } from "../../hooks/vendeurs/useVendeur"
import { Order } from "../../utils/database"
import { ordersService } from "../../hooks/orders/useOrders"
import { alertError, alertSuccess } from "../../helpers/alertError"

const providersRDC = [
    { name: "Airtel Money", value: "AIRTEL_COD" },
    { name: "M-Pesa (Vodacom)", value: "VODACOM_MPESA_COD" },
    { name: "Orange Money", value: "ORANGE_COD" },
];

export default function CheckoutPage() {
    const [searchParams] = useSearchParams()
    const offerId = searchParams.get("offer")
    const navigate = useNavigate()
    const [form, setForm] = useState({
        rechargePhone: "", // Numéro qui recevra les unités
        paymentPhone: "",  // Numéro qui va payer la facture Mobile Money
        correspondent: providersRDC[0].value, // Moyen de paiement choisi
    })

    const [currency, setCurrency] = useState<"CDF" | "USD">("CDF")
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

    const totalUnits = offre.units

    const calculatePrice = () => {
        const unitPrice = currency === "CDF" ? offre.priceFC : offre.priceUSD
        return (unitPrice || 0) * totalUnits
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!form.rechargePhone) {
            alertError("Veuillez renseigner le numéro de téléphone pour la recharge d'unités")
            return
        }

        if (!form.paymentPhone) {
            alertError("Veuillez renseigner le numéro Mobile Money pour le paiement")
            return
        }

        setShowConfirm(true)
    }

    const confirmOrder = async () => {
        setSubmitting(true)

        try {
            const cleanRechargePhone = form.rechargePhone.replace(/\D/g, "")
            const cleanPaymentPhone = form.paymentPhone.replace(/\D/g, "")

            const newOrder: Partial<Order> = {
                phoneNumber: cleanRechargePhone, // Numéro à recharger
                paymentPhone: cleanPaymentPhone,   // Numéro pour le débit Cabupay
                contactPhone: cleanRechargePhone,
                correspondent: form.correspondent, // Moyens de paiement transmis au backend (AIRTEL_COD, etc.)
                units: totalUnits,
                price: calculatePrice(),
                currency: currency,
                network: offre.network,            // Réseau des unités
                offerId: offerId!,
                vendeurId: offre.vendeurId,
                vendeurName: offre.vendeurName,
                vendeurPhone: vendeur.whatsappNumber,
                status: "PENDING"
            }

           const data: any =  await ordersService.create(newOrder as Order)

            alertSuccess("Commande initiée avec succès !")
            setShowConfirm(false)
            console.log(data)

            navigate(`/order-pending?orderId=${data.order.id || data.order._id }`)

        } catch (error: any) {
            console.error("Erreur:", error.response)
            alertError(error?.response?.data?.error || "Une erreur est survenue lors de la commande")
        } finally {
            setSubmitting(false)
        }
    }

    const totalPrice = calculatePrice()
    const selectedProviderLabel = providersRDC.find(p => p.value === form.correspondent)?.name

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
                            <h1 className="text-lg sm:text-xl font-medium">Commander des unités</h1>
                            <p className="text-sm text-gray-500">Vendeur: {offre.vendeurName}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="max-w-4xl mx-auto">
                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* Colonne gauche */}
                        <div className="lg:col-span-2">
                            {/* Card Infos Unités */}
                            <div className="bg-white rounded-xl border p-6 mb-6">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <Smartphone className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Réseau des unités</p>
                                        <h3 className="text-lg font-bold">{offre.network}</h3>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                    <div className="border rounded-lg p-4">
                                        <div className="text-sm text-gray-600 mb-1">Unités à recharger</div>
                                        <div className="text-xl font-bold">{offre.units}</div>
                                    </div>
                                    <div className="border rounded-lg p-4">
                                        <div className="text-sm text-gray-600 mb-1">Prix unitaire</div>
                                        <div className="text-xl font-bold text-primary">
                                            {offre.priceFC} CDF / ${offre.priceUSD}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Formulaire */}
                            <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-6">Détails de la commande</h3>

                                <div className="space-y-6">
                                    {/* Numéro de recharge des unités */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Numéro de recharge ({offre.network}) *
                                        </label>
                                        <div className="relative">
                                            <Smartphone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <input
                                                type="tel"
                                                required
                                                value={form.rechargePhone}
                                                onChange={(e) => setForm(prev => ({ ...prev, rechargePhone: e.target.value }))}
                                                className="pl-12 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition"
                                                placeholder="Ex: 243815625169"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Numéro qui recevra les unités {offre.network}.</p>
                                    </div>

                                    {/* Choisir le réseau de paiement */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Choisir le réseau de paiement *
                                        </label>
                                        <div className="relative">
                                            <Wallet className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <select
                                                value={form.correspondent}
                                                onChange={(e) => setForm(prev => ({ ...prev, correspondent: e.target.value }))}
                                                className="pl-12 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition bg-white"
                                            >
                                                {providersRDC.map((provider) => (
                                                    <option key={provider.value} value={provider.value}>
                                                        {provider.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Numéro Mobile Money pour payer */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Numéro de téléphone de paiement ({selectedProviderLabel}) *
                                        </label>
                                        <div className="relative">
                                            <Smartphone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <input
                                                type="tel"
                                                required
                                                value={form.paymentPhone}
                                                onChange={(e) => setForm(prev => ({ ...prev, paymentPhone: e.target.value }))}
                                                className="pl-12 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition"
                                                placeholder="Ex: 243815625169"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Le compte qui sera débité pour valider le paiement.</p>
                                    </div>

                                    {/* Devise */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Devise de paiement
                                        </label>
                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setCurrency("CDF")}
                                                className={`flex-1 py-3 rounded-lg border transition ${currency === "CDF"
                                                    ? "border-primary bg-primary/10 text-primary font-bold"
                                                    : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                                                    }`}
                                            >
                                                CDF (Franc Congolais)
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setCurrency("USD")}
                                                className={`flex-1 py-3 rounded-lg border transition ${currency === "USD"
                                                    ? "border-primary bg-primary/10 text-primary font-bold"
                                                    : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                                                    }`}
                                            >
                                                USD ($)
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Colonne droite */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl border p-6 sticky top-24">
                                <h3 className="text-lg font-medium text-gray-900 mb-6">Récapitulatif</h3>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Unités {offre.network}:</span>
                                        <span className="font-bold">{totalUnits}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Paiement via:</span>
                                        <span className="font-bold">{selectedProviderLabel}</span>
                                    </div>
                                    <div className="border-t pt-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-medium text-gray-900">Total à payer:</span>
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
                                    {submitting ? "Envoi en cours..." : "Continuer"}
                                </button>
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
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Confirmer le paiement</h3>
                            <p className="text-gray-600 text-sm">
                                Vous allez acheter {totalUnits} unités {offre.network}
                            </p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">N° à recharger:</span>
                                <span className="font-medium">{form.rechargePhone.replace(/\D/g, "")}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Moyen de paiement:</span>
                                <span className="font-medium">{selectedProviderLabel}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">N° de paiement:</span>
                                <span className="font-medium">{form.paymentPhone.replace(/\D/g, "")}</span>
                            </div>
                            <div className="flex justify-between pt-3 border-t">
                                <span className="text-gray-900 font-medium">Total:</span>
                                <span className="font-bold text-primary">
                                    {totalPrice} {currency}
                                </span>
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