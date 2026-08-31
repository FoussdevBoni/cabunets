// pages/UsersPage.tsx
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Plus, Filter, Users, UserCog, UserIcon, CheckCircle, Ban, UserCheck } from "lucide-react";
import PageLitLayout from "../../layouts/PageListLayout";
import DeleteConfirmationModal from "../../components/ui/DeleteConfirmationModal";
import MenuModal, { Menu } from "../../components/ui/MenuModal";
import useUsers, { userService } from "../../hooks/users/useUsers";
import { User, UserRole } from "../../utils/database";
import { alertSuccess, alertError } from "../../helpers/alertError";
import UsersList from "../../components/features/users/UsersList";

export default function UsersPage() {
  const navigate = useNavigate();
  const { data: users, loading, refresh, deleteItem: deleteUser, updateItem: updateUser } = useUsers({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole | "all">("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [itemsToDelete, setItemsToDelete] = useState<string[] | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  // Statistiques
  const stats = useMemo(() => {
    const list = users || [];
    return {
      total: list.length,
      admins: list.filter(u => u.role === 'admin').length,
      vendeurs: list.filter(u => u.role === 'vendeur').length,
      clients: list.filter(u => u.role === 'client').length,
      verified: list.filter(u => u.isVerified === true).length,
      active: list.filter(u => u.isActive !== false).length,
      inactive: list.filter(u => u.isActive === false).length,
    };
  }, [users]);

  // Filtrage
  const filteredUsers = useMemo(() => {
    let result = users || [];

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        (u) =>
          (u.username && u.username.toLowerCase().includes(searchLower)) ||
          (u.email && u.email.toLowerCase().includes(searchLower)) ||
          (u.id && u.id.toLowerCase().includes(searchLower))
      );
    }

    if (selectedRole !== "all") {
      result = result.filter((u) => u.role === selectedRole);
    }

    return result;
  }, [users, searchTerm, selectedRole]);

  // Actions
  const handleDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      const id = userToDelete.id || userToDelete._id || "";
      await deleteUser(id);
      setUserToDelete(null);
      alertSuccess("Utilisateur supprimé avec succès");
      refresh();
    } catch (error) {
      console.error(error);
      alertError("Erreur lors de la suppression");
    } finally {
      setIsDeleting(false);
    }
  };

  const verifyUser = async (user: User) => {
    try {
      await userService.verifyUser(user.id || user._id || "");
      alertSuccess("Utilisateur vérifié avec succès");
      refresh();
    } catch (error) {
      console.error(error);
      alertError("Erreur lors de la vérification");
    }
  };

  const toggleUserStatus = async (user: User) => {
    const newStatus = !user.isActive;
    try {
      await userService.toggleUserStatus(user.id || user._id || "", newStatus);
      alertSuccess(`Compte ${newStatus ? 'activé' : 'désactivé'} avec succès`);
      refresh();
    } catch (error) {
      console.error(error);
      alertError("Erreur lors du changement de statut");
    }
  };

  const handleVerifyMany = async (selected: User[]) => {
    const unverifiedUsers = selected.filter((u) => !u.isVerified);
    if (unverifiedUsers.length === 0) {
      alertSuccess("Tous les utilisateurs sélectionnés sont déjà vérifiés");
      return;
    }

    setIsVerifying(true);
    try {
      for (const user of unverifiedUsers) {
        const id = user.id || user._id || "";
        if (id) await userService.verifyUser(id);
      }
      alertSuccess(`${unverifiedUsers.length} utilisateur(s) vérifié(s) avec succès`);
      refresh();
    } catch (error) {
      console.error(error);
      alertError("Erreur lors de la vérification en masse");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleToggleMany = async (selected: User[], activate: boolean) => {
    const usersToToggle = selected.filter((u) => u.isActive !== activate);
    if (usersToToggle.length === 0) {
      alertSuccess(`Tous les utilisateurs sélectionnés sont déjà ${activate ? 'activés' : 'désactivés'}`);
      return;
    }

    setIsToggling(true);
    try {
      for (const user of usersToToggle) {
        const id = user.id || user._id || "";
        if (id) await userService.toggleUserStatus(id, activate);
      }
      alertSuccess(`${usersToToggle.length} utilisateur(s) ${activate ? 'activés' : 'désactivés'} avec succès`);
      refresh();
    } catch (error) {
      console.error(error);
      alertError(`Erreur lors de l'${activate ? 'activation' : 'désactivation'} en masse`);
    } finally {
      setIsToggling(false);
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
      alertSuccess(`${itemsToDelete.length} utilisateurs supprimés`);
      refresh();
    } catch (error) {
      console.error(error);
      alertError("Erreur lors de la suppression multiple");
    } finally {
      setIsDeleting(false);
    }
  };

  const clearFilters = () => {
    setSelectedRole("all");
    setSearchTerm("");
  };

  const hasActiveFilters = selectedRole !== "all" || searchTerm;

 const getActionsMenu = (user: User): Menu[] => {
    const actions: Menu[] = [];

    actions.push({
      label: "Voir le profil",
      icon: UserIcon, // Passer le composant directement, SANS JSX
      onClick: () => navigate(`/admin/users/${user.id || user._id}`),
    });

    if (!user.isVerified) {
      actions.push({
        label: "Vérifier l'utilisateur",
        icon: CheckCircle, // Passer le composant directement
        onClick: () => verifyUser(user),
      });
    }

    actions.push({
      label: user.isActive ? "Désactiver le compte" : "Activer le compte",
      icon: user.isActive ? Ban : UserCheck, // Passer le composant directement
      onClick: () => toggleUserStatus(user),
    });

    actions.push({
      label: "Supprimer",
      icon: X, // Passer le composant directement
      onClick: () => setUserToDelete(user),
    });

    return actions;
  };

  return (
    <PageLitLayout title="Gestion des utilisateurs">
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
              <p className="text-sm text-gray-500 mt-1">Gérez tous les utilisateurs</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4 mt-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
              <p className="text-xs text-blue-700/70">Total</p>
              <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
              <p className="text-xs text-purple-700/70">Admins</p>
              <p className="text-2xl font-bold text-purple-700">{stats.admins}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
              <p className="text-xs text-blue-700/70">Vendeurs</p>
              <p className="text-2xl font-bold text-blue-700">{stats.vendeurs}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
              <p className="text-xs text-green-700/70">Clients</p>
              <p className="text-2xl font-bold text-green-700">{stats.clients}</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4">
              <p className="text-xs text-emerald-700/70">Vérifiés</p>
              <p className="text-2xl font-bold text-emerald-700">{stats.verified}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
              <p className="text-xs text-green-700/70">Actifs</p>
              <p className="text-2xl font-bold text-green-700">{stats.active}</p>
            </div>
          </div>

          {/* Recherche */}
          <div className="relative mt-6">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Filtres par rôle */}
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedRole("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                selectedRole === "all"
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setSelectedRole("admin")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap flex items-center gap-1 ${
                selectedRole === "admin"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <UserCog size={16} />
              Admins
            </button>
            <button
              onClick={() => setSelectedRole("vendeur")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap flex items-center gap-1 ${
                selectedRole === "vendeur"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Users size={16} />
              Vendeurs
            </button>
            <button
              onClick={() => setSelectedRole("client")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap flex items-center gap-1 ${
                selectedRole === "client"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <UserIcon size={16} />
              Clients
            </button>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition whitespace-nowrap flex items-center gap-1"
              >
                <X size={16} />
                Effacer
              </button>
            )}
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
            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">Aucun utilisateur trouvé</p>
              </div>
            )}
            <UsersList
              users={filteredUsers}
              onAction={(user) => setSelectedUser(user)}
              onSelectUsers={(selected) => setSelectedUsers(selected)}
              selectable={true}
              selectActions={[
                {
                  label: isVerifying ? "Vérification..." : "Vérifier la sélection",
                  onClick: (selected) => handleVerifyMany(selected),
                  className: "bg-emerald-600 text-white hover:bg-emerald-700",
                },
                {
                  label: isToggling ? "Traitement..." : "Activer la sélection",
                  onClick: (selected) => handleToggleMany(selected, true),
                  className: "bg-green-600 text-white hover:bg-green-700",
                },
                {
                  label: isToggling ? "Traitement..." : "Désactiver la sélection",
                  onClick: (selected) => handleToggleMany(selected, false),
                  className: "bg-orange-600 text-white hover:bg-orange-700",
                },
                {
                  label: "Supprimer",
                  onClick: (selected) => setItemsToDelete(selected.map((u) => u.id || u._id || "")),
                  className: "bg-red-600 text-white hover:bg-red-700",
                },
              ]}
              onDelete={(id) => {
                const user = users?.find(u => (u.id || u._id) === id);
                if (user) setUserToDelete(user);
              }}
            />
          </>
        )}
      </div>

      {/* Menu modal */}
      {selectedUser && (
        <MenuModal
          title={`Gérer ${selectedUser.username}`}
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          icon={null}
          menu={getActionsMenu(selectedUser)}
        />
      )}

      {/* Modals suppression */}
      <DeleteConfirmationModal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleDelete}
        title="Supprimer l'utilisateur"
        message={`Supprimer l'utilisateur "${userToDelete?.username}" ?`}
        confirmText={isDeleting ? "Suppression..." : "Supprimer"}
      />

      <DeleteConfirmationModal
        isOpen={!!itemsToDelete && itemsToDelete.length > 0}
        onClose={() => setItemsToDelete(null)}
        onConfirm={handleDeleteMany}
        title="Suppression multiple"
        message={`Supprimer ${itemsToDelete?.length} utilisateurs ?`}
      />
    </PageLitLayout>
  );
}