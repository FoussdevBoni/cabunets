import { canProcessOrder, canCancelOrder } from "../../../utils/orderStatus";
// pages/OrdersPage.tsx
import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, RefreshCw, Send, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import PageLitLayout from "../../../layouts/PageListLayout";
import DeleteConfirmationModal from "../../../components/ui/DeleteConfirmationModal";
import MenuModal, { Menu } from "../../../components/ui/MenuModal";
import useOrders from "../../../hooks/orders/useOrders";
import { Order } from "../../../utils/database";
import { alertSuccess, alertError } from "../../../helpers/alertError";
import useToken from "../../../hooks/auth/useToken";
import OrdersList from "../../../components/features/orders/OrdersList";
import { orderService } from "../../../services/orderService";

export default function OrdersPage() {
  const navigate = useNavigate();
  const { token } = useToken();

  // États des filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [showTodayOnly, setShowTodayOnly] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(50);

  // États UI
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [itemsToDelete, setItemsToDelete] = useState<string[] | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [processingIds, setProcessingIds] = useState<Record<string, boolean>>({});
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);

  // Debounce de la recherche
  useEffect(() => {
    const t = setTimeout(() => {
      setSearchDebounced(searchTerm);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Construction des filtres (mémoïsé)
  const filters = useMemo(
    () => ({
      page,
      limit,
      search: searchDebounced || undefined,
      status: selectedStatus || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      day: !startDate && !endDate && showTodayOnly ? true : undefined,
    }),
    [page, limit, searchDebounced, selectedStatus, startDate, endDate, showTodayOnly]
  );

  const {
    data: orders,
    stats,
    pagination,
    loading,
    refresh,
  } = useOrders({ filters });

  // Actions
  const handleTraitOrder = async (orderId: string) => {
    if (!orderId || processingIds[orderId]) return;
    setProcessingIds((prev) => ({ ...prev, [orderId]: true }));
    try {
      const data = await orderService.traitOrder(token, orderId);
      if (data?.status === "COMPLETED") {
        alertSuccess("Commande traitée avec succès");
      }
      await refresh();
      if (
        selectedOrder &&
        (selectedOrder.id === orderId || selectedOrder._id === orderId)
      ) {
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error(error);
      alertError("Erreur lors du traitement");
    } finally {
      setProcessingIds((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const handleSendPendingWhatsApp = async () => {
    if (sendingWhatsApp) return;
    setSendingWhatsApp(true);
    try {
      const data = await orderService.sendPendingWhatsApp(token);
      alertSuccess(`${data.sent} messages envoyés, ${data.failed} échoués`);
      await refresh();
    } catch (error) {
      console.error(error);
      alertError("Erreur lors de l'envoi");
    } finally {
      setSendingWhatsApp(false);
    }
  };

  const handleDelete = async () => {
    if (!orderToDelete || isDeleting) return;
    if (!canCancelOrder(orderToDelete.status)) {
      alertError("Cette commande ne peut plus être annulée. Actualisez la liste.");
      return;
    }
    setIsDeleting(true);
    try {
      const id = orderToDelete.id || orderToDelete._id || "";
      await orderService.delete(id, token);
      setOrderToDelete(null);
      alertSuccess("Commande annulée ; historique conservé");
      await refresh();
    } catch (error: any) {
      console.error(error);
      alertError(error?.response?.data?.error || error?.response?.data?.message || "Annulation impossible. Actualisez la commande.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteMany = async () => {
    if (!itemsToDelete || itemsToDelete.length === 0 || isDeleting) return;
    if (itemsToDelete.some(id => !orders.some(order => (order.id || order._id) === id && canCancelOrder(order.status)))) {
      alertError("Sélectionnez uniquement des commandes non payées à annuler.");
      return;
    }
    setIsDeleting(true);
    try {
      const results = await Promise.allSettled(itemsToDelete.map((id) => orderService.delete(id, token)));
      const success = results.filter(result => result.status === "fulfilled").length;
      const failed = results.length - success;
      setItemsToDelete(null);
      if (failed) alertError(success + " commande(s) annulée(s), " + failed + " non annulée(s). Liste actualisée.");
      else alertSuccess(success + " commande(s) annulée(s) ; historique conservé.");
    } catch (error) {
      console.error(error);
      alertError("Annulation multiple impossible.");
    } finally {
      setIsDeleting(false);
      await refresh();
    }
  };

  const clearFilters = () => {
    setSelectedStatus("");
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
    setShowTodayOnly(true);
    setPage(1);
  };

  const hasActiveFilters =
    !!selectedStatus || !!searchTerm || !!startDate || !!endDate;

  const getActionsMenu = (order: Order): Menu[] => {
    const currentId = order.id || order._id || "";
    const isPending = canProcessOrder(order.status);

    const actions: Menu[] = [];

    if (isPending) {
      actions.push({
        label: "Traiter la commande",
        icon: RefreshCw,
        onClick: () => handleTraitOrder(currentId),
      });
    }

    if (order.depositId) {
      actions.push({
        label: "Voir le dépôt",
        icon: ExternalLink,
        onClick: () => navigate(`/admin/deposit?depositId=${order.depositId}`),
      });
    }

    if (canCancelOrder(order.status)) actions.push({
      label: "Annuler la commande",
      icon: X,
      onClick: () => setOrderToDelete(order),
    });

    return actions;
  };

  const s = stats ?? {
    total: 0,
    pending: 0,
    completed: 0,
    delivered: 0,
    failed: 0,
    whatsappPending: 0,
    ca: 0,
  };

  return (
    <PageLitLayout title="Gestion des commandes">
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Commandes</h1>
              <p className="text-sm text-gray-500 mt-1">Gérez toutes les commandes</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSendPendingWhatsApp}
                disabled={sendingWhatsApp || s.whatsappPending === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${
                  sendingWhatsApp || s.whatsappPending === 0
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                <Send size={18} />
                <span className="hidden sm:inline">WhatsApp</span>
                {s.whatsappPending > 0 && (
                  <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-bold">
                    {s.whatsappPending}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 mt-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
              <p className="text-xs text-blue-700/70">Total</p>
              <p className="text-2xl font-bold text-blue-700">{s.total}</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4">
              <p className="text-xs text-yellow-700/70">En attente</p>
              <p className="text-2xl font-bold text-yellow-700">{s.pending}</p>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4">
              <p className="text-xs text-indigo-700/70">Payées</p>
              <p className="text-2xl font-bold text-indigo-700">{s.completed}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
              <p className="text-xs text-green-700/70">Livrées</p>
              <p className="text-2xl font-bold text-green-700">{s.delivered}</p>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4">
              <p className="text-xs text-red-700/70">Échouées</p>
              <p className="text-2xl font-bold text-red-700">{s.failed}</p>
            </div>
          </div>

          {/* CA sur le filtre actif */}
          <div className="mt-4 p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <span className="text-2xl">💰</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-emerald-800">
                    Chiffre d'affaires
                  </p>
                  <p className="text-xs text-emerald-600/70">
                    {startDate || endDate
                      ? "Sur la période sélectionnée"
                      : showTodayOnly
                        ? "Commandes du jour"
                        : "Toutes les commandes"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-emerald-700">
                  {s.ca.toLocaleString("fr-FR")} FCFA
                </p>
                <p className="text-xs text-emerald-600">
                  {s.total} commande{s.total > 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>

          {/* Recherche */}
          <div className="relative mt-6">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Rechercher une commande..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Filtres */}
          <div className="mt-4 bg-gray-50 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-700">Filtres</h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                >
                  <X size={14} /> Effacer tout
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {/* Statut */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Tous</option>
                  <option value="PENDING">En attente</option>
                  <option value="COMPLETED">Payée</option>
                  <option value="DELIVERED">Livrée</option>
                  <option value="FAILED">Échouée</option>
                  <option value="CANCELLED">Annulée</option>
                  <option value="REFUNDED">Remboursée</option>
                </select>
              </div>

              {/* Date de début */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Du
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              {/* Date de fin */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Au
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              {/* Période rapide */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Période rapide
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setShowTodayOnly(true);
                      setStartDate("");
                      setEndDate("");
                      setPage(1);
                    }}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      showTodayOnly && !startDate && !endDate
                        ? "bg-primary text-white"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Aujourd'hui
                  </button>
                  <button
                    onClick={() => {
                      setShowTodayOnly(false);
                      setStartDate("");
                      setEndDate("");
                      setPage(1);
                    }}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      !showTodayOnly && !startDate && !endDate
                        ? "bg-primary text-white"
                        : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Toutes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8 max-w-7xl mx-auto">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {orders.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  {showTodayOnly && !startDate && !endDate
                    ? "Aucune commande pour aujourd'hui"
                    : "Aucune commande trouvée"}
                </p>
              </div>
            )}

            <OrdersList
              orders={orders}
              processingIds={processingIds}
              onTraitOrder={handleTraitOrder}
              onAction={(order) => setSelectedOrder(order)}
              onSelectOrders={(selected) =>
                setItemsToDelete(selected.map((o) => o.id || o._id || ""))
              }
              selectable={false}
              selectActions={[
                {
                  label: "Annuler les commandes",
                  onClick: (selected) =>
                    setItemsToDelete(selected.map((o) => o.id || o._id || "")),
                  className: "bg-red-600 text-white",
                },
              ]}
            />

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
                  Page <strong>{pagination.page}</strong> / {pagination.totalPages}
                  <span className="text-xs text-gray-400 ml-2">
                    ({pagination.total} résultat{pagination.total > 1 ? "s" : ""})
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

      {/* Menu modal */}
      {selectedOrder && (
        <MenuModal
          title={`Gérer la Commande`}
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          icon={null}
          menu={getActionsMenu(selectedOrder)}
        />
      )}

      {/* Modals suppression */}
      <DeleteConfirmationModal
        isOpen={!!orderToDelete}
        onClose={() => setOrderToDelete(null)}
        onConfirm={handleDelete}
        title="Annuler la commande non payée"
        message={`Annuler la commande de "${orderToDelete?.vendeurName}" ?`}
        confirmText={isDeleting ? "Annulation..." : "Confirmer l’annulation"}
        cancelText="Conserver la commande"
      />

      <DeleteConfirmationModal
        isOpen={!!itemsToDelete && itemsToDelete.length > 0}
        onClose={() => setItemsToDelete(null)}
        onConfirm={handleDeleteMany}
        confirmText={isDeleting ? "Annulation..." : "Confirmer les annulations"}
        cancelText="Conserver les commandes"
        title="Annuler les commandes non payées"
        message={`Annuler ${itemsToDelete?.length} commandes non payées ? Leur historique sera conservé.`}
      />
    </PageLitLayout>
  );
}