import { useState } from "react";
import { Card } from "../../components/ui/Card";
import { Pagination } from "../../components/ui/Pagination";
import { useAdminResource } from "../../hooks/affiliates/useAdminResource";
import { PageData } from "../../types/AffiliateAdmin";

interface ReferredClient {
  _id: string;
  filleulId?: { username?: string; email?: string; isActive?: boolean } | null;
  affiliateId?: { username?: string; codeParrainage?: string } | null;
  codeUtilise?: string;
  attributedAt?: string;
}

export default function ClientsPage() {
  const [page, setPage] = useState(1);
  const { data, loading, error } = useAdminResource<PageData<ReferredClient>>("clients", { page });

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">Clients apportés</h1>
      {error && <p role="alert">{error}</p>}
      {loading && <p role="status">Chargement…</p>}
      {!loading && !error && !data?.items.length && <Card>Aucun client attribué.</Card>}
      {data?.items.map(client => (
        <Card key={client._id}>
          <h2 className="font-semibold">{client.filleulId?.username || client.filleulId?.email || "Compte indisponible"}</h2>
          {client.filleulId?.email && <p className="break-all">{client.filleulId.email}</p>}
          <p>Parrain : {client.affiliateId?.username || client.affiliateId?.codeParrainage || "—"}</p>
          <p>Code utilisé : {client.codeUtilise || "—"}</p>
          {client.attributedAt && <p>Attribution : {new Date(client.attributedAt).toLocaleDateString("fr-FR")}</p>}
        </Card>
      ))}
      <Pagination page={page} totalPages={data?.totalPages ?? 0} total={data?.total ?? 0} onPageChange={setPage} />
    </div>
  );
}
