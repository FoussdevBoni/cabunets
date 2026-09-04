// pages/client/ReclamationsPage.tsx
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, X, Eye, FileText } from "lucide-react";
import PageLitLayout from "../../layouts/PageListLayout";
import DeleteConfirmationModal from "../../components/ui/DeleteConfirmationModal";
import MenuModal, { Menu } from "../../components/ui/MenuModal";
import useReclamations from "../../hooks/reclamations/useReclamations";
import { alertSuccess, alertError } from "../../helpers/alertError";
import ReclamationsList from "../../components/features/reclamations/ReclamationsList";
import { useAuth } from "../../hooks/auth/useAuth";
import { Reclamation } from "../../types/Reclamation";

export default function UserReclamationsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: reclamations, loading, refresh, deleteItem: deleteReclamation } = useReclamations({
    filters: { userId: user?.id }
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatut, setSelectedStatut] = useState<string>("");
  const [selectedReclamation, setSelectedReclamation] = useState<Reclamation | null>(null);
  const [reclamationToDelete, setReclamationToDelete] = useState<Reclamation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Statistiques
  const stats = useMemo(() => {
    const list = reclamations || [];
    return {
      total: list.length,
      brouillon: list.filter(r => r.statut === "brouillon").length,
      soumise: list.filter(r => r.statut === "soumise").length,
      en_cours: list.filter(r => r.statut === "en_cours").length,
      resolue: list.filter(r => r.statut === "resolue").length,
      rejetee: list.filter(r => r.statut === "rejetee").length,
    };
  }, [reclamations]);

  // Filtrage
  const filteredReclamations = useMemo(() => {
    let result = reclamations || [];

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        (r) =>
          (r.id || r._id || "").toLowerCase().includes(searchLower) ||
          (r.objet && r.objet.toLowerCase().includes(searchLower)) ||
          (r.reference && r.reference.toLowerCase().includes(searchLower))
      );
    }

    if (selectedStatut) {
      result = result.filter((r) => r.statut === selectedStatut);
    }

    return result;
  }, [reclamations, searchTerm, selectedStatut]);

  const handleDelete = async () => {
    if (!reclamationToDelete) return;
    setIsDeleting(true);
    try {
      const id = reclamationToDelete.id || reclamationToDelete._id || "";
      await deleteReclamation(id);
      setReclamationToDelete(null);
      alertSuccess("Réclamation supprimée");
      if (typeof refresh === "function") {
        await refresh();
      }
    } catch (error) {
      console.error(error);
      alertError("Erreur lors de la suppression");
    } finally {
      setIsDeleting(false);
    }
  };

  const clearFilters = () => {
    setSelectedStatut("");
    setSearchTerm("");
  };

  const hasActiveFilters = selectedStatut || searchTerm;

  const getActionsMenu = (reclamation: Reclamation): Menu[] => {
    const actions: Menu[] = [];

    if (reclamation.statut === "soumise") {
      actions.push({
        label: "Modifier",
        icon: Eye,
        onClick: () => navigate(`/${user?.role}/reclamations/${reclamation.id}/update`),
      });
     
    }

    if (reclamation.statut === "brouillon" || reclamation.statut === "soumise") {
      actions.push({
        label: "Supprimer",
        icon: X,
        onClick: () => setReclamationToDelete(reclamation),
      });
    }

    if (reclamation.statut === "en_cours" || reclamation.statut === "resolue" || reclamation.statut === "rejetee") {
      actions.push({
        label: "Voir détails",
        icon: Eye,
        onClick: () => navigate(`/${user?.role}/reclamations/${reclamation.id}`),
      });
    }

    return actions;
  };

  return (
    <PageLitLayout title="">
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mes réclamations</h1>
              <p className="text-sm text-gray-500 mt-1">Gérez toutes vos réclamations</p>
            </div>
            <button
              onClick={() => navigate(`/${user?.role}/reclamations/new`)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition"
            >
              <Plus size={18} />
              <span>Nouvelle réclamation</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 mt-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
              <p className="text-xs text-blue-700/70">Total</p>
              <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4">
              <p className="text-xs text-gray-700/70">Brouillon</p>
              <p className="text-2xl font-bold text-gray-700">{stats.brouillon}</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4">
              <p className="text-xs text-yellow-700/70">Soumise</p>
              <p className="text-2xl font-bold text-yellow-700">{stats.soumise}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
              <p className="text-xs text-blue-700/70">En cours</p>
              <p className="text-2xl font-bold text-blue-700">{stats.en_cours}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
              <p className="text-xs text-green-700/70">Résolue</p>
              <p className="text-2xl font-bold text-green-700">{stats.resolue}</p>
            </div>
          </div>

          {/* Recherche */}
          <div className="relative mt-6">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une réclamation..."
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
                  value={selectedStatut}
                  onChange={(e) => setSelectedStatut(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Tous</option>
                  <option value="brouillon">Brouillon</option>
                  <option value="soumise">Soumise</option>
                  <option value="en_cours">En cours</option>
                  <option value="resolue">Résolue</option>
                  <option value="rejetee">Rejetée</option>
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
            {filteredReclamations.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">Aucune réclamation trouvée</p>
                <button
                  onClick={() => navigate("/client/reclamations/new")}
                  className="mt-4 text-primary hover:underline"
                >
                  Créer votre première réclamation
                </button>
              </div>
            )}
            <ReclamationsList
              reclamations={filteredReclamations}
              onAction={(reclamation) => setSelectedReclamation(reclamation)}
              selectable={false}
            />
          </>
        )}
      </div>

      {/* Menu modal */}
      {selectedReclamation && (
        <MenuModal
          title={`Gérer la Réclamation`}
          isOpen={!!selectedReclamation}
          onClose={() => setSelectedReclamation(null)}
          icon={null}
          menu={getActionsMenu(selectedReclamation)}
        />
      )}

      {/* Modal suppression */}
      <DeleteConfirmationModal
        isOpen={!!reclamationToDelete}
        onClose={() => setReclamationToDelete(null)}
        onConfirm={handleDelete}
        title="Supprimer la réclamation"
        message={`Supprimer la réclamation "${reclamationToDelete?.objet}" ?`}
        confirmText={isDeleting ? "Suppression..." : "Supprimer"}
      />
    </PageLitLayout>
  );
}