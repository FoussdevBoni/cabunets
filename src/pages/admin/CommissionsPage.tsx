// src/pages/admin/CommissionsPage.tsx

import { useState } from "react";
import { Coins, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { StatusBadge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { EmptyState } from "../../components/ui/EmptyState";
import { Pagination } from "../../components/ui/Pagination";
import BaseModal from "../../components/ui/Modal";
import {
  useAdminCommissions,
  useCommissionActions,
} from "../../hooks/commissions/useCommissions";
import {
  CommissionPopulated,
  CommissionStatus,
} from "../../types/Commission";

const statusOptions: { value: CommissionStatus | ""; label: string }[] = [
  { value: "", label: "Tous les statuts" },
  { value: "detectee", label: "Détectée" },
  { value: "en_attente", label: "En attente" },
  { value: "disponible", label: "Disponible" },
  { value: "reservee", label: "Réservée" },
  { value: "payee", label: "Payée" },
  { value: "rejetee", label: "Rejetée" },
  { value: "annulee", label: "Annulée" },
];

export default function CommissionsPage() {
  const [statusFilter, setStatusFilter] = useState<CommissionStatus | undefined>();
  const { commissions, total, page, limit, setPage, loading, refetch } =
    useAdminCommissions({ status: statusFilter });
  const { validate, cancel, processDue, loading: actionLoading } =
    useCommissionActions();

  // Modal d'annulation
  const [cancelTarget, setCancelTarget] = useState<CommissionPopulated | null>(
    null
  );
  const [cancelReason, setCancelReason] = useState("");

  const totalPages = Math.ceil(total / limit);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("fr-FR").format(amount) + " CDF";

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const handleValidate = async (id: string) => {
    try {
      await validate(id);
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const openCancelModal = (commission: CommissionPopulated) => {
    setCancelTarget(commission);
    setCancelReason("");
  };

  const handleConfirmCancel = async () => {
    if (!cancelTarget || !cancelTarget._id) return;
    if (!cancelReason.trim()) return;
    try {
      await cancel(cancelTarget._id, cancelReason.trim());
      setCancelTarget(null);
      setCancelReason("");
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const handleProcessDue = async () => {
    try {
      await processDue();
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Commissions</h1>
          <p className="text-sm text-gray-600 mt-1">
            {total} commission{total > 1 ? "s" : ""} au total
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <select
            value={statusFilter ?? ""}
            onChange={(e) =>
              setStatusFilter((e.target.value as CommissionStatus) || undefined)
            }
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={handleProcessDue}
            loading={actionLoading}
            icon={<RefreshCw size={16} />}
          >
            Traiter les échéances
          </Button>
        </div>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </Card>
          ))}
        </div>
      ) : commissions.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Coins className="h-8 w-8 text-gray-400" />}
            title="Aucune commission"
            description="Les commissions apparaîtront ici"
          />
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {commissions.map((c) => {
              const id = c._id;
              if (!id) return null;

              const canValidate =
                c.status === "en_attente" || c.status === "detectee";
              const canCancel =
                c.status !== "payee" && c.status !== "annulee";

              return (
                <Card key={id}>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(c.amount)}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {c.program}
                      </p>

                      <div className="mt-2 text-xs text-gray-600 space-y-0.5">
                        <p>
                          <span className="font-medium">Affilié :</span>{" "}
                          {c.affiliateId?.email ?? "—"}
                        </p>
                        {c.affiliateId?.codeParrainage && (
                          <p>
                            <span className="font-medium">Code :</span>{" "}
                            <span className="font-mono">
                              {c.affiliateId.codeParrainage}
                            </span>
                          </p>
                        )}
                        <p>
                          <span className="font-medium">Événement :</span>{" "}
                          <span className="font-mono">{c.eventId}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <StatusBadge status={c.status} />
                        {c.availableAt && c.status === "en_attente" && (
                          <span className="text-xs text-gray-500">
                            Disponible le {formatDate(c.availableAt)}
                          </span>
                        )}
                      </div>

                      {c.reason && (
                        <p className="mt-1 text-xs text-red-600">
                          Motif : {c.reason}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 flex-shrink-0">
                      {canValidate && (
                        <Button
                          size="sm"
                          onClick={() => handleValidate(id)}
                          loading={actionLoading}
                          icon={<CheckCircle size={16} />}
                        >
                          Valider
                        </Button>
                      )}

                      {canCancel && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openCancelModal(c)}
                          disabled={actionLoading}
                          icon={<XCircle size={16} />}
                        >
                          Annuler
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            onPageChange={setPage}
          />
        </>
      )}

      {/* Modal d'annulation */}
      <BaseModal
        isOpen={!!cancelTarget}
        onClose={() => {
          setCancelTarget(null);
          setCancelReason("");
        }}
        title="Annuler la commission"
        subtitle="Un motif est obligatoire"
        icon={<XCircle className="w-5 h-5 text-white" />}
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Vous êtes sur le point d'annuler une commission de{" "}
            <span className="font-medium text-gray-900">
              {cancelTarget ? formatCurrency(cancelTarget.amount) : ""}
            </span>
            . Une écriture de régularisation sera créée dans le ledger.
          </p>

          <Input
            label="Motif de l'annulation"
            placeholder="Ex: Commande remboursée, fraude..."
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setCancelTarget(null);
                setCancelReason("");
              }}
              fullWidth
            >
              Annuler
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmCancel}
              loading={actionLoading}
              disabled={!cancelReason.trim()}
              fullWidth
            >
              Confirmer l'annulation
            </Button>
          </div>
        </div>
      </BaseModal>
    </div>
  );
}