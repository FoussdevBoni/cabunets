import { affiliateService } from "../../services/affiliateService";
// src/pages/admin/AffiliatesPage.tsx

import { useState } from "react";
import { Users, CheckCircle, XCircle, ShieldOff } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Badge, StatusBadge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { EmptyState } from "../../components/ui/EmptyState";
import { Pagination } from "../../components/ui/Pagination";
import BaseModal from "../../components/ui/Modal";
import {
  useAffiliates,
  useAffiliateActions,
} from "../../hooks/affiliates/useAffiliates";
import { AffiliateStatus, AffiliateWithUser } from "../../types/Affiliate";

const statusOptions: { value: AffiliateStatus | ""; label: string }[] = [
  { value: "", label: "Tous les statuts" },
  { value: "en_attente", label: "En attente" },
  { value: "actif", label: "Actif" },
  { value: "suspendu", label: "Suspendu" },
];

export default function AffiliatesPage() {
  const [verificationError, setVerificationError] = useState("");
  const [verifying, setVerifying] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<AffiliateStatus | undefined>();
  const { affiliates, total, page, limit, setPage, loading, refetch } =
    useAffiliates();
  const { activate, suspend, reactivate, loading: actionLoading } =
    useAffiliateActions();

  const [suspendTarget, setSuspendTarget] = useState<AffiliateWithUser | null>(
    null
  );
  const [suspendReason, setSuspendReason] = useState("");

  const totalPages = Math.ceil(total / limit);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const filteredAffiliates = statusFilter
    ? affiliates.filter((a) => a.statut === statusFilter)
    : affiliates;

  const handleActivate = async (id: string) => {
    try {
      await activate(id);
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReactivate = async (id: string) => {
    try {
      await reactivate(id);
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const openSuspendModal = (affiliate: AffiliateWithUser) => {
    setSuspendTarget(affiliate);
    setSuspendReason("");
  };

  const handleConfirmSuspend = async () => {
    if (!suspendTarget || !suspendTarget._id) return;
    if (!suspendReason.trim()) return;
    try {
      await suspend(suspendTarget._id, suspendReason.trim());
      setSuspendTarget(null);
      setSuspendReason("");
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {verificationError && <p role="alert" className="text-red-600">{verificationError}</p>}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Affiliés</h1>
          <p className="text-sm text-gray-600 mt-1">
            {total} affilié{total > 1 ? "s" : ""} au total
          </p>
        </div>

        <select
          value={statusFilter ?? ""}
          onChange={(e) =>
            setStatusFilter((e.target.value as AffiliateStatus) || undefined)
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
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
              </div>
            </Card>
          ))}
        </div>
      ) : filteredAffiliates.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Users className="h-8 w-8 text-gray-400" />}
            title="Aucun affilié"
            description="Les affiliés apparaîtront ici"
          />
        </Card>
      ) : (
        <>
          <div className="space-y-3">
            {filteredAffiliates.map((a) => {
              const id = a._id;
              if (!id) return null;

              return (
                <Card key={id}>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {a.user?.username || a.user?.email || id}
                      </p>
                      {a.user?.email && a.user?.username && (
                        <p className="text-xs text-gray-500 truncate">
                          {a.user.email}
                        </p>
                      )}

                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <StatusBadge status={a.statut} />
                        <Badge
                          variant={a.telephoneVerifie ? "success" : "warning"}
                        >
                          {a.telephoneVerifie
                            ? "Tél. vérifié"
                            : "Tél. non vérifié"}
                        </Badge>
                        {a.user?.codeParrainage && (
                          <Badge variant="primary">
                            <span className="font-mono">
                              {a.user.codeParrainage}
                            </span>
                          </Badge>
                        )}
                      </div>

                      <div className="mt-2 text-xs text-gray-500 flex flex-wrap gap-x-3 gap-y-1">
                        <span>{a.telephone}</span>
                        <span>·</span>
                        <span>Inscrit le {formatDate(a.createdAt)}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 flex-shrink-0">
                      {!a.telephoneVerifie && <Button size="sm" variant="outline" loading={verifying === id} onClick={async () => {
                        if (!window.confirm("Confirmez-vous avoir vérifié que cet affilié dispose du numéro " + a.telephone + " ?")) return;
                        setVerifying(id); setVerificationError("");
                        try { await affiliateService.verifyPhone(id); await refetch(); }
                        catch (error: any) { setVerificationError(error?.response?.data?.message ?? "Vérification impossible."); }
                        finally { setVerifying(null); }
                      }}>Confirmer le téléphone</Button>}
                      {a.statut === "en_attente" && (
                        <Button
                          size="sm"
                          onClick={() => handleActivate(id)}
                          loading={actionLoading}
                          icon={<CheckCircle size={16} />}
                        >
                          Activer
                        </Button>
                      )}

                      {a.statut === "actif" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openSuspendModal(a)}
                          disabled={actionLoading}
                          icon={<ShieldOff size={16} />}
                        >
                          Suspendre
                        </Button>
                      )}

                      {a.statut === "suspendu" && (
                        <Button
                          size="sm"
                          onClick={() => handleReactivate(id)}
                          loading={actionLoading}
                          icon={<CheckCircle size={16} />}
                        >
                          Réactiver
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

      <BaseModal
        isOpen={!!suspendTarget}
        onClose={() => {
          setSuspendTarget(null);
          setSuspendReason("");
        }}
        title="Suspendre l'affilié"
        subtitle="Un motif est obligatoire"
        icon={<XCircle className="w-5 h-5 text-white" />}
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Vous êtes sur le point de suspendre{" "}
            <span className="font-medium text-gray-900">
              {suspendTarget?.user?.username ||
                suspendTarget?.user?.email ||
                suspendTarget?._id}
            </span>
            .
          </p>

          <Input
            label="Motif de la suspension"
            placeholder="Ex: Comportement suspect, fraude..."
            value={suspendReason}
            onChange={(e) => setSuspendReason(e.target.value)}
          />

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setSuspendTarget(null);
                setSuspendReason("");
              }}
              fullWidth
            >
              Annuler
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmSuspend}
              loading={actionLoading}
              disabled={!suspendReason.trim()}
              fullWidth
            >
              Suspendre
            </Button>
          </div>
        </div>
      </BaseModal>
    </div>
  );
}