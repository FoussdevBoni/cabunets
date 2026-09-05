// pages/NotificationsPage.tsx
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Plus, Eye, Edit, Send } from "lucide-react";
import PageLitLayout from "../../layouts/PageListLayout";
import DeleteConfirmationModal from "../../components/ui/DeleteConfirmationModal";
import MenuModal, { Menu } from "../../components/ui/MenuModal";
import useNotifications from "../../hooks/notifications/useNotifications";
import { Notification } from "../../types/Notification";
import { alertSuccess, alertError } from "../../helpers/alertError";
import NotificationsList from "../../components/features/notifications/NotificationsList";

export default function NotificationsPage() {
    const navigate = useNavigate();
    const { notifications, loading, refresh, deleteNotification, deleteManyNotifications, resendWhatsApp } = useNotifications({});
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedType, setSelectedType] = useState<string>("");
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
    const [notificationToDelete, setNotificationToDelete] = useState<Notification | null>(null);
    const [itemsToDelete, setItemsToDelete] = useState<string[] | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Statistiques
    const stats = useMemo(() => {
        const list = notifications || [];
        return {
            total: list.length,
            general: list.filter(n => n.type === "general").length,
            private: list.filter(n => n.type === "private").length,
            whatsapp: list.filter(n => n.type === "whatsapp").length,
            whatsappPending: list.filter(n => n.type === "whatsapp" && !n.whatsappSent).length,
        };
    }, [notifications]);

    // Filtrage
    const filteredNotifications = useMemo(() => {
        let result = notifications || [];

        if (searchTerm.trim()) {
            const searchLower = searchTerm.toLowerCase();
            result = result.filter(
                (n) =>
                    (n.id || n._id || "").toLowerCase().includes(searchLower) ||
                    (n.title && n.title.toLowerCase().includes(searchLower)) ||
                    (n.body && n.body.toLowerCase().includes(searchLower))
            );
        }

        if (selectedType) {
            result = result.filter((n) => n.type === selectedType);
        }

        return result;
    }, [notifications, searchTerm, selectedType]);

    const handleDelete = async () => {
        if (!notificationToDelete) return;
        setIsDeleting(true);
        try {
            const id = notificationToDelete.id || notificationToDelete._id || "";
            await deleteNotification(id);
            setNotificationToDelete(null);
            alertSuccess("Notification supprimée");
            await refresh();
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
            await deleteManyNotifications(itemsToDelete);
            setItemsToDelete(null);
            alertSuccess(`${itemsToDelete.length} notifications supprimées`);
            await refresh();
        } catch (error) {
            console.error(error);
            alertError("Erreur lors de la suppression multiple");
        }
    };

    const handleResendWhatsApp = async (notification: Notification) => {
        try {
            const id = notification.id || notification._id || "";
            await resendWhatsApp(id);
            alertSuccess("WhatsApp relancé avec succès");
            await refresh();
        } catch (error) {
            console.error(error);
            alertError("Erreur lors du renvoi WhatsApp");
        }
    };

    const clearFilters = () => {
        setSelectedType("");
        setSearchTerm("");
    };

    const hasActiveFilters = selectedType || searchTerm;

    const getActionsMenu = (notification: Notification): Menu[] => {
        const actions: Menu[] = [];

        actions.push({
            label: "Modifier",
            icon: Edit,
            onClick: () => navigate(`/admin/notifications/edit/${notification.id}`),
        });

        if (notification.type === "whatsapp" && !notification.whatsappSent) {
            actions.push({
                label: "Relancer WhatsApp",
                icon: Send,
                onClick: () => handleResendWhatsApp(notification),
            });
        }

        actions.push({
            label: "Supprimer",
            icon: X,
            onClick: () => setNotificationToDelete(notification),
        });

        return actions;
    };

    return (
        <PageLitLayout title="">
            <div className="px-6 py-4 bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                            <p className="text-sm text-gray-500 mt-1">Gérez toutes les notifications</p>
                        </div>
                        <button
                            onClick={() => navigate("/admin/notifications/new")}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition"
                        >
                            <Plus size={18} />
                            <span>Nouvelle notification</span>
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-6">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                            <p className="text-xs text-blue-700/70">Total</p>
                            <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                            <p className="text-xs text-blue-700/70">Générales</p>
                            <p className="text-2xl font-bold text-blue-700">{stats.general}</p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                            <p className="text-xs text-purple-700/70">Privées</p>
                            <p className="text-2xl font-bold text-purple-700">{stats.private}</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                            <p className="text-xs text-green-700/70">WhatsApp</p>
                            <p className="text-2xl font-bold text-green-700">{stats.whatsapp}</p>
                        </div>
                        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4">
                            <p className="text-xs text-yellow-700/70">WhatsApp en attente</p>
                            <p className="text-2xl font-bold text-yellow-700">{stats.whatsappPending}</p>
                        </div>
                    </div>

                    {/* Recherche */}
                    <div className="relative mt-6">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher une notification..."
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                <select
                                    value={selectedType}
                                    onChange={(e) => setSelectedType(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                >
                                    <option value="">Tous</option>
                                    <option value="general">Générale</option>
                                    <option value="private">Privée</option>
                                    <option value="whatsapp">WhatsApp</option>
                                </select>
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
                        {filteredNotifications.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-gray-500">Aucune notification trouvée</p>
                            </div>
                        )}
                        <NotificationsList
                            notifications={filteredNotifications}
                            onAction={(notification) => setSelectedNotification(notification)}
                            onSelectNotifications={(selected) => setItemsToDelete(selected.map((n) => n.id || n._id || ""))}
                            selectable={false}
                            selectActions={[
                                {
                                    label: "Supprimer",
                                    onClick: (selected) => setItemsToDelete(selected.map((n) => n.id || n._id || "")),
                                    className: "bg-red-600 text-white",
                                },
                            ]}
                        />
                    </>
                )}
            </div>

            {/* Menu modal */}
            {selectedNotification && (
                <MenuModal
                    title={`Gérer la Notification`}
                    isOpen={!!selectedNotification}
                    onClose={() => setSelectedNotification(null)}
                    icon={null}
                    menu={getActionsMenu(selectedNotification)}
                />
            )}

            {/* Modals suppression */}
            <DeleteConfirmationModal
                isOpen={!!notificationToDelete}
                onClose={() => setNotificationToDelete(null)}
                onConfirm={handleDelete}
                title="Supprimer la notification"
                message={`Supprimer la notification "${notificationToDelete?.title}" ?`}
                confirmText={isDeleting ? "Suppression..." : "Supprimer"}
            />

            <DeleteConfirmationModal
                isOpen={!!itemsToDelete && itemsToDelete.length > 0}
                onClose={() => setItemsToDelete(null)}
                onConfirm={handleDeleteMany}
                title="Suppression multiple"
                message={`Supprimer ${itemsToDelete?.length} notifications ?`}
            />
        </PageLitLayout>
    );
}