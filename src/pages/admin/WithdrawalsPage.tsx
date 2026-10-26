// src/pages/admin/WithdrawalsPage.tsx

import { withdrawalService } from "../../services/withdrawalService";
import { useState } from "react";
import {
  Banknote,
  CheckCircle,
  XCircle,
  DollarSign,
} from "lucide-react";
import { Card } from "../../components/ui/Card";
import { StatusBadge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { EmptyState } from "../../components/ui/EmptyState";
import { Pagination } from "../../components/ui/Pagination";
import BaseModal from "../../components/ui/Modal";
import {
  useAdminWithdrawals,
  useWithdrawalActions,
} from "../../hooks/reward-withdrawals/useWithdrawals";
import {
  RewardWithdrawalPopulated,
  RewardWithdrawalStatus,
} from "../../types/RewardWithdrawal";

const statusOptions: { value: RewardWithdrawalStatus | ""; label: string }[] = [
  { value: "", label: "Tous les statuts" },
  { value: "en_attente", label: "En attente" },
  { value: "approuvee", label: "Approuvée" },
  { value: "payee", label: "Payée" },
  { value: "rejetee", label: "Rejetée" },
];

const channelLabels: Record<string, string> = {
  airtel_money: "Airtel Money",
  vodacom_mpesa: "M-Pesa Vodacom",
  orange_money: "Orange Money",
  africell_money: "Africell Money",
  manuel: "Paiement manuel",
};

export default function WithdrawalsPage() {
  const [statusFilter, setStatusFilter] = useState<
    RewardWithdrawalStatus | undefined
  >();
  const { withdrawals, total, page, limit, setPage, loading, refetch } =
    useAdminWithdrawals({ status: statusFilter });
  const { approve, reject, markAsPaid, loading: actionLoading } =
    useWithdrawalActions();

  // Modal rejet
  const [rejectTarget, setRejectTarget] =
    useState<RewardWithdrawalPopulated | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Modal paiement
  const [payTarget, setPayTarget] =
    useState<RewardWithdrawalPopulated | null>(null);
  const [payReference, setPayReference] = useState("");
  const [payProof, setPayProof] = useState("");

  const totalPages = Math.ceil(total / limit);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("fr-FR").format(amount) + " CDF";

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const handleApprove = async (id: string) => {
    try {
      await approve(id);
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const openRejectModal = (w: RewardWithdrawalPopulated) => {
    setRejectTarget(w);
    setRejectReason("");
  };

  const handleConfirmReject = async () => {
    if (!rejectTarget || !rejectTarget._id) return;
    if (!rejectReason.trim()) return;
    try {
      await reject(rejectTarget._id, rejectReason.trim());
      setRejectTarget(null);
      setRejectReason("");
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const openPayModal = async (w: RewardWithdrawalPopulated) => {
    try {
      const detail = await withdrawalService.getById(w._id!);
      setPayTarget(detail);
    } catch { window.alert("Impossible de charger la destination de paiement."); return; }
    setPayReference("");
    setPayProof("");
  };

  const handleConfirmPay = async () => {
    if (!payTarget || !payTarget._id) return;
    if (!payReference.trim()) return;
    try {
      await markAsPaid(
        payTarget._id,
        payReference.trim(),
        payProof.trim() || undefined
      );
      setPayTarget(null);
      setPayReference("");
      setPayProof("");
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
          <h1 className="text-2xl font-bold text-gray-900">Retraits</h1>
          <p className="text-sm text-gray-600 mt-1">
            {total} demande{total > 1 ? "s" : ""} au total
          </p>
        </div>

        <select
          value={statusFilter ?? ""}
          onChange={(e) =>
            setStatusFilter(
              (e.target.value as RewardWithdrawalStatus) || undefined
            )
          }
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
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
      ) : withdrawals.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Banknote className="h-8 w-8 text-gray-400" />}
            title="Aucun retrait"
            description="Les demandes de retrait apparaîtront ici"
          />
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {withdrawals.map((w) => {
              const id = w._id;
              if (!id) return null;

              return (
                <Card key={id}>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(w.amount)}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {channelLabels[w.channel] ?? w.channel}
                        {" · "}
                        <span className="font-mono">
                          {w.maskedDestination}
                        </span>
                      </p>

                      <div className="mt-2 text-xs text-gray-600 space-y-0.5">
                        <p>
                          <span className="font-medium">Affilié :</span>{" "}
                          {w.affiliateId?.email ?? "—"}
                        </p>
                        {w.affiliateId?.codeParrainage && (
                          <p>
                            <span className="font-medium">Code :</span>{" "}
                            <span className="font-mono">
                              {w.affiliateId.codeParrainage}
                            </span>
                          </p>
                        )}
                        <p>
                          <span className="font-medium">Demandé le :</span>{" "}
                          {formatDate(w.createdAt)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <StatusBadge status={w.status} />
                      </div>

                      {w.reason && (
                        <p className="mt-1 text-xs text-red-600">
                          Motif : {w.reason}
                        </p>
                      )}

                      {w.externalReference && (
                        <p className="mt-1 text-xs text-gray-500">
                          Réf. : {w.externalReference}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 flex-shrink-0">
                      {w.status === "en_attente" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleApprove(id)}
                            loading={actionLoading}
                            icon={<CheckCircle size={16} />}
                          >
                            Approuver
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openRejectModal(w)}
                            disabled={actionLoading}
                            icon={<XCircle size={16} />}
                          >
                            Rejeter
                          </Button>
                        </>
                      )}

                      {w.status === "approuvee" && (
                        <Button
                          size="sm"
                          onClick={() => openPayModal(w)}
                          disabled={actionLoading}
                          icon={<DollarSign size={16} />}
                        >
                          Marquer payé
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

      {/* Modal rejet */}
      <BaseModal
        isOpen={!!rejectTarget}
        onClose={() => {
          setRejectTarget(null);
          setRejectReason("");
        }}
        title="Rejeter la demande"
        subtitle="Un motif est obligatoire"
        icon={<XCircle className="w-5 h-5 text-white" />}
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Vous êtes sur le point de rejeter la demande de{" "}
            <span className="font-medium text-gray-900">
              {rejectTarget ? formatCurrency(rejectTarget.amount) : ""}
            </span>
            . Le montant sera libéré dans le solde de l'affilié.
          </p>

          <Input
            label="Motif du rejet"
            placeholder="Ex: Numéro Mobile Money invalide..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setRejectTarget(null);
                setRejectReason("");
              }}
              fullWidth
            >
              Annuler
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmReject}
              loading={actionLoading}
              disabled={!rejectReason.trim()}
              fullWidth
            >
              Rejeter
            </Button>
          </div>
        </div>
      </BaseModal>

      {/* Modal paiement */}
      <BaseModal
        isOpen={!!payTarget}
        onClose={() => {
          setPayTarget(null);
          setPayReference("");
          setPayProof("");
        }}
        title="Marquer comme payé"
        subtitle="Renseignez la référence du paiement"
        icon={<DollarSign className="w-5 h-5 text-white" />}
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Vous êtes sur le point de marquer comme payée la demande de{" "}
            <span className="font-medium text-gray-900">
              {payTarget ? formatCurrency(payTarget.amount) : ""}
              <span className="block mt-2 font-mono">Destination : {payTarget?.destination ?? "À confirmer auprès de l’affilié (ancienne demande)"}</span>
            </span>
            .
          </p>

          <Input
            label="Référence du paiement"
            placeholder="Ex: MOMO-2026-10-26-ABC123"
            value={payReference}
            onChange={(e) => setPayReference(e.target.value)}
          />

          <Input
            label="Preuve de paiement (URL, optionnel)"
            placeholder="https://..."
            value={payProof}
            onChange={(e) => setPayProof(e.target.value)}
          />

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setPayTarget(null);
                setPayReference("");
                setPayProof("");
              }}
              fullWidth
            >
              Annuler
            </Button>
            <Button
              onClick={handleConfirmPay}
              loading={actionLoading}
              disabled={!payReference.trim()}
              fullWidth
            >
              Confirmer le paiement
            </Button>
          </div>
        </div>
      </BaseModal>
    </div>
  );
}