import { useState } from "react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
// src/pages/affiliate/ProfilePage.tsx

import { User as UserIcon, Mail, Phone, Shield } from "lucide-react";
import { Card, CardHeader } from "../../components/ui/Card";
import { Badge, StatusBadge } from "../../components/ui/Badge";
import { SkeletonCard } from "../../components/ui/Skeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { useMyAffiliateProfile, useBecomeAffiliate } from "../../hooks/affiliates/useAffiliates";
import { useAuth } from "../../hooks/auth/useAuth";

export default function ProfilePage() {
  const { user } = useAuth();
  const { profile, loading, refetch } = useMyAffiliateProfile();
  const { becomeAffiliate, loading: submitting } = useBecomeAffiliate();
  const [telephone, setTelephone] = useState("");
  const [formError, setFormError] = useState("");

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mon profil</h1>
        <p className="text-sm text-gray-600 mt-1">
          Vos informations personnelles et affilié
        </p>
      </div>

      {/* Infos compte */}
      <Card>
        <CardHeader title="Informations du compte" />

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <UserIcon className="text-primary" size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500">Nom d'utilisateur</p>
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.username || "—"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Mail className="text-primary" size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.email || "—"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Shield className="text-primary" size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Rôle</p>
              <Badge variant="primary">{user?.role || "—"}</Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Infos affilié */}
      {!profile ? (
        <Card>
          <EmptyState
            title="Pas encore affilié"
            description="Votre compte Cabunets peut aussi rejoindre le programme d’affiliation."
          />
          <form className="mt-4 space-y-3" onSubmit={async event => {
            event.preventDefault(); setFormError("");
            try { await becomeAffiliate({ telephone }); await refetch(); }
            catch (error: any) { setFormError(error?.response?.data?.message ?? "Impossible de rejoindre le programme."); }
          }}>
            <Input label="Téléphone" type="tel" value={telephone} onChange={event => setTelephone(event.target.value)} required />
            {formError && <p role="alert" className="text-sm text-red-600">{formError}</p>}
            <Button type="submit" loading={submitting}>Devenir affilié</Button>
          </form>
        </Card>
      ) : (
        <Card>
          <CardHeader
            title="Informations affilié"
            description="Votre statut et coordonnées de parrainage"
          />

          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-gray-100 gap-3">
              <span className="text-sm text-gray-600">Code de parrainage</span>
              <span className="font-mono text-sm font-semibold text-primary">
                {profile.code || "—"}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-100 gap-3">
              <span className="text-sm text-gray-600">Statut</span>
              <StatusBadge status={profile.statut} />
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-100 gap-3">
              <span className="text-sm text-gray-600">Téléphone</span>
              <span className="text-sm text-gray-900 flex items-center gap-2">
                <Phone size={14} className="text-gray-400" />
                {profile.telephone}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-100 gap-3">
              <span className="text-sm text-gray-600">Téléphone vérifié</span>
              <Badge variant={profile.telephoneVerifie ? "success" : "warning"}>
                {profile.telephoneVerifie ? "Oui" : "Non"}
              </Badge>
            </div>

            <div className="flex items-center justify-between py-2 gap-3">
              <span className="text-sm text-gray-600">Affilié depuis</span>
              <span className="text-sm text-gray-900">
                {formatDate(profile.createdAt)}
              </span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}