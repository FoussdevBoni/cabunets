// src/pages/admin/OverviewPage.tsx

import { Users, Coins, Wallet, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { StatCard, Card, CardHeader } from "../../components/ui/Card";
import { StatusBadge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { SkeletonCard, SkeletonTable } from "../../components/ui/Skeleton";
import { useAffiliates } from "../../hooks/affiliates/useAffiliates";
import { useAdminCommissions } from "../../hooks/commissions/useCommissions";
import { useAdminWithdrawals } from "../../hooks/reward-withdrawals/useWithdrawals";

export default function OverviewPage() {
  const { affiliates, total: totalAffiliates, loading: affiliatesLoading } =
    useAffiliates();
  const {
    commissions,
    total: totalCommissions,
    loading: commissionsLoading,
  } = useAdminCommissions();
  const {
    withdrawals,
    total: totalWithdrawals,
    loading: withdrawalsLoading,
  } = useAdminWithdrawals();

  const loading =
    affiliatesLoading || commissionsLoading || withdrawalsLoading;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("fr-FR").format(amount) + " CDF";



  const pendingCommissions = commissions.filter(
    (c) => c.status === "en_attente"
  );
  const pendingWithdrawals = withdrawals.filter(
    (w) => w.status === "en_attente"
  );
  const activeAffiliates = affiliates.filter(
    (a) => a.statut === "actif"
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Vue globale</h1>
        <p className="text-sm text-gray-600 mt-1">
          Vue d'ensemble de CabuAffili
        </p>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Affiliés actifs"
            value={activeAffiliates.length}
            hint={`${totalAffiliates} affilié(s) au total`}
            icon={<Users size={20} />}
            variant="primary"
          />
          <StatCard
            label="Commissions en attente"
            value={pendingCommissions.length}
            hint={`${totalCommissions} commission(s) au total`}
            icon={<Coins size={20} />}
            variant="warning"
          />
          <StatCard
            label="Retraits en attente"
            value={pendingWithdrawals.length}
            hint={`${totalWithdrawals} retrait(s) au total`}
            icon={<Wallet size={20} />}
            variant="default"
          />
          <StatCard
            label="À traiter"
            value={pendingCommissions.length + pendingWithdrawals.length}
            hint="Commissions + retraits"
            icon={<ShieldAlert size={20} />}
            variant="danger"
          />
        </div>
      )}

      {/* Actions rapides */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/admin/affiliates"
          className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="text-primary" size={20} />
            </div>
            <span className="text-gray-400 group-hover:text-primary transition">
              →
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Affiliés</h3>
          <p className="text-sm text-gray-600">Gérer les affiliés</p>
        </Link>

        <Link
          to="/admin/commissions"
          className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Coins className="text-primary" size={20} />
            </div>
            <span className="text-gray-400 group-hover:text-primary transition">
              →
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Commissions</h3>
          <p className="text-sm text-gray-600">Valider / annuler</p>
        </Link>

        <Link
          to="/admin/withdrawals"
          className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Wallet className="text-primary" size={20} />
            </div>
            <span className="text-gray-400 group-hover:text-primary transition">
              →
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Retraits</h3>
          <p className="text-sm text-gray-600">Traiter les demandes</p>
        </Link>
      </div>

      {/* Dernières commissions en attente */}
      <Card>
        <CardHeader
          title="Commissions en attente"
          description="À valider"
          action={
            <Link to="/admin/commissions">
              <Button variant="ghost" size="sm">
                Voir tout
              </Button>
            </Link>
          }
        />

        {commissionsLoading ? (
          <SkeletonTable rows={3} />
        ) : pendingCommissions.length === 0 ? (
          <EmptyState
            title="Aucune commission en attente"
            description="Tout est à jour"
          />
        ) : (
          <div className="divide-y divide-gray-100">
            {pendingCommissions.slice(0, 5).map((c) => (
              <div
                key={c._id}
                className="flex items-center justify-between py-3"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {formatCurrency(c.amount)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {c.affiliateId?.email || c.program}
                  </p>
                </div>
                <StatusBadge status={c.status} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}