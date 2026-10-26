// src/pages/affiliate/MyCommissionsPage.tsx

import { useState } from "react";
import { Coins } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { StatusBadge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/EmptyState";
import { Pagination } from "../../components/ui/Pagination";
import { useMyCommissions } from "../../hooks/commissions/useCommissions";
import { CommissionStatus } from "../../types/Commission";

const statusOptions: { value: CommissionStatus | ""; label: string }[] = [
  { value: "", label: "Tous les statuts" },
  { value: "en_attente", label: "En attente" },
  { value: "disponible", label: "Disponible" },
  { value: "reservee", label: "Réservée" },
  { value: "payee", label: "Payée" },
  { value: "annulee", label: "Annulée" },
];

export default function MyCommissionsPage() {
  const [statusFilter, setStatusFilter] = useState<CommissionStatus | undefined>();
  const { commissions, total, page, limit, setPage, loading } =
    useMyCommissions({ status: statusFilter });

  const totalPages = Math.ceil(total / limit);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("fr-FR").format(amount) + " CDF";

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mes commissions</h1>
          <p className="text-sm text-gray-600 mt-1">
            {total} commission{total > 1 ? "s" : ""} au total
          </p>
        </div>

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
      </div>

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
            description="Vos commissions apparaîtront ici dès qu'un filleul passera une commande"
          />
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {commissions.map((c) => (
              <Card key={c._id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(c.amount)}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{c.program}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <StatusBadge status={c.status} />
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                      <span>{formatDate(c.createdAt)}</span>
                      {c.availableAt && c.status === "en_attente" && (
                        <>
                          <span>·</span>
                          <span>Disponible le {formatDate(c.availableAt)}</span>
                        </>
                      )}
                    </div>
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
    </div>
  );
}