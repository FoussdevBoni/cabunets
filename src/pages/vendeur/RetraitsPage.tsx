// pages/vendeur/RetraitsPage.tsx
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, X, Eye, Edit } from "lucide-react";
import PageLitLayout from "../../layouts/PageListLayout";
import DeleteConfirmationModal from "../../components/ui/DeleteConfirmationModal";
import MenuModal, { Menu } from "../../components/ui/MenuModal";
import useRetraits from "../../hooks/retraits/useRetraits";
import { alertSuccess, alertError } from "../../helpers/alertError";
import useToken from "../../hooks/auth/useToken";
import RetraitsList from "../../components/features/retraits/RetraitsList";
import { Retrait } from "../../types/Retrait";
import { useAuth } from "../../hooks/auth/useAuth";

export default function VendeurRetraitsPage() {
  const navigate = useNavigate();
  const { token } = useToken();
  const { user } = useAuth();
  const { data: retraits, loading, refresh } = useRetraits({
    filters: { vendeurId: user?.id }
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedRetrait, setSelectedRetrait] = useState<Retrait | null>(null);
  const [retraitToDelete, setRetraitToDelete] = useState<Retrait | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Statistiques
  const stats = useMemo(() => {
    const list = retraits || [];
    return {
      total: list.length,
      pending: list.filter(r => r.status === "PENDING").length,
      completed: list.filter(r => r.status === "COMPLETED").length,
      rejected: list.filter(r => r.status === "REJECTED").length,
    };
  }, [retraits]);

  // Filtrage
  const filteredRetraits = useMemo(() => {
    let result = retraits || [];

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        (r) =>
          (r.id || r._id || "").toLowerCase().includes(searchLower) ||
          (r.methodPayment?.intitule && r.methodPayment.intitule.toLowerCase().includes(searchLower)) ||
          (r.methodPayment?.number && r.methodPayment.number.includes(searchTerm))
      );
    }

    if (selectedStatus) {
      result = result.filter((r) => r.status === selectedStatus);
    }

    return result;
  }, [retraits, searchTerm, selectedStatus]);

  const handleDelete = async () => {
    if (!retraitToDelete) return;
    setIsDeleting(true);
    try {
      const id = retraitToDelete.id || retraitToDelete._id || "";
      const response = await fetch(`/api/retraits/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        setRetraitToDelete(null);
        alertSuccess("Retrait supprimé");
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

  const clearFilters = () => {
    setSelectedStatus("");
    setSearchTerm("");
  };

  const hasActiveFilters = selectedStatus || searchTerm;



  const getActionsMenu = (retrait: Retrait): Menu[] => {
    const actions: Menu[] = [];

    if (retrait.status === "PENDING") {
      actions.push({
        label: "Annuler la demande",
        icon: X,
        onClick: () => {
          // TODO: Appeler l'API pour annuler
        },
      });
      actions.push({
        label: "Modifier la demande",
        icon: Edit,
        onClick: () => navigate(`/vendeur/modifier-retrait/${retrait.id}`),
      });
    }



    if (retrait.status === "PENDING") {
      actions.push({
        label: "Supprimer",
        icon: X,
        onClick: () => setRetraitToDelete(retrait),
      });
    }

    return actions;
  };

  return (
    <PageLitLayout  title="">
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mes retraits</h1>
              <p className="text-sm text-gray-500 mt-1">Gérez vos demandes de retrait</p>
            </div>
            <button
              onClick={() => navigate("/vendeur/nouveau-retrait")}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition"
            >
              <Plus size={18} />
              <span>Nouveau retrait</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
              <p className="text-xs text-blue-700/70">Total</p>
              <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4">
              <p className="text-xs text-yellow-700/70">En attente</p>
              <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
              <p className="text-xs text-green-700/70">Validés</p>
              <p className="text-2xl font-bold text-green-700">{stats.completed}</p>
            </div>
          </div>

          {/* Recherche */}
          <div className="relative mt-6">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un retrait..."
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
                  <option value="COMPLETED">Validé</option>
                  <option value="REJECTED">Rejeté</option>
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
            {filteredRetraits.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">Aucun retrait trouvé</p>
                <button
                  onClick={() => navigate("/vendeur/nouveau-retrait")}
                  className="mt-4 text-primary hover:underline"
                >
                  Faire votre première demande de retrait
                </button>
              </div>
            )}
            <RetraitsList
              retraits={filteredRetraits}
              onAction={(retrait) => setSelectedRetrait(retrait)}
              selectable={false}
            />
          </>
        )}
      </div>

      {/* Menu modal */}
      {selectedRetrait && getActionsMenu(selectedRetrait).length > 0 && (
        <MenuModal
          title={`Gérer le Retrait`}
          isOpen={!!selectedRetrait}
          onClose={() => setSelectedRetrait(null)}
          icon={null}
          menu={getActionsMenu(selectedRetrait)}
        />
      )}

      {/* Modal suppression */}
      <DeleteConfirmationModal
        isOpen={!!retraitToDelete}
        onClose={() => setRetraitToDelete(null)}
        onConfirm={handleDelete}
        title="Supprimer le retrait"
        message={`Supprimer la demande de retrait de "${retraitToDelete?.methodPayment?.intitule || 'vendeur'}" ?`}
        confirmText={isDeleting ? "Suppression..." : "Supprimer"}
      />
    </PageLitLayout>
  );
}