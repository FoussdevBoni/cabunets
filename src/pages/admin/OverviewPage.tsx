import { useState } from "react";
import { useAdminResource } from "../../hooks/affiliates/useAdminResource";
import { AdminOverview, PeriodFilter } from "../../types/AffiliateAdmin";
import { PeriodToolbar, ExportControls } from "../../components/layouts/AdminTools";
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
  const [period, setPeriod] = useState<PeriodFilter>({});
  const { data: metrics, loading: metricsLoading, error: metricsError } = useAdminResource<AdminOverview>("overview", period);
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
    affiliatesLoading || commissionsLoading || withdrawalsLoading || metricsLoading;

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

      <PeriodToolbar value={period} onChange={setPeriod} />
      <ExportControls filters={period} />
      {metricsError && <p role="alert" className="text-red-600">{metricsError}</p>}
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
            value={metrics?.activeAffiliates ?? activeAffiliates.length}
            hint={`${metrics?.totalAffiliates ?? totalAffiliates} affilié(s) au total`}
            icon={<Users size={20} />}
            variant="primary"
          />
          <StatCard
            label="Commissions en attente"
            value={metrics?.pendingCommissions ?? pendingCommissions.length}
            hint={`${metrics?.totalCommissions ?? totalCommissions} commission(s) au total`}
            icon={<Coins size={20} />}
            variant="warning"
          />
          <StatCard
            label="Retraits en attente"
            value={metrics?.pendingWithdrawals ?? pendingWithdrawals.length}
            hint={`${metrics?.totalWithdrawals ?? totalWithdrawals} retrait(s) au total`}
            icon={<Wallet size={20} />}
            variant="default"
          />
          <StatCard
            label="À traiter"
            value={(metrics?.pendingCommissions ?? 0) + (metrics?.pendingWithdrawals ?? 0)}
            hint="Commissions + retraits"
            icon={<ShieldAlert size={20} />}
            variant="danger"
          />
        </div>
      )}

      {metrics && <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Clients actifs sur la période" value={metrics.activeClients} hint="Au moins une commande livrée" icon={<Users size={20} />} />
        <StatCard label="Vendeurs actifs sur la période" value={metrics.activeSellers} hint="Au moins une vente livrée" icon={<Users size={20} />} />
        <StatCard label="Filleuls attribués (cumul)" value={metrics.referrals} hint={metrics.clients + " clients · " + metrics.sellers + " vendeurs"} icon={<Users size={20} />} />
        <StatCard label="Anomalies à examiner" value={metrics.openIssues} hint="Contrôle humain nécessaire" icon={<ShieldAlert size={20} />} />
      </div>}
      {metrics && <Card><h2 className="font-semibold mb-3">Activité commerciale attribuée sur la période</h2>
        {!metrics.revenue.length ? <p className="text-sm text-gray-500">Aucune commande livrée sur cette période.</p> : metrics.revenue.map(row =>
          <p key={row._id} className="text-sm">{new Intl.NumberFormat("fr-FR").format(row.amount)} {row._id} · {row.orders} commandes livrées</p>)}
        <h3 className="font-medium mt-4 mb-2">Commissions et paiements</h3>
        {metrics.commissions.map(row => <p className="text-sm" key={row._id.currency + row._id.status}>Commissions {row._id.status} : {new Intl.NumberFormat("fr-FR").format(row.amount)} {row._id.currency}</p>)}
        {metrics.withdrawals.filter(row => row._id.status === "payee").map(row => <p className="text-sm" key={row._id.currency}>Récompenses payées : {new Intl.NumberFormat("fr-FR").format(row.amount)} {row._id.currency}</p>)}
      </Card>}
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