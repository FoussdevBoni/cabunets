// src/pages/affiliate/MyBalancePage.tsx

import { Wallet, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardHeader, StatCard } from "../../components/ui/Card";

import { EmptyState } from "../../components/ui/EmptyState";
import { Pagination } from "../../components/ui/Pagination";
import { useMyBalance, useMyLedger } from "../../hooks/commissions/useCommissions";

export default function MyBalancePage() {
  const { balance, loading: balanceLoading } = useMyBalance();
  const { entries, total, page, limit, setPage, loading: ledgerLoading } =
    useMyLedger();

  const totalPages = Math.ceil(total / limit);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("fr-FR").format(amount) + " CDF";

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getEntryLabel = (type: string) => {
    switch (type) {
      case "commission_credit":
        return "Commission reçue";
      case "withdrawal_reserve":
        return "Réservation retrait";
      case "withdrawal_release":
        return "Retrait annulé";
      case "regularisation":
        return "Régularisation";
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mon solde</h1>
        <p className="text-sm text-gray-600 mt-1">
          Consultez vos gains et l'historique de vos mouvements
        </p>
      </div>

      {/* Stats */}
      {balanceLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <div className="animate-pulse space-y-2">
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-6 bg-gray-200 rounded w-2/3" />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="Solde disponible"
            value={formatCurrency(balance?.availableBalance ?? 0)}
            icon={<Wallet size={20} />}
            variant="success"
          />
          <StatCard
            label="Total crédité"
            value={formatCurrency(balance?.totalCredit ?? 0)}
            icon={<TrendingUp size={20} />}
            variant="primary"
          />
          <StatCard
            label="Total débité"
            value={formatCurrency(balance?.totalDebit ?? 0)}
            icon={<TrendingDown size={20} />}
            variant="warning"
          />
        </div>
      )}

      {/* Historique */}
      <Card>
        <CardHeader
          title="Historique des mouvements"
          description="Toutes les entrées et sorties de votre compte"
        />

        {ledgerLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex gap-3 py-2">
                <div className="w-9 h-9 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : entries.length === 0 ? (
          <EmptyState
            icon={<Wallet className="h-8 w-8 text-gray-400" />}
            title="Aucun mouvement"
            description="Vos mouvements apparaîtront ici"
          />
        ) : (
          <>
            <div className="divide-y divide-gray-100">
              {entries.map((entry) => {
                const isCredit = entry.signedAmount > 0;
                return (
                  <div
                    key={entry._id}
                    className="flex items-center justify-between py-3"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isCredit
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {isCredit ? (
                          <TrendingUp size={18} />
                        ) : (
                          <TrendingDown size={18} />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {getEntryLabel(entry.type)}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {entry.description}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatDate(entry.createdAt)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`font-semibold text-sm flex-shrink-0 ml-2 ${
                        isCredit ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      {isCredit ? "+" : ""}
                      {formatCurrency(entry.signedAmount)}
                    </span>
                  </div>
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
      </Card>
    </div>
  );
}