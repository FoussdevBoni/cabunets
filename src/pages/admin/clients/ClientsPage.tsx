// pages/ClientsPage.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft, ChevronRight, Search, UserCog,
  Eye, Trash2, Ban, UserCheck,
} from "lucide-react";
import { User } from "../../../utils/database";
import useUsers from "../../../hooks/users/useUsers";
import ClientsList from "../../../components/features/clients/ClientsList";
import DeleteConfirmationModal from "../../../components/ui/DeleteConfirmationModal";
import MenuModal, { Menu } from "../../../components/ui/MenuModal";
import { alertSuccess, alertError } from "../../../helpers/alertError";
import { userService } from "../../../services/userService";

export default function ClientsPage() {
  const navigate = useNavigate();

  // États UI
  const [searchTerm, setSearchTerm] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(50);

  const [selectedClient, setSelectedClient] = useState<User | null>(null);
  const [clientToDelete, setClientToDelete] = useState<User | null>(null);
  const [itemsToDelete, setItemsToDelete] = useState<string[] | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Debounce de la recherche
  useEffect(() => {
    const t = setTimeout(() => {
      setSearchDebounced(searchTerm);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Filtres passés au back
  const filters = {
    role: "client" as const,
    page,
    limit,
    search: searchDebounced || undefined,
  };

  const {
    data: clients,
    stats,
    pagination,
    loading,
    refresh,
    deleteItem: deleteUser,
  } = useUsers({ filters });

  const s = stats ?? {
    total: 0, clients: 0, vendeurs: 0, admins: 0,
    verified: 0, active: 0, inactive: 0,
  };

  // Actions
  const handleDelete = async () => {
    if (!clientToDelete) return;
    setIsDeleting(true);
    try {
      const id = clientToDelete.id || clientToDelete._id || "";
      await deleteUser(id);
      setClientToDelete(null);
      alertSuccess("Client supprimé avec succès");
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
    setIsDeleting(true);
    try {
      for (const id of itemsToDelete) {
        await deleteUser(id);
      }
      setItemsToDelete(null);
      alertSuccess(`${itemsToDelete.length} clients supprimés`);
      await refresh();
    } catch (error) {
      console.error(error);
      alertError("Erreur lors de la suppression multiple");
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleClientStatus = async (user: User) => {
    const newStatus = !user.isActive;
    try {
      await userService.toggleUserStatus(user.id || user._id || "", newStatus);
      alertSuccess(`Compte ${newStatus ? "activé" : "désactivé"} avec succès`);
      await refresh();
    } catch (error) {
      console.error(error);
      alertError("Erreur lors du changement de statut");
    }
  };

  const getActionsMenu = (user: User): Menu[] => {
    const actions: Menu[] = [];

    actions.push({
      label: "Voir le profil",
      icon: Eye,
      onClick: () => navigate(`/admin/users/${user.id || user._id}`),
    });

    actions.push({
      label: "Gérer le client",
      icon: UserCog,
      onClick: () => {
        const id = user.id || user._id;
        navigate(`/admin/users/${id}/manage`);
      },
    });

    actions.push({
      label:
        user.isActive !== false
          ? "Désactiver le compte"
          : "Activer le compte",
      icon: user.isActive !== false ? Ban : UserCheck,
      onClick: () => toggleClientStatus(user),
    });

    actions.push({
      label: "Supprimer",
      icon: Trash2,
      onClick: () => setClientToDelete(user),
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.history.back()}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-base font-medium">
                Clients ({pagination.total})
              </h1>
              <p className="text-xs text-gray-500">Gestion des clients</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-7xl mx-auto">
        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Total clients</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-blue-600">
              {s.clients}
            </p>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Actifs</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-green-600">
              {s.active}
            </p>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Vérifiés</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-emerald-600">
              {s.verified}
            </p>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Inactifs</span>
            </div>
            <p className="text-2xl font-bold mt-1 text-red-600">
              {s.inactive}
            </p>
          </div>
        </div>

        {/* Recherche */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un client (nom, email...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary transition text-sm"
            />
          </div>
        </div>

        {/* Tableau */}
        {clients.length === 0 ? (
          <div className="bg-white rounded-xl border p-8 text-center">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="font-medium text-gray-900 mb-2">
              {searchTerm ? "Aucun client correspondant" : "Aucun client"}
            </h3>
            <p className="text-sm text-gray-500">
              {searchTerm
                ? "Essayez de modifier votre recherche"
                : "Aucun client n'est encore inscrit"}
            </p>
          </div>
        ) : (
          <>
            <ClientsList
              clients={clients}
              onAction={(client) => setSelectedClient(client)}
              onSelectClients={(selected) =>
                setItemsToDelete(selected.map((c) => c.id || c._id || ""))
              }
              selectable={false}
              selectActions={[
                {
                  label: "Supprimer",
                  onClick: (selected) =>
                    setItemsToDelete(selected.map((c) => c.id || c._id || "")),
                  className: "bg-red-600 text-white hover:bg-red-700",
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
      {selectedClient && (
        <MenuModal
          title={`Gérer ${selectedClient.username}`}
          isOpen={!!selectedClient}
          onClose={() => setSelectedClient(null)}
          icon={null}
          menu={getActionsMenu(selectedClient)}
        />
      )}

      {/* Modale suppression simple */}
      <DeleteConfirmationModal
        isOpen={!!clientToDelete}
        onClose={() => setClientToDelete(null)}
        onConfirm={handleDelete}
        title="Supprimer le client"
        message={`Supprimer le client "${clientToDelete?.username}" ?`}
        confirmText={isDeleting ? "Suppression..." : "Supprimer"}
      />

      {/* Modale suppression multiple */}
      <DeleteConfirmationModal
        isOpen={!!itemsToDelete && itemsToDelete.length > 0}
        onClose={() => setItemsToDelete(null)}
        onConfirm={handleDeleteMany}
        title="Suppression multiple"
        message={`Supprimer ${itemsToDelete?.length} clients ?`}
        confirmText={isDeleting ? "Suppression..." : "Supprimer"}
      />
    </div>
  );
}