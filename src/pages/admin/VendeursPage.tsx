// pages/VendeursPage.tsx
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Plus, Filter, UserPlus } from "lucide-react";
import PageLitLayout from "../../layouts/PageListLayout";
import DeleteConfirmationModal from "../../components/ui/DeleteConfirmationModal";
import MenuModal, { Menu } from "../../components/ui/MenuModal";
import useVendeurs from "../../hooks/vendeurs/useVendeurs";
import { Vendeur } from "../../utils/database";
import { alertSuccess, alertError } from "../../helpers/alertError";
import VendeursList from "../../components/features/vendeurs/VendeursList";

export default function VendeursPage() {
  const navigate = useNavigate();
  const { data: vendeurs, loading, refresh, deleteItem: deleteVendeur } = useVendeurs({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedVendeur, setSelectedVendeur] = useState<Vendeur | null>(null);
  const [vendeurToDelete, setVendeurToDelete] = useState<Vendeur | null>(null);
  const [itemsToDelete, setItemsToDelete] = useState<string[] | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Statistiques
  const stats = useMemo(() => {
    const list = vendeurs || [];
    const online = list.filter(v => v.isOnline === true).length;
    const offline = list.filter(v => v.isOnline === false).length;
    const withHours = list.filter(v => v.openingTime && v.closingTime).length;

    return {
      total: list.length,
      online,
      offline,
      withHours,
    };
  }, [vendeurs]);

  // Filtrage
  const filteredVendeurs = useMemo(() => {
    let result = vendeurs || [];

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        (v) =>
          (v.username && v.username.toLowerCase().includes(searchLower)) ||
          (v.email && v.email.toLowerCase().includes(searchLower)) ||
          (v.whatsappNumber && v.whatsappNumber.includes(searchTerm)) ||
          (v.id && v.id.toLowerCase().includes(searchLower))
      );
    }

    if (selectedStatus) {
      if (selectedStatus === "ONLINE") {
        result = result.filter((v) => v.isOnline === true);
      } else if (selectedStatus === "OFFLINE") {
        result = result.filter((v) => v.isOnline === false);
      }
    }

    return result;
  }, [vendeurs, searchTerm, selectedStatus]);

  // Actions
  const handleDelete = async () => {
    if (!vendeurToDelete) return;
    setIsDeleting(true);
    try {
      const id = vendeurToDelete.id || vendeurToDelete._id || "";
      await deleteVendeur(id);
      setVendeurToDelete(null);
      alertSuccess("Vendeur supprimé avec succès");
      refresh();
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
        await deleteVendeur(id);
      }
      setItemsToDelete(null);
      alertSuccess(`${itemsToDelete.length} vendeurs supprimés`);
      refresh();
    } catch (error) {
      console.error(error);
      alertError("Erreur lors de la suppression multiple");
    } finally {
      setIsDeleting(false);
    }
  };

  const clearFilters = () => {
    setSelectedStatus("");
    setSearchTerm("");
  };

  const hasActiveFilters = selectedStatus || searchTerm;

  const getActionsMenu = (vendeur: Vendeur): Menu[] => {
    const actions: Menu[] = [];

    actions.push({
      label: "Voir le profil",
      icon: UserPlus,
      onClick: () => navigate(`/admin/vendeurs/${vendeur.id || vendeur._id}`),
    });

    actions.push({
      label: "Supprimer",
      icon: X,
      onClick: () => setVendeurToDelete(vendeur),
    });

    return actions;
  };

  return (
    <PageLitLayout title="Gestion des vendeurs">
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Vendeurs</h1>
              <p className="text-sm text-gray-500 mt-1">Gérez tous les vendeurs</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/admin/vendeurs/new")}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">Ajouter</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mt-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
              <p className="text-xs text-blue-700/70">Total</p>
              <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
              <p className="text-xs text-green-700/70">En ligne</p>
              <p className="text-2xl font-bold text-green-700">{stats.online}</p>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4">
              <p className="text-xs text-gray-700/70">Hors ligne</p>
              <p className="text-2xl font-bold text-gray-700">{stats.offline}</p>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4">
              <p className="text-xs text-indigo-700/70">Avec horaires</p>
              <p className="text-2xl font-bold text-indigo-700">{stats.withHours}</p>
            </div>
          </div>

          {/* Recherche */}
          <div className="relative mt-6">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un vendeur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Filtres */}
          <div className="mt-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                showFilters ? "bg-primary text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Filter size={18} /> Filtrer
              {hasActiveFilters && <span className="w-2 h-2 bg-red-500 rounded-full" />}
            </button>

            {showFilters && (
              <div className="bg-gray-50 rounded-xl p-4 mt-3 space-y-4">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">Tous</option>
                      <option value="ONLINE">En ligne</option>
                      <option value="OFFLINE">Hors ligne</option>
                    </select>
                  </div>
                </div>
              </div>
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
            {filteredVendeurs.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">Aucun vendeur trouvé</p>
              </div>
            )}
            <VendeursList
              vendeurs={filteredVendeurs}
              onAction={(vendeur) => setSelectedVendeur(vendeur)}
              onSelectVendeurs={(selected) => setItemsToDelete(selected.map((v) => v.id || v._id || ""))}
              selectable={false}
              selectActions={[
                {
                  label: "Supprimer",
                  onClick: (selected) => setItemsToDelete(selected.map((v) => v.id || v._id || "")),
                  className: "bg-red-600 text-white",
                },
              ]}
              onDelete={(id) => {
                const vendeur = vendeurs?.find(v => (v.id || v._id) === id);
                if (vendeur) setVendeurToDelete(vendeur);
              }}
            />
          </>
        )}
      </div>

      {/* Menu modal */}
      {selectedVendeur && (
        <MenuModal
          title={`Gérer ${selectedVendeur.username}`}
          isOpen={!!selectedVendeur}
          onClose={() => setSelectedVendeur(null)}
          icon={null}
          menu={getActionsMenu(selectedVendeur)}
        />
      )}

      {/* Modals suppression */}
      <DeleteConfirmationModal
        isOpen={!!vendeurToDelete}
        onClose={() => setVendeurToDelete(null)}
        onConfirm={handleDelete}
        title="Supprimer le vendeur"
        message={`Supprimer le vendeur "${vendeurToDelete?.username}" ?`}
        confirmText={isDeleting ? "Suppression..." : "Supprimer"}
      />

      <DeleteConfirmationModal
        isOpen={!!itemsToDelete && itemsToDelete.length > 0}
        onClose={() => setItemsToDelete(null)}
        onConfirm={handleDeleteMany}
        title="Suppression multiple"
        message={`Supprimer ${itemsToDelete?.length} vendeurs ?`}
      />
    </PageLitLayout>
  );
}