// pages/RetraitsPage.tsx
import { useState, useMemo } from "react";
import { Search, X, CheckCircle, XCircle, RefreshCw, Eye } from "lucide-react";
import PageLitLayout from "../../layouts/PageListLayout";
import DeleteConfirmationModal from "../../components/ui/DeleteConfirmationModal";
import MenuModal, { Menu } from "../../components/ui/MenuModal";
import useRetraits, { retraitsService } from "../../hooks/retraits/useRetraits";
import { alertSuccess, alertError, getErrorMessage } from "../../helpers/alertError";
import useToken from "../../hooks/auth/useToken";
import RetraitsList from "../../components/features/retraits/RetraitsList";
import { Retrait } from "../../types/Retrait";
import { useNavigate } from "react-router-dom";

export default function RetraitsPage() {
  const { token } = useToken();
  const { data: retraits, loading, refresh } = useRetraits({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedRetrait, setSelectedRetrait] = useState<Retrait | null>(null);
  const [retraitToDelete, setRetraitToDelete] = useState<Retrait | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate  = useNavigate()
  // Statistiques
  const stats = useMemo(() => {
    const list = retraits || [];
    return {
      total: list.length,
      pending: list.filter(r => r.status?.toUpperCase() === "PENDING").length,
      completed: list.filter(r => r.status?.toUpperCase() === "COMPLETED").length,
      rejected: list.filter(r => r.status?.toUpperCase() === "REJECTED").length,
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
          (r.vendeurId && r.vendeurId.toLowerCase().includes(searchLower)) ||
          (r.methodPayment?.intitule && r.methodPayment.intitule.toLowerCase().includes(searchLower)) ||
          (r.methodPayment?.number && r.methodPayment.number.includes(searchTerm))
      );
    }

    if (selectedStatus) {
      result = result.filter((r) => r.status?.toUpperCase() === selectedStatus.toUpperCase());
    }

    return result;
  }, [retraits, searchTerm, selectedStatus]);

  const handleValidate = async (retrait: Retrait) => {
    const id = retrait.id || retrait._id || "";
    setIsProcessing(true);
    try {
      const response = await retraitsService.validateRetrait(token, id);

      if (response.success) {
        alertSuccess("Retrait validé avec succès");
        await refresh();
        setSelectedRetrait(null);
      } else {
        alertError(response.message || "Erreur lors de la validation");
      }
    } catch (error: any) {
      alertError(getErrorMessage(error) || "Erreur lors de la validation");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (retrait: Retrait, reason: string) => {
    const id = retrait.id || retrait._id || "";
    setIsProcessing(true);
    try {
      const response = await retraitsService.rejectRetrait(token, id, reason);

      if (response.success) {
        alertSuccess("Retrait rejeté avec succès");
        await refresh();
        setSelectedRetrait(null);
      } else {
        alertError(response.message || "Erreur lors du rejet");
      }
    } catch (error: any) {
      alertError(getErrorMessage(error) || "Erreur lors du rejet");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResendCallback = async (retrait: Retrait) => {
    const payoutId = retrait.payoutId || retrait.id || retrait._id || "";

    if (!payoutId) {
      alertError("Aucun payoutId disponible pour ce retrait");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await retraitsService.resendPayoutCallback(token, payoutId);

      if (response.success) {
        alertSuccess("Callback renvoyé avec succès. Le statut sera mis à jour prochainement.");
        await refresh();
        setSelectedRetrait(null);
      } else {
        alertError(response.message || "Erreur lors du renvoi du callback");
      }
    } catch (error: any) {
      alertError(getErrorMessage(error) || "Erreur lors du renvoi du callback");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!retraitToDelete) return;
    setIsDeleting(true);
    try {
      const id = retraitToDelete.id || retraitToDelete._id || "";
      const response = await retraitsService.delete(id);

      if (response) {
        setRetraitToDelete(null);
        alertSuccess("Retrait supprimé");
        await refresh();
      } else {
        alertError("Erreur lors de la suppression");
      }
    } catch (error: any) {
      alertError(getErrorMessage(error) || "Erreur lors de la suppression");
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

    if (retrait.status?.toUpperCase() === "PENDING") {
      actions.push({
        label: "Valider",
        icon: CheckCircle,
        onClick: () => handleValidate(retrait),
        disabled: isProcessing,
      });
      actions.push({
        label: "Rejeter",
        icon: XCircle,
        onClick: () => {
          const reason = prompt("Motif du rejet :");
          if (reason) {
            handleReject(retrait, reason);
          }
        },
        disabled: isProcessing,
      });
    }

    if (retrait.payoutId && retrait.status?.toUpperCase() === "PENDING") {
      actions.push({
        label: "Renvoyer le callback",
        icon: RefreshCw,
        onClick: () => handleResendCallback(retrait),
        disabled: isProcessing,
      });
    }

      actions.push({
        label: "Voir les details",
        icon: Eye,
        onClick: () => {
          navigate(`/admin/retraits/details/${retrait._id || retrait.id}`)
        },
      });

  
    return actions;
  };

  return (
    <PageLitLayout title="Gestion des retraits">
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Retraits</h1>
              <p className="text-sm text-gray-500 mt-1">Gérez toutes les demandes de retrait</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
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
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4">
              <p className="text-xs text-red-700/70">Rejetés</p>
              <p className="text-2xl font-bold text-red-700">{stats.rejected}</p>
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
              </div>
            )}
            <RetraitsList
              retraits={filteredRetraits}
              onAction={(retrait) => setSelectedRetrait(retrait)}
            />
          </>
        )}
      </div>

      {/* Menu modal */}
      {selectedRetrait && (
        <MenuModal
          title={`Gérer le Retrait #${selectedRetrait.id || selectedRetrait._id}`}
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
        message={`Supprimer le retrait de "${retraitToDelete?.methodPayment?.intitule || 'vendeur'}" ?`}
        confirmText={isDeleting ? "Suppression..." : "Supprimer"}
      />
    </PageLitLayout>
  );
}