import { useState } from "react";
import { Card } from "../../components/ui/Card";
import { Pagination } from "../../components/ui/Pagination";
import { PeriodToolbar } from "../../components/layouts/AdminTools";
import { useAdminResource } from "../../hooks/affiliates/useAdminResource";
import { AuditRecord, PageData, PeriodFilter } from "../../types/AffiliateAdmin";

export default function AuditPage() {
  const [filters, setFilters] = useState<PeriodFilter>({}); const [page, setPage] = useState(1);
  const { data, loading, error } = useAdminResource<PageData<AuditRecord>>("audit", { ...filters, page });
  return <div className="space-y-5">
    <div><h1 className="text-2xl font-bold">Journal d’audit</h1><p className="text-sm text-gray-600">Actions administratives du programme et résultats des opérations.</p></div>
    <PeriodToolbar value={filters} onChange={next => { setFilters(next); setPage(1); }} />
    {error && <p role="alert" className="text-red-600">{error}</p>}
    {loading ? <p role="status">Chargement…</p> : !data?.items.length ? <Card>Aucune opération pour cette période.</Card> :
      data.items.map(item => <Card key={item._id}>
        <div className="flex flex-wrap justify-between gap-2"><strong className="break-all">{item.action}</strong>
          <span className={(item.status ?? 200) >= 400 ? "text-red-600" : "text-green-700"}>HTTP {item.status ?? "—"}</span></div>
        <p className="text-sm text-gray-600 mt-2">{item.actorId?.username || item.actorId?.email || "Administrateur"} · {new Date(item.createdAt).toLocaleString("fr-FR")}</p>
        {item.payload && <details className="mt-2 text-sm"><summary className="cursor-pointer">Détails</summary><pre className="whitespace-pre-wrap break-all mt-2">{JSON.stringify(item.payload, null, 2)}</pre></details>}
      </Card>)}
    <Pagination page={page} totalPages={data?.totalPages ?? 0} total={data?.total ?? 0} onPageChange={setPage} />
  </div>;
}
