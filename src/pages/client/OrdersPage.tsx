import { useState } from "react"
import { useAuth } from "../../hooks/auth/useAuth"
import useOrders from "../../hooks/orders/useOrders"
import {
    Search,
    Clock,
    CheckCircle,
    XCircle,
    Eye,
    Calendar,
    DollarSign,
    Smartphone,
    User,
    AlertCircle
} from "lucide-react"
import { formatDate } from "../../functions/formatDate"

export default function ClientOrdersPage() {
    const { user } = useAuth()
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [selectedOrder, setSelectedOrder] = useState<any>(null)

    // Récupération des commandes du client avec clientId
    const { data: orders, loading } = useOrders({
        filters: { clientId: user?.id }
    })

    // Filtrage des commandes
    const filteredOrders = orders?.filter(order => {
        const currentStatus = order.status?.toUpperCase()
        const filterStatus = statusFilter.toUpperCase()

        let matchesStatus = false
        if (filterStatus === "ALL") {
            matchesStatus = true
        } else if (filterStatus === "FAILED") {
            matchesStatus = currentStatus === "FAILED"
        } else if (filterStatus === "COMPLETED") {
            matchesStatus = currentStatus === "COMPLETED"
        } else if (filterStatus === "DELIVERED") {
            matchesStatus = currentStatus === "DELIVERED"
        } else if (filterStatus === "PENDING") {
            matchesStatus = currentStatus !== "COMPLETED" && currentStatus !== "FAILED" && currentStatus !== "DELIVERED"
        }

        const matchesSearch =
            (order.id && order.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (order.network && order.network.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (order.vendeurName && order.vendeurName.toLowerCase().includes(searchTerm.toLowerCase()))

        return matchesStatus && matchesSearch
    }) || []

    // Helpers pour les statuts
    const getStatusLabel = (status?: string) => {
        const normalized = status?.toUpperCase()
        if (normalized === "DELIVERED") return "Livrée"
        if (normalized === "COMPLETED") return "Payée"
        if (normalized === "FAILED") return "Échouée"
        return "En attente"
    }

    const getStatusIcon = (status?: string) => {
        const normalized = status?.toUpperCase()
        if (normalized === "DELIVERED") return <CheckCircle className="h-4 w-4 text-green-600" />
        if (normalized === "COMPLETED") return <CheckCircle className="h-4 w-4 text-indigo-500" />
        if (normalized === "FAILED") return <XCircle className="h-4 w-4 text-red-500" />
        return <Clock className="h-4 w-4 text-yellow-500" />
    }

    const getStatusColor = (status?: string) => {
        const normalized = status?.toUpperCase()
        if (normalized === "DELIVERED") return "bg-green-100 text-green-800"
        if (normalized === "COMPLETED") return "bg-indigo-100 text-indigo-800"
        if (normalized === "FAILED") return "bg-red-100 text-red-800"
        return "bg-yellow-100 text-yellow-800"
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            {/* En-tête */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Mes commandes</h1>
                <p className="text-gray-600 mt-1">
                    {filteredOrders.length} commande{filteredOrders.length !== 1 ? 's' : ''}
                </p>
            </div>

            {/* Filtres */}
            <div className="space-y-4 mb-6">
                {/* Barre de recherche */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Rechercher par ID, réseau ou vendeur..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition text-sm bg-white"
                    />
                </div>

                {/* Filtres de statut */}
                <div className="flex overflow-x-auto gap-2 pb-2">
                    {[
                        { id: "all", label: "Toutes" },
                        { id: "PENDING", label: "En attente" },
                        { id: "COMPLETED", label: "Payées" },
                        { id: "DELIVERED", label: "Livrées" },
                        { id: "FAILED", label: "Échouées" }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setStatusFilter(tab.id)}
                            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${statusFilter.toUpperCase() === tab.id.toUpperCase()
                                    ? "bg-primary text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Liste des commandes */}
            {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-xl border p-8 text-center">
                    <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="font-medium text-gray-900 mb-2">
                        {searchTerm || statusFilter !== "all"
                            ? "Aucune commande correspondante"
                            : "Aucune commande"}
                    </h3>
                    <p className="text-gray-600 text-sm">
                        {searchTerm || statusFilter !== "all"
                            ? "Modifiez vos critères de recherche"
                            : "Vous n'avez pas encore passé de commande"}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredOrders.map((order) => (
                        <div key={order.id} className="bg-white rounded-xl border overflow-hidden shadow-sm hover:shadow-md transition">
                            {/* En-tête de la carte */}
                            <div className="px-4 py-3 border-b flex items-center justify-between bg-gray-50/50">
                                <div className="flex items-center gap-2">
                                    {getStatusIcon(order.status)}
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                                        {getStatusLabel(order.status)}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {formatDate(order.createdAt!)}
                                </div>
                            </div>

                            {/* Contenu de la carte */}
                            <div className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Vendeur */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <User className="h-4 w-4 text-gray-500" />
                                            <span className="text-sm font-medium text-gray-700">Vendeur</span>
                                        </div>
                                        <p className="text-sm font-semibold text-gray-900">{order.vendeurName}</p>
                                        <p className="text-xs text-gray-500">{order.vendeurPhone}</p>
                                    </div>

                                    {/* Détails de l'offre */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Smartphone className="h-4 w-4 text-gray-500" />
                                            <span className="text-sm font-medium text-gray-700">Offre</span>
                                        </div>
                                        <p className="text-sm font-semibold text-gray-900">{order.network}</p>
                                        <p className="text-xs text-gray-500">{order.units} unité{order.units > 1 ? 's' : ''}</p>
                                    </div>

                                    {/* Montant */}
                                    <div className="text-right">
                                        <div className="flex items-center gap-1 mb-1 justify-end">
                                            <DollarSign className="h-4 w-4 text-gray-500" />
                                            <span className="text-sm font-medium text-gray-700">Montant</span>
                                        </div>
                                        <p className="text-lg font-bold text-primary">
                                            {order.price} {order.currency}
                                        </p>
                                        <p className="text-xs text-gray-500">Numéro rechargé: {order.phoneNumber}</p>
                                    </div>
                                </div>

                                {/* Motif d'échec si présent */}
                                {order.status?.toUpperCase() === "FAILED" && order.failureReason && (
                                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                                        <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                                        <div>
                                            <span className="text-xs font-semibold text-red-800">Motif :</span>
                                            <p className="text-xs text-red-700">{order.failureReason}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Bouton Détails */}
                                <div className="mt-4 pt-3 border-t flex justify-end">
                                    <button
                                        onClick={() => setSelectedOrder(order)}
                                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition px-3 py-1.5 rounded-lg hover:bg-gray-100"
                                    >
                                        <Eye className="h-4 w-4" />
                                        Voir les détails
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal des détails */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                        <div className="p-4 border-b flex items-center justify-between bg-white shrink-0">
                            <div>
                                <h2 className="text-base font-bold text-gray-900">Détails de la commande</h2>
                                <p className="text-xs font-mono text-gray-500">ID: {selectedOrder.id?.slice(-8) || "N/A"}</p>
                            </div>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="p-1.5 hover:bg-gray-100 rounded-full transition"
                            >
                                <XCircle className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="p-4 overflow-y-auto space-y-4">
                            {/* Statut */}
                            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border">
                                <div>
                                    <span className="text-gray-500 block text-xs">Statut</span>
                                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${getStatusColor(selectedOrder.status)}`}>
                                        {getStatusLabel(selectedOrder.status)}
                                    </span>
                                </div>
                                <div className="text-right text-xs">
                                    <span className="text-gray-500 block">Date</span>
                                    <span className="font-medium text-gray-800">
                                        {selectedOrder.createdAt ? formatDate(selectedOrder.createdAt) : "-"}
                                    </span>
                                </div>
                            </div>

                            {/* Informations */}
                            <div className="space-y-3">
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-500 text-sm">Vendeur</span>
                                    <span className="font-medium text-gray-900">{selectedOrder.vendeurName}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-500 text-sm">Téléphone vendeur</span>
                                    <span className="font-medium text-gray-900">{selectedOrder.vendeurPhone}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-500 text-sm">Réseau</span>
                                    <span className="font-medium text-gray-900">{selectedOrder.network}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-500 text-sm">Unités</span>
                                    <span className="font-medium text-gray-900">{selectedOrder.units}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-500 text-sm">Montant</span>
                                    <span className="font-bold text-primary">{selectedOrder.price} {selectedOrder.currency}</span>
                                </div>
                                <div className="flex justify-between border-b pb-2">
                                    <span className="text-gray-500 text-sm">Numéro rechargé</span>
                                    <span className="font-medium text-gray-900">{selectedOrder.phoneNumber}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 text-sm">Moyen de paiement</span>
                                    <span className="font-medium text-gray-900">{selectedOrder.correspondent || "-"}</span>
                                </div>
                            </div>

                            {selectedOrder.status?.toUpperCase() === "FAILED" && selectedOrder.failureReason && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                                    <p className="text-xs font-semibold text-red-800">Motif de l'échec :</p>
                                    <p className="text-xs text-red-700 mt-1">{selectedOrder.failureReason}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}