// pages/OrdersPage.tsx
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Filter, X, Eye, RefreshCw, Send, MessageCircle, ExternalLink, Calendar } from "lucide-react";
import PageLitLayout from "../../layouts/PageListLayout";
import DeleteConfirmationModal from "../../components/ui/DeleteConfirmationModal";
import MenuModal, { Menu } from "../../components/ui/MenuModal";
import useOrders, { ordersService } from "../../hooks/orders/useOrders";
import { Order } from "../../utils/database";
import { alertSuccess, alertError } from "../../helpers/alertError";
import useToken from "../../hooks/auth/useToken";
import OrdersList from "../../components/features/orders/OrdersList";

export default function OrdersPage() {
  const navigate = useNavigate();
  const { token } = useToken();
  const { data: orders, loading, refresh } = useOrders({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [itemsToDelete, setItemsToDelete] = useState<string[] | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [processingIds, setProcessingIds] = useState<Record<string, boolean>>({});
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);
  const [showTodayOnly, setShowTodayOnly] = useState(true);

  // Statistiques
  const stats = useMemo(() => {
    const ordersList = orders || [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = ordersList.filter(o => {
      const orderDate = o.createdAt ? new Date(o.createdAt) : null;
      if (!orderDate) return false;
      orderDate.setHours(0, 0, 0, 0);
      return orderDate.getTime() === today.getTime();
    });

    const totalCA = todayOrders
      .filter(o => o.status?.toUpperCase() === "COMPLETED" || o.status?.toUpperCase() === "DELIVERED")
      .reduce((sum, o) => sum + (o.price || 0), 0);

    return {
      total: ordersList.length,
      pending: ordersList.filter(o => o.status?.toUpperCase() === "PENDING").length,
      completed: ordersList.filter(o => o.status?.toUpperCase() === "COMPLETED").length,
      delivered: ordersList.filter(o => o.status?.toUpperCase() === "DELIVERED").length,
      failed: ordersList.filter(o => o.status?.toUpperCase() === "FAILED").length,
      whatsappPending: ordersList.filter(o => o.status?.toUpperCase() === "COMPLETED" && !o.whatsappSent).length,
      todayOrders: todayOrders.length,
      todayCA: totalCA,
    };
  }, [orders]);

  // Filtrage
  const filteredOrders = useMemo(() => {
    let result = orders || [];

    if (showTodayOnly) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      result = result.filter(o => {
        const orderDate = o.createdAt ? new Date(o.createdAt) : null;
        if (!orderDate) return false;
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime();
      });
    }

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        (o) =>
          (o.id || o._id || "").toLowerCase().includes(searchLower) ||
          (o.depositId && o.depositId.toLowerCase().includes(searchLower)) ||
          (o.phoneNumber && o.phoneNumber.includes(searchTerm)) ||
          (o.vendeurName && o.vendeurName.toLowerCase().includes(searchLower)) ||
          (o.vendeurPhone && o.vendeurPhone.includes(searchTerm)) ||
          (o.network && o.network.toLowerCase().includes(searchLower))
      );
    }

    if (selectedStatus) {
      result = result.filter((o) => o.status?.toUpperCase() === selectedStatus.toUpperCase());
    }

    return result;
  }, [orders, searchTerm, selectedStatus, showTodayOnly]);

  // Actions
  const handleTraitOrder = async (orderId: string) => {
    if (!orderId || processingIds[orderId]) return;
    setProcessingIds(prev => ({ ...prev, [orderId]: true }));
    try {
      const data = await ordersService.traitOrder(token, orderId);
      if (data?.status === 'COMPLETED') {
        alertSuccess("Commande traitée avec succès");
      }
      if (typeof refresh === "function") {
        await refresh();
      }
      if (selectedOrder && (selectedOrder.id === orderId || selectedOrder._id === orderId)) {
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error(error);
      alertError("Erreur lors du traitement");
    } finally {
      setProcessingIds(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const handleSendPendingWhatsApp = async () => {
    if (sendingWhatsApp) return;
    setSendingWhatsApp(true);
    try {
      const data = await ordersService.sendPendingWhatsApp(token);
      alertSuccess(`${data.sent} messages envoyés, ${data.failed} échoués`);
      if (typeof refresh === "function") {
        await refresh();
      }
    } catch (error) {
      console.error(error);
      alertError("Erreur lors de l'envoi");
    } finally {
      setSendingWhatsApp(false);
    }
  };

  const handleDelete = async () => {
    if (!orderToDelete) return;
    setIsDeleting(true);
    try {
      const id = orderToDelete.id || orderToDelete._id || "";
      const response = await fetch(`/api/orders/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        setOrderToDelete(null);
        alertSuccess("Commande supprimée");
        if (typeof refresh === "function") {
          await refresh();
        }
      }
    } catch (error) {
      console.error(error);
      alertError("Erreur lors de la suppression");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteMany = async () => {
    if (!itemsToDelete || itemsToDelete.length === 0) return;
    try {
      const promises = itemsToDelete.map(id =>
        fetch(`/api/orders/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        })
      );
      await Promise.all(promises);
      setItemsToDelete(null);
      alertSuccess(`${itemsToDelete.length} commandes supprimées`);
      if (typeof refresh === "function") {
        await refresh();
      }
    } catch (error) {
      console.error(error);
      alertError("Erreur lors de la suppression multiple");
    }
  };

  const clearFilters = () => {
    setSelectedStatus("");
    setSearchTerm("");
  };

  const hasActiveFilters = selectedStatus || searchTerm;

  const getActionsMenu = (order: Order): Menu[] => {
    const currentId = order.id || order._id || "";
    const isPending = order.status?.toUpperCase() !== "COMPLETED" && 
                     order.status?.toUpperCase() !== "FAILED" && 
                     order.status?.toUpperCase() !== "DELIVERED";

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

    actions.push({
      label: "Supprimer",
      icon: X,
      onClick: () => setOrderToDelete(order),
    });

    return actions;
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
                disabled={sendingWhatsApp || stats.whatsappPending === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${
                  sendingWhatsApp || stats.whatsappPending === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                <Send size={18} />
                <span className="hidden sm:inline">WhatsApp</span>
                {stats.whatsappPending > 0 && (
                  <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-bold">
                    {stats.whatsappPending}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 mt-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
              <p className="text-xs text-blue-700/70">Total</p>
              <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4">
              <p className="text-xs text-yellow-700/70">En attente</p>
              <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4">
              <p className="text-xs text-indigo-700/70">Payées</p>
              <p className="text-2xl font-bold text-indigo-700">{stats.completed}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
              <p className="text-xs text-green-700/70">Livrées</p>
              <p className="text-2xl font-bold text-green-700">{stats.delivered}</p>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4">
              <p className="text-xs text-red-700/70">Échouées</p>
              <p className="text-2xl font-bold text-red-700">{stats.failed}</p>
            </div>
          </div>

          {/* CA du jour */}
          <div className="mt-4 p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-lg">
                  <span className="text-2xl">💰</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-emerald-800">Chiffre d'affaires du jour</p>
                  <p className="text-xs text-emerald-600/70">
                    {showTodayOnly ? 'Commandes du jour' : 'Toutes les commandes'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-emerald-700">
                  {stats.todayCA.toLocaleString()} FCFA
                </p>
                <p className="text-xs text-emerald-600">
                  {stats.todayOrders} commande{stats.todayOrders > 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Recherche */}
          <div className="relative mt-6">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Tous</option>
                  <option value="PENDING">En attente</option>
                  <option value="COMPLETED">Payée</option>
                  <option value="DELIVERED">Livrée</option>
                  <option value="FAILED">Échouée</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Période</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowTodayOnly(true)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      showTodayOnly
                        ? 'bg-primary text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Aujourd'hui
                  </button>
                  <button
                    onClick={() => setShowTodayOnly(false)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      !showTodayOnly
                        ? 'bg-primary text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
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
            {filteredOrders.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  {showTodayOnly ? "Aucune commande pour aujourd'hui" : "Aucune commande trouvée"}
                </p>
              </div>
            )}
            <OrdersList
              orders={filteredOrders}
              processingIds={processingIds}
              onTraitOrder={handleTraitOrder}
              onAction={(order) => setSelectedOrder(order)}
              onSelectOrders={(selected) => setItemsToDelete(selected.map((o) => o.id || o._id || ""))}
              selectable={false}
              selectActions={[
                {
                  label: "Supprimer",
                  onClick: (selected) => setItemsToDelete(selected.map((o) => o.id || o._id || "")),
                  className: "bg-red-600 text-white",
                },
              ]}
            />
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
        title="Supprimer la commande"
        message={`Supprimer la commande de "${orderToDelete?.vendeurName}" ?`}
        confirmText={isDeleting ? "Suppression..." : "Supprimer"}
      />

      <DeleteConfirmationModal
        isOpen={!!itemsToDelete && itemsToDelete.length > 0}
        onClose={() => setItemsToDelete(null)}
        onConfirm={handleDeleteMany}
        title="Suppression multiple"
        message={`Supprimer ${itemsToDelete?.length} commandes ?`}
      />
    </PageLitLayout>
  );
}