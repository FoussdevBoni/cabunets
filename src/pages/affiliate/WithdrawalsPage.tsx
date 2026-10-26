// src/pages/affiliate/WithdrawalsPage.tsx

import { useState } from "react";
import { Banknote, Plus, Wallet } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { StatusBadge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { EmptyState } from "../../components/ui/EmptyState";
import { Pagination } from "../../components/ui/Pagination";
import BaseModal from "../../components/ui/Modal";
import {
  useMyWithdrawals,
  useWithdrawalActions,
} from "../../hooks/reward-withdrawals/useWithdrawals";
import { useMyBalance } from "../../hooks/commissions/useCommissions";
import {
  RewardWithdrawalChannel,
  RewardWithdrawalStatus,
} from "../../types/RewardWithdrawal";

const channelOptions = [
  { value: "airtel_money", label: "Airtel Money" },
  { value: "vodacom_mpesa", label: "M-Pesa Vodacom" },
  { value: "orange_money", label: "Orange Money" },
  { value: "africell_money", label: "Africell Money" },
  { value: "manuel", label: "Paiement manuel" },
];

const statusOptions: { value: RewardWithdrawalStatus | ""; label: string }[] = [
  { value: "", label: "Tous les statuts" },
  { value: "en_attente", label: "En attente" },
  { value: "approuvee", label: "Approuvée" },
  { value: "payee", label: "Payée" },
  { value: "rejetee", label: "Rejetée" },
];



export default function WithdrawalsPage() {
  const [statusFilter, setStatusFilter] = useState<
    RewardWithdrawalStatus | undefined
  >();
  const { withdrawals, total, page, limit, setPage, loading, refetch } = useMyWithdrawals(
    { status: statusFilter }
  );
  const { balance, refetch: refreshBalance } = useMyBalance();
  const minimumWithdrawal = balance?.minimumWithdrawalAmount ?? 5000;
  const { create, loading: creating } = useWithdrawalActions();

  const [showModal, setShowModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [channel, setChannel] =
    useState<RewardWithdrawalChannel>("airtel_money");
  const [destination, setDestination] = useState("");
  const [formError, setFormError] = useState("");

  const totalPages = Math.ceil(total / limit);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("fr-FR").format(value) + " CDF";

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const resetForm = () => {
    setAmount("");
    setChannel("airtel_money");
    setDestination("");
    setFormError("");
  };

  const handleSubmit = async () => {
    setFormError("");

    const numAmount = Number(amount);
    if (!numAmount || numAmount < minimumWithdrawal) {
      setFormError(
        `Le montant minimum est de ${formatCurrency(minimumWithdrawal)}`
      );
      return;
    }

    if (numAmount > (balance?.availableBalance ?? 0)) {
      setFormError("Solde insuffisant");
      return;
    }

    if (!destination.trim()) {
      setFormError("Veuillez renseigner la destination");
      return;
    }

    try {
      await create({
        amount: numAmount,
        channel,
        destination: destination.trim(),
      });
      await Promise.all([refetch(), refreshBalance()]);
      setShowModal(false);
      resetForm();
    } catch (err: any) {
      setFormError(err?.response?.data?.message ?? err?.message ?? "Erreur lors de la demande");
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

        <Button
          onClick={() => setShowModal(true)}
          icon={<Plus size={18} />}
          disabled={(balance?.availableBalance ?? 0) < minimumWithdrawal}
        >
          Demander un retrait
        </Button>
      </div>

      {/* Solde disponible */}
      <Card>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Wallet className="text-green-700" size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Solde disponible</p>
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(balance?.availableBalance ?? 0)}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Minimum : {formatCurrency(minimumWithdrawal)}
          </p>
        </div>
      </Card>

      {/* Filtre */}
      <div className="flex justify-end">
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
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
              </div>
            </Card>
          ))}
        </div>
      ) : withdrawals.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Banknote className="h-8 w-8 text-gray-400" />}
            title="Aucun retrait"
            description="Vos demandes de retrait apparaîtront ici"
          />
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {withdrawals.map((w) => (
              <Card key={w._id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(w.amount)}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {channelOptions.find((c) => c.value === w.channel)
                        ?.label ?? w.channel}
                      {" · "}
                      <span className="font-mono">{w.maskedDestination}</span>
                    </p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <StatusBadge status={w.status} />
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Demandé le {formatDate(w.createdAt)}
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
                </div>
              </Card>
            ))}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            onPageChange={setPage}
          />
        </>
      )}

      {/* Modale de demande */}
      <BaseModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title="Demander un retrait"
        subtitle="Retirez vos gains vers Mobile Money"
        icon={<Banknote className="w-5 h-5 text-white" />}
        size="md"
      >
        <div className="space-y-4">
          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {formError}
            </div>
          )}

          <Input
            label="Montant (CDF)"
            type="number"
            placeholder="5000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            helper={`Minimum : ${formatCurrency(
              minimumWithdrawal
            )} · Disponible : ${formatCurrency(
              balance?.availableBalance ?? 0
            )}`}
          />

          <Select
            label="Canal"
            options={channelOptions}
            value={channel}
            onChange={(e) =>
              setChannel(e.target.value as RewardWithdrawalChannel)
            }
          />

          <Input
            label="Destination"
            placeholder={
              channel === "manuel" ? "Nom et coordonnées" : "+243 XXX XXX XXX"
            }
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            helper={
              channel === "manuel"
                ? "Précisez le nom et les coordonnées de la personne"
                : "Numéro Mobile Money qui recevra le paiement"
            }
          />

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
              fullWidth
            >
              Annuler
            </Button>
            <Button onClick={handleSubmit} loading={creating} fullWidth>
              Confirmer
            </Button>
          </div>
        </div>
      </BaseModal>
    </div>
  );
}