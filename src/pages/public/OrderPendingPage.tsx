import { useEffect, useState, useRef, useCallback } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { Loader2, CheckCircle2, XCircle, Smartphone, ArrowRight } from "lucide-react"
import { ordersService } from "../../hooks/orders/useOrders"
import { Order } from "../../utils/database"
import { getPawapayError } from "../../utils/getPawapayErrors" // Assure-toi d'ajuster le chemin de ton fichier

export default function OrderPendingPage() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const orderId = searchParams.get("orderId")

    const [order, setOrder] = useState<Order | null>(null)
    const [loading, setLoading] = useState(true)
    const [status, setStatus] = useState<"PENDING" | "COMPLETED" | "FAILED">("PENDING")
    const [fetchError, setFetchError] = useState<string | null>(null)

    const statusRef = useRef(status)
    statusRef.current = status

    const checkAndSyncStatus = useCallback(async () => {
        if (!orderId) return

        try {
            const updatedOrder = await ordersService.syncOrderStatus(orderId)

            if (!updatedOrder) {
                setFetchError("Commande introuvable")
                setLoading(false)
                return
            }

            setOrder(updatedOrder.order)
            setLoading(false)

            const currentStatus = updatedOrder.status?.toUpperCase()

            if (currentStatus === "COMPLETED") {
                setStatus("COMPLETED")
            } else if (currentStatus === "FAILED") {
                setStatus("FAILED")
            } else {
                setStatus("PENDING")
            }
        } catch (error) {
            console.error("Erreur synchro Cabupay:", error)
        }
    }, [orderId])

    useEffect(() => {
        if (!orderId) {
            navigate("/", { replace: true })
            return
        }

        let isMounted = true

        checkAndSyncStatus()

        const interval = setInterval(() => {
            if (isMounted && statusRef.current === "PENDING") {
                checkAndSyncStatus()
            } else {
                clearInterval(interval)
            }
        }, 3000)

        return () => {
            isMounted = false
            clearInterval(interval)
        }
    }, [orderId, checkAndSyncStatus, navigate])

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Vérification de la commande...</p>
                </div>
            </div>
        )
    }

    if (fetchError) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-2xl border p-8 shadow-sm text-center">
                    <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">{fetchError}</h2>
                    <p className="text-gray-600 text-sm mb-6">
                        Impossible de récupérer les détails de cette transaction.
                    </p>
                    <button
                        onClick={() => navigate("/")}
                        className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition"
                    >
                        Retour à l'accueil
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl border p-8 shadow-sm text-center">
                
                {/* PENDING */}
                {status === "PENDING" && (
                    <div>
                        <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                            <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping opacity-75" />
                            <div className="relative bg-primary/20 p-4 rounded-full">
                                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                            </div>
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Paiement en cours
                        </h2>
                        <p className="text-gray-600 text-sm mb-6">
                            Veuillez valider le push Mobile Money sur votre téléphone (<b>{order?.paymentPhone || order?.phoneNumber}</b>).
                        </p>

                        <div className="bg-gray-50 rounded-xl p-4 text-left space-y-3 mb-6 border">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Réseau d'unités :</span>
                                <span className="font-semibold text-gray-900">{order?.network}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Numéro à recharger :</span>
                                <span className="font-semibold text-gray-900">{order?.phoneNumber}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Montant :</span>
                                <span className="font-semibold text-primary">
                                    {order?.price ? Number(order.price).toLocaleString("fr-FR") : 0} {order?.currency || "FCFA"}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                            <Smartphone className="h-4 w-4" />
                            <span>Vérification automatique de la validation...</span>
                        </div>
                    </div>
                )}

                {/* COMPLETED */}
                {status === "COMPLETED" && (
                    <div>
                        <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="h-10 w-10 text-green-600" />
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Paiement confirmé !
                        </h2>
                        <p className="text-gray-600 text-sm mb-6">
                            Vos unités <b>{order?.units} {order?.network}</b> ont été créditées sur le numéro <b>{order?.phoneNumber}</b>.
                        </p>

                        <button
                            onClick={() => navigate("/")}
                            className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition flex items-center justify-center gap-2"
                        >
                            <span>Retour à l'accueil</span>
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {/* FAILED */}
                {status === "FAILED" && (
                    <div>
                        <div className="h-20 w-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <XCircle className="h-10 w-10 text-red-600" />
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Transaction échouée
                        </h2>
                        
                        <div className="bg-red-50 border border-red-100 text-red-700 p-3 rounded-lg text-sm mb-6">
                        {getPawapayError(order?.failureCode || order?.failureReason || "")}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => navigate(-1)}
                                className="flex-1 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition"
                            >
                                Réessayer
                            </button>
                            <button
                                onClick={() => navigate("/")}
                                className="flex-1 bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition"
                            >
                                Accueil
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    )
}