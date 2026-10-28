import { getOrderStatusLabel as getStatusLabel, getOrderStatusColor as getStatusColor, canProcessOrder, canDeliverOrder } from "../../../utils/orderStatus";
// pages/vendeur/OrdersPage.tsx
import { useState, useMemo, useEffect } from "react";
import { useAuth } from "../../../hooks/auth/useAuth";
import {
  CheckCircle, Clock, XCircle, Search, User, Smartphone,
  DollarSign, Calendar, Truck, Loader2, ChevronLeft, ChevronRight,
} from "lucide-react";
import useOrders from "../../../hooks/orders/useOrders";
import useToken from "../../../hooks/auth/useToken";
import { alertSuccess, alertError } from "../../../helpers/alertError";
import { orderService } from "../../../services/orderService";

export default function OrdersPage() {
  const { user, loading: userLoading } = useAuth();
  const { token } = useToken();

  const [searchTerm, setSearchTerm] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [deliveringId, setDeliveringId] = useState<string | null>(null);

  // Debounce de la recherche
  useEffect(() => {
    const t = setTimeout(() => {
      setSearchDebounced(searchTerm);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // 🔹 Filtres pour la LISTE (avec status, page, limit)
  const filters = useMemo(
    () => ({
      vendeurId: user?.id || undefined,
      page,
      limit,
      status: statusFilter !== "all" ? statusFilter : undefined,
      search: searchDebounced || undefined,
    }),
    [user?.id, page, limit, statusFilter, searchDebounced]
  );

  // 🔹 Filtres pour les STATS (sans status → compteurs stables)
  const statsFilters = useMemo(
    () => ({
      vendeurId: user?.id || undefined,
      search: searchDebounced || undefined,
    }),
    [user?.id, searchDebounced]
  );

  const {
    data: orders = [],
    stats,
    pagination,
    loading,
    refresh,
  } = useOrders({ filters, statsFilters });

  // Helpers de statut

  const getStatusIcon = (status?: string) => {
    const n = status?.toUpperCase();
        if (status?.toUpperCase() === "CANCELLED" || status?.toUpperCase() === "REFUNDED") return <XCircle className="h-4 w-4 text-gray-500" />;
    if (n === "DELIVERED") return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (n === "COMPLETED") return <CheckCircle className="h-4 w-4 text-blue-500" />;
    if (n === "FAILED") return <XCircle className="h-4 w-4 text-red-500" />;
    return <Clock className="h-4 w-4 text-yellow-500" />;
  };


  const formatDate = (date?: Date | string) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDeliverOrder = async (orderId: string) => {
    if (!token) {
      alertError("Vous devez être connecté");
      return;
    }
    setDeliveringId(orderId);
    try {
      const result = await orderService.deliverOrder(token, orderId);
      if (result.success) {
        alertSuccess("✅ Commande livrée avec succès !");
        await refresh();
      } else {
        alertError(result.error || "Erreur lors de la livraison");
      }
    } catch (error: any) {
      console.error("Erreur lors de la livraison:", error);
      alertError(error?.message || "Une erreur est survenue");
    } finally {
      setDeliveringId(null);
    }
  };

  if (loading || userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Commandes</h1>
            <p className="text-gray-600 mt-1">
              {pagination.total} commande{pagination.total !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Filtres */}
        <div className="space-y-4 mb-6">
          {/* Barre de recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par numéro ou réseau..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary transition text-sm"
            />
          </div>

          {/* Filtres de statut */}
          <div className="flex overflow-x-auto gap-2 pb-2">
            {[
              { id: "all", label: "Toutes" },
              { id: "PENDING", label: "En attente" },
              { id: "COMPLETED", label: "Payées" },
              { id: "DELIVERED", label: "Livrées" },
              { id: "FAILED", label: "Échouées" },
              { id: "CANCELLED", label: "Annulées" },
              { id: "REFUNDED", label: "Remboursées" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setStatusFilter(tab.id);
                  setPage(1);
                }}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
                  statusFilter.toUpperCase() === tab.id.toUpperCase()
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {tab.label}
                {stats && tab.id !== "all" && (
                  <span className="ml-1.5 text-xs opacity-75">
                    {tab.id === "PENDING" ? stats.pending :
                     tab.id === "COMPLETED" ? stats.completed :
                     tab.id === "DELIVERED" ? stats.delivered :
                     tab.id === "FAILED" ? stats.failed : ""}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Liste des commandes */}
        {orders.length === 0 ? (
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
                : "Les commandes apparaîtront ici"}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {orders.map((order) => {
                const isDelivered = order.status?.toUpperCase() === "DELIVERED";
                const isPending = canProcessOrder(order.status);
                const canDeliver = canDeliverOrder(order.status);

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-xl border overflow-hidden"
                  >
                    {/* En-tête de la carte */}
                    <div className="px-4 py-3 border-b flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {getStatusLabel(order.status)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(order.createdAt)}
                      </div>
                    </div>

                    {/* Contenu */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="font-medium text-gray-900">
                              Client
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {order.phoneNumber}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 mb-1 justify-end">
                            <DollarSign className="h-4 w-4 text-gray-500" />
                            <span className="font-bold text-gray-900">
                              {order.price} {order.currency}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.units} unité{order.units > 1 ? "s" : ""}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">
                            {order.network}
                          </span>
                        </div>

                        {canDeliver && (
                          <button
                            onClick={() => handleDeliverOrder(order.id!)}
                            disabled={deliveringId === order.id}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {deliveringId === order.id ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Livraison...
                              </>
                            ) : (
                              <>
                                <Truck className="h-4 w-4" />
                                Confirmer la livraison
                              </>
                            )}
                          </button>
                        )}

                        {isDelivered && (
                          <span className="flex items-center gap-2 text-green-600 text-sm font-medium">
                            <CheckCircle className="h-4 w-4" />
                            Livrée
                          </span>
                        )}
                      </div>

                      {isPending && (
                        <div className="mt-3 text-xs text-gray-500 italic">
                          En attente de paiement du client...
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-8">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                  Précédent
                </button>

                <span className="text-sm text-gray-600 px-3">
                  Page <strong>{pagination.page}</strong> /{" "}
                  {pagination.totalPages}
                  <span className="text-xs text-gray-400 ml-2">
                    ({pagination.total} résultat
                    {pagination.total > 1 ? "s" : ""})
                  </span>
                </span>

                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() =>
                    setPage((p) => Math.min(pagination.totalPages, p + 1))
                  }
                  className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivant
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}