// pages/VendeurDetailsPage.tsx
import { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Clock, 
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Camera,
  Network,
  Search,
  X,
  Filter,
  RefreshCw,
  Send,
  ExternalLink
} from "lucide-react";
import { useVendeur } from "../../hooks/vendeurs/useVendeur";
import useToken from "../../hooks/auth/useToken";
import { alertSuccess, alertError } from "../../helpers/alertError";
import DeleteConfirmationModal from "../../components/ui/DeleteConfirmationModal";
import MenuModal, { Menu } from "../../components/ui/MenuModal";
import useOrders from "../../hooks/orders/useOrders";
import OrdersList from "../../components/features/orders/OrdersList";
import { Order } from "../../utils/database";

export default function VendeurDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { token } = useToken();
  const { vendeur, vendeurLoading: loading, getVendeur: refresh } = useVendeur({ vendeurId: id! });
  const { data: orders, loading: ordersLoading, refresh: refreshOrders } = useOrders({ filters: { vendeurId: id! } });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [itemsToDelete, setItemsToDelete] = useState<string[] | null>(null);
  const [processingIds, setProcessingIds] = useState<Record<string, boolean>>({});
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);
  const [showTodayOnly, setShowTodayOnly] = useState(true);

  // Statistiques des commandes
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

  // Filtrage des commandes
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

  const handleDelete = async () => {
    if (!vendeur) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/vendeurs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        alertSuccess("Vendeur supprimé avec succès");
        navigate("/admin/vendeurs");
      }
    } catch (error) {
      console.error(error);
      alertError("Erreur lors de la suppression");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleTraitOrder = async (orderId: string) => {
    if (!orderId || processingIds[orderId]) return;
    setProcessingIds(prev => ({ ...prev, [orderId]: true }));
    try {
      const response = await fetch(`/api/orders/traite-order/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.status === 'COMPLETED') {
        alertSuccess("Commande traitée avec succès");
      }
      refreshOrders();
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
      const response = await fetch(`/api/orders/send-pending-whatsapp`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      alertSuccess(`${data.sent} messages envoyés, ${data.failed} échoués`);
      refreshOrders();
    } catch (error) {
      console.error(error);
      alertError("Erreur lors de l'envoi");
    } finally {
      setSendingWhatsApp(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/orders/${orderToDelete.id || orderToDelete._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        setOrderToDelete(null);
        alertSuccess("Commande supprimée");
        refreshOrders();
      }
    } catch (error) {
      console.error(error);
      alertError("Erreur lors de la suppression");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteManyOrders = async () => {
    if (!itemsToDelete || itemsToDelete.length === 0) return;
    try {
      const promises = itemsToDelete.map(id =>
        fetch(`/api/orders/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      );
      await Promise.all(promises);
      setItemsToDelete(null);
      alertSuccess(`${itemsToDelete.length} commandes supprimées`);
      refreshOrders();
    } catch (error) {
      console.error(error);
      alertError("Erreur lors de la suppression multiple");
    }
  };

  const clearFilters = () => {
    setSelectedStatus("");
    setSearchTerm("");
    setShowTodayOnly(false);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!vendeur) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900">Vendeur non trouvé</h2>
          <p className="text-gray-500 mt-2">Ce vendeur n'existe pas ou a été supprimé</p>
          <button
            onClick={() => navigate("/admin/vendeurs")}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
          >
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  const countActiveNetworks = () => {
    if (!vendeur.networks) return 0;
    return Object.values(vendeur.networks).filter(Boolean).length;
  };

  const isOnline = vendeur.isOnline || false;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/admin/vendeurs")}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-base font-medium">Détails du vendeur</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/admin/vendeurs/${id}/edit`)}
                className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Modifier
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Supprimer
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Profil */}
        <div className="bg-white rounded-xl border p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <div className="h-32 w-32 rounded-full bg-gray-200 overflow-hidden">
                {vendeur.photoUrls?.[0] ? (
                  <img
                    src={vendeur.photoUrls[0]}
                    alt={vendeur.username}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <User className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="absolute bottom-1 right-1">
                <div className={`h-4 w-4 rounded-full border-2 border-white ${
                  isOnline ? 'bg-green-500' : 'bg-gray-400'
                }`} />
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <h2 className="text-2xl font-bold text-gray-900">{vendeur.username}</h2>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  isOnline ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}>
                  {isOnline ? 'En ligne' : 'Hors ligne'}
                </span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2 text-gray-600 mt-1">
                <Mail className="h-4 w-4" />
                <span>{vendeur.email}</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2 text-gray-600 mt-1">
                <Phone className="h-4 w-4" />
                <span>{vendeur.whatsappNumber}</span>
              </div>
              {vendeur.advantage && (
                <p className="text-sm text-gray-600 mt-2 max-w-lg">
                  {vendeur.advantage}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Informations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Horaires */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-gray-500" />
              <h3 className="font-bold text-gray-900">Horaires</h3>
            </div>
            {vendeur.openingTime && vendeur.closingTime ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Ouverture</span>
                  <span className="font-medium">{vendeur.openingTime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Fermeture</span>
                  <span className="font-medium">{vendeur.closingTime}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-gray-600">Statut actuel</span>
                  <span className={`font-medium ${isOnline ? 'text-green-600' : 'text-gray-500'}`}>
                    {isOnline ? '🟢 En ligne' : '⚪ Hors ligne'}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">Horaires non définis</p>
            )}
          </div>

          {/* Réseaux */}
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Network className="h-5 w-5 text-gray-500" />
              <h3 className="font-bold text-gray-900">Réseaux</h3>
              <span className="ml-auto text-sm text-gray-500">
                {countActiveNetworks()}/4 actifs
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {vendeur.networks && Object.entries(vendeur.networks).map(([name, active]) => (
                <div
                  key={name}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    active ? 'bg-green-50' : 'bg-gray-100'
                  }`}
                >
                  <span className={`font-medium ${active ? 'text-green-700' : 'text-gray-500'}`}>
                    {name}
                  </span>
                  {active ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Photos */}
        {vendeur.photoUrls && vendeur.photoUrls.length > 0 && (
          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center gap-2 mb-4">
              <Camera className="h-5 w-5 text-gray-500" />
              <h3 className="font-bold text-gray-900">Photos</h3>
              <span className="ml-auto text-sm text-gray-500">
                {vendeur.photoUrls.length} photo(s)
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {vendeur.photoUrls.map((url, index) => (
                <div key={index} className="relative">
                  <div className="h-40 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={url}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {index === 0 && (
                    <div className="absolute bottom-2 left-2 bg-primary text-white px-2 py-1 rounded text-xs">
                      Principale
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section Commandes */}
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="p-6 border-b">
            <h3 className="font-bold text-gray-900">Commandes</h3>
          </div>

          {/* Stats Commandes */}
          <div className="p-6 border-b">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3">
                <p className="text-xs text-blue-700/70">Total</p>
                <p className="text-xl font-bold text-blue-700">{stats.total}</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-3">
                <p className="text-xs text-yellow-700/70">En attente</p>
                <p className="text-xl font-bold text-yellow-700">{stats.pending}</p>
              </div>
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-3">
                <p className="text-xs text-indigo-700/70">Payées</p>
                <p className="text-xl font-bold text-indigo-700">{stats.completed}</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3">
                <p className="text-xs text-green-700/70">Livrées</p>
                <p className="text-xl font-bold text-green-700">{stats.delivered}</p>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-3">
                <p className="text-xs text-red-700/70">Échouées</p>
                <p className="text-xl font-bold text-red-700">{stats.failed}</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-3">
                <p className="text-xs text-emerald-700/70">CA du jour</p>
                <p className="text-xl font-bold text-emerald-700">{stats.todayCA} FCFA</p>
              </div>
            </div>
          </div>

          {/* Recherche et Filtres */}
          <div className="p-6 border-b">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher une commande..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowTodayOnly(!showTodayOnly)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    showTodayOnly ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Aujourd'hui
                </button>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                    showFilters ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Filter className="h-4 w-4" />
                  Filtrer
                  {hasActiveFilters && <span className="w-2 h-2 bg-red-500 rounded-full" />}
                </button>
                <button
                  onClick={handleSendPendingWhatsApp}
                  disabled={sendingWhatsApp || stats.whatsappPending === 0}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                    sendingWhatsApp || stats.whatsappPending === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  <Send className="h-4 w-4" />
                  WhatsApp
                  {stats.whatsappPending > 0 && (
                    <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-bold">
                      {stats.whatsappPending}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-700">Filtres</h4>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                    >
                      <X className="h-4 w-4" /> Effacer tout
                    </button>
                  )}
                </div>
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
              </div>
            )}
          </div>

          {/* Liste des commandes */}
          <div className="p-6">
            {ordersLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">
                      {showTodayOnly ? "Aucune commande pour aujourd'hui" : "Aucune commande trouvée"}
                    </p>
                  </div>
                ) : (
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
                )}
              </>
            )}
          </div>
        </div>

        {/* Informations supplémentaires */}
        <div className="bg-white rounded-xl border p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-500">ID</span>
              <p className="font-mono text-sm">{vendeur.id || vendeur._id}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Inscrit le</span>
              <p className="font-medium">
                {vendeur.createdAt ? new Date(vendeur.createdAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : '-'}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Dernière mise à jour</span>
              <p className="font-medium">
                {vendeur.updatedAt ? new Date(vendeur.updatedAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : '-'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Menu modal pour les commandes */}
      {selectedOrder && (
        <MenuModal
          title="Gérer la commande"
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          icon={null}
          menu={getActionsMenu(selectedOrder)}
        />
      )}

      {/* Modal suppression vendeur */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Supprimer le vendeur"
        message={`Supprimer le vendeur "${vendeur.username}" ? Cette action est irréversible.`}
        confirmText={isDeleting ? "Suppression..." : "Supprimer"}
      />

      {/* Modal suppression commande */}
      <DeleteConfirmationModal
        isOpen={!!orderToDelete}
        onClose={() => setOrderToDelete(null)}
        onConfirm={handleDeleteOrder}
        title="Supprimer la commande"
        message={`Supprimer la commande ?`}
        confirmText={isDeleting ? "Suppression..." : "Supprimer"}
      />

      {/* Modal suppression multiple */}
      <DeleteConfirmationModal
        isOpen={!!itemsToDelete && itemsToDelete.length > 0}
        onClose={() => setItemsToDelete(null)}
        onConfirm={handleDeleteManyOrders}
        title="Suppression multiple"
        message={`Supprimer ${itemsToDelete?.length} commandes ?`}
      />
    </div>
  );
}