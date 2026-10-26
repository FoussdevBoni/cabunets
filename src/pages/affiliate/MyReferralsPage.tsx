// src/pages/affiliate/MyReferralsPage.tsx

import { useState } from "react";
import { Users } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/EmptyState";
import { Pagination } from "../../components/ui/Pagination";
import { useMyReferrals } from "../../hooks/referrals/useReferrals";
import { ReferralType } from "../../types/Referral";

export default function MyReferralsPage() {
  const [typeFilter, setTypeFilter] = useState<ReferralType | undefined>();
  const { referrals, total, page, limit, setPage, loading } =
    useMyReferrals({ type: typeFilter });

  const totalPages = Math.ceil(total / limit);

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
          <h1 className="text-2xl font-bold text-gray-900">Mes filleuls</h1>
          <p className="text-sm text-gray-600 mt-1">
            {total} filleul{total > 1 ? "s" : ""} au total
          </p>
        </div>

        <select
          value={typeFilter ?? ""}
          onChange={(e) =>
            setTypeFilter((e.target.value as ReferralType) || undefined)
          }
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          <option value="">Tous les types</option>
          <option value="client">Clients</option>
          <option value="vendeur">Vendeurs</option>
        </select>
      </div>

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
      ) : referrals.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Users className="h-8 w-8 text-gray-400" />}
            title="Aucun filleul"
            description="Partagez votre lien pour commencer à parrainer"
          />
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {referrals.map((r) => (
              <Card key={r._id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {r.filleul.username || r.filleul.email}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {r.filleul.email}
                    </p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge variant={r.type === "vendeur" ? "primary" : "info"}>
                        {r.type === "vendeur" ? "Vendeur" : "Client"}
                      </Badge>
                      <Badge
                        variant={r.filleul.isVerified ? "success" : "warning"}
                      >
                        {r.filleul.isVerified ? "Vérifié" : "Non vérifié"}
                      </Badge>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                      <span className="font-mono">{r.codeUtilise}</span>
                      <span>·</span>
                      <span>{formatDate(r.attributedAt)}</span>
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