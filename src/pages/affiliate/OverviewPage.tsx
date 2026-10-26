// src/pages/affiliate/OverviewPage.tsx

import { Users, Coins, Wallet, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { StatCard, Card, CardHeader } from "../../components/ui/Card";
import { StatusBadge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { SkeletonCard, SkeletonTable } from "../../components/ui/Skeleton";
import { useMyReferralStats } from "../../hooks/referrals/useReferrals";
import { useMyBalance, useMyCommissions } from "../../hooks/commissions/useCommissions";

export default function OverviewPage() {
  const { stats, loading: statsLoading } = useMyReferralStats();
  const { balance, loading: balanceLoading } = useMyBalance();
  const { commissions, loading: commissionsLoading } = useMyCommissions();

  const loading = statsLoading || balanceLoading;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("fr-FR").format(amount) + " CDF";

  const latestCommissions = (commissions ?? []).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-sm text-gray-600 mt-1">
          Vue d'ensemble de votre activité d'affiliation
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
            label="Solde disponible"
            value={formatCurrency(balance?.availableBalance ?? 0)}
            hint={`Total gagné : ${formatCurrency(balance?.totalCredit ?? 0)}`}
            icon={<Wallet size={20} />}
            variant="success"
          />
          <StatCard
            label="Mes filleuls"
            value={stats?.total ?? 0}
            hint={`${stats?.clients ?? 0} clients · ${stats?.vendeurs ?? 0} vendeurs`}
            icon={<Users size={20} />}
            variant="primary"
          />
          <StatCard
            label="Commissions"
            value={commissions?.length ?? 0}
            hint="Total reçues"
            icon={<Coins size={20} />}
            variant="default"
          />
          <StatCard
            label="En attente"
            value={formatCurrency(
              balance?.pendingBalance ?? 0
            )}
            hint="Sera disponible bientôt"
            icon={<TrendingUp size={20} />}
            variant="warning"
          />
        </div>
      )}

      {/* Actions rapides */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/affiliate/my-link"
          className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="text-primary" size={20} />
            </div>
            <span className="text-gray-400 group-hover:text-primary transition">
              →
            </span>
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">
            Partager mon lien
          </h3>
          <p className="text-sm text-gray-600">
            Invitez vos amis à rejoindre Cabunets
          </p>
        </Link>

        <Link
          to="/affiliate/my-referrals"
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
          <h3 className="font-semibold text-gray-900 mb-1">Mes filleuls</h3>
          <p className="text-sm text-gray-600">Consultez votre réseau</p>
        </Link>

        <Link
          to="/affiliate/my-balance"
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
          <h3 className="font-semibold text-gray-900 mb-1">Mon solde</h3>
          <p className="text-sm text-gray-600">Demandez un retrait</p>
        </Link>
      </div>

      {/* Dernières commissions */}
      <Card>
        <CardHeader
          title="Dernières commissions"
          description="Vos 5 dernières commissions"
          action={
            <Link to="/affiliate/my-commissions">
              <Button variant="ghost" size="sm">
                Voir tout
              </Button>
            </Link>
          }
        />

        {commissionsLoading ? (
          <SkeletonTable rows={3} />
        ) : latestCommissions.length === 0 ? (
          <EmptyState
            title="Aucune commission"
            description="Partagez votre lien pour gagner vos premières commissions"
            action={
              <Link to="/affiliate/my-link">
                <Button size="sm">Partager mon lien</Button>
              </Link>
            }
          />
        ) : (
          <div className="divide-y divide-gray-100">
            {latestCommissions.map((commission) => (
              <div
                key={commission._id}
                className="flex items-center justify-between py-3"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {formatCurrency(commission.amount)}
                  </p>
                  <p className="text-xs text-gray-500">{commission.program}</p>
                </div>
                <StatusBadge status={commission.status} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}