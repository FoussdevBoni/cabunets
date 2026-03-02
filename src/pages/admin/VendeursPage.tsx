import { useState } from "react"
import { Search, Trash2, AlertCircle, ChevronLeft } from "lucide-react"
import useVendeurs from "../../hooks/vendeurs/useVendeurs"

interface Vendeur {
    id: string
    username: string
    email: string
    whatsappNumber: string
    advantage?: string
    networks: {
        Airtel: boolean
        Vodacom: boolean
        Africell: boolean
        Orange: boolean
    }
    photoUrls: string[]
    paymentAmount: number
    availability: string
    createdAt: Date
}

export default function AdminVendeursPage() {
    const { data: vendeurs, loading, refresh, deleteItem: deleteVendeur } = useVendeurs({})
    const [search, setSearch] = useState("")
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
    const [deleting, setDeleting] = useState(false)

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    const filteredVendeurs = vendeurs?.filter(vendeur => {
        const searchTerm = search.toLowerCase()
        return (
            vendeur.username.toLowerCase().includes(searchTerm) ||
            vendeur.email.toLowerCase().includes(searchTerm) ||
            vendeur.whatsappNumber.includes(search)
        )
    }) || []

    const countActiveNetworks = (networks: Vendeur["networks"]) => {
        return Object.values(networks).filter(Boolean).length
    }

    const handleDelete = async (vendeurId: string) => {
        setDeleting(true)
        try {
            deleteVendeur(vendeurId)
            refresh()
            setDeleteConfirm(null)
        } catch (error) {
            console.error("Erreur:", error)
            alert("Erreur lors de la suppression")
        } finally {
            setDeleting(false)
        }
    }

    const formatDate = (date: Date) => {
        const d = new Date(date)
        return d.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b">
                <div className="px-4 py-3">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => window.history.back()}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <div>
                            <h1 className="text-base font-medium">Vendeurs ({filteredVendeurs.length})</h1>
                            <p className="text-xs text-gray-500">Administration</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4">
                {/* Filtre */}
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher un vendeur..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary transition text-sm"
                        />
                    </div>
                </div>

                {/* Tableau */}
                {filteredVendeurs.length === 0 ? (
                    <div className="bg-white rounded-xl border p-8 text-center">
                        <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="font-medium text-gray-900 mb-2">
                            {search ? "Aucun vendeur correspondant" : "Aucun vendeur"}
                        </h3>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Vendeur
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Contact
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Réseaux
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Inscrit le
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredVendeurs.map((vendeur) => (
                                        <tr key={vendeur.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    {vendeur.photoUrls?.[0] ? (
                                                        <img
                                                            src={vendeur.photoUrls[0]}
                                                            alt={vendeur.username}
                                                            className="h-8 w-8 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                            <span className="text-xs font-bold text-primary">
                                                                {vendeur.username.charAt(0).toUpperCase()}
                                                            </span>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">{vendeur.username}</div>
                                                        <div className="text-xs text-gray-500">${vendeur.paymentAmount}/transaction</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="text-sm">
                                                    <div className="text-gray-900">{vendeur.email}</div>
                                                    <div className="text-gray-500 text-xs">{vendeur.whatsappNumber}</div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <div className="text-sm">
                                                    <div className="font-medium text-gray-900">
                                                        {countActiveNetworks(vendeur.networks)}/4 réseaux
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {vendeur.availability || "Disponible"}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(vendeur.createdAt!)}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <button
                                                    onClick={() => setDeleteConfirm(vendeur.id!)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Modal confirmation suppression */}
                {deleteConfirm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-xl max-w-md w-full p-6">
                            <div className="text-center mb-6">
                                <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle className="h-6 w-6 text-red-600" />
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2">Supprimer le vendeur ?</h3>
                                <p className="text-gray-600 text-sm">
                                    Cette action est irréversible. Toutes les offres et commandes associées seront également supprimées.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="flex-1 py-2.5 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
                                    disabled={deleting}
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={() => handleDelete(deleteConfirm)}
                                    disabled={deleting}
                                    className="flex-1 bg-red-600 text-white py-2.5 rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50"
                                >
                                    {deleting ? "Suppression..." : "Supprimer"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}