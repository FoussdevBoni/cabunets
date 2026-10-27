import { useState } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Pagination } from "../../components/ui/Pagination";
import { useAdminResource } from "../../hooks/affiliates/useAdminResource";
import { PageData, ReferredSeller } from "../../types/AffiliateAdmin";
import { affiliateAdminService } from "../../services/affiliateAdminService";
export default function SellersPage() {
  const [page, setPage] = useState(1); const [busy, setBusy] = useState(""); const [message, setMessage] = useState("");
  const { data, loading, error, refetch } = useAdminResource<PageData<ReferredSeller>>("sellers", { page });
  return <div className="space-y-5">
    <div><h1 className="text-2xl font-bold">Vendeurs apportés</h1><p className="text-sm text-gray-600">La prime est déclenchée après approbation commerciale et première vente livrée. La confirmation de l’email ne vaut pas approbation.</p></div>
    {(message || error) && <p role="status" className="text-sm">{message || error}</p>}
    {loading ? <p role="status">Chargement…</p> : !data?.items.length ? <Card>Aucun vendeur attribué.</Card> : data.items.map(item => {
      const seller = item.filleulId;
      return <Card key={item._id}><div className="flex flex-wrap justify-between gap-3"><div>
        <h2 className="font-semibold">{seller?.username || seller?.email || "Compte indisponible"}</h2>
        <p className="text-sm text-gray-600">{item.seller?.whatsappNumber}</p>
        <p className="text-sm mt-2">Parrain : {item.affiliateId?.username || item.affiliateId?.codeParrainage || "—"}</p>
        <p className="text-sm">{item.seller?.isApproved ? "Approuvé commercialement" : "À vérifier"}</p>
      </div>{seller && item.seller && !item.seller.isApproved && <Button loading={busy === seller._id} disabled={seller.isActive === false} onClick={async () => {
        if (!window.confirm("Confirmez-vous avoir vérifié l’identité et l’activité commerciale de ce vendeur ?")) return;
        setBusy(seller._id); setMessage("");
        try { await affiliateAdminService.action("sellers/" + seller._id + "/approve"); await refetch(); setMessage("Vendeur approuvé. Les ventes admissibles ont été examinées."); }
        catch (failure: any) { setMessage(failure?.response?.data?.message ?? "Approbation impossible."); }
        finally { setBusy(""); }
      }}>Approuver le vendeur</Button>}</div></Card>;
    })}
    <Pagination page={page} totalPages={data?.totalPages ?? 0} total={data?.total ?? 0} onPageChange={setPage} />
  </div>;
}
