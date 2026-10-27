import { useState } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Pagination } from "../../components/ui/Pagination";
import { useAdminResource } from "../../hooks/affiliates/useAdminResource";
import { AffiliateIssue, PageData } from "../../types/AffiliateAdmin";
import { affiliateAdminService } from "../../services/affiliateAdminService";

export default function AnomaliesPage() {
  const [status, setStatus] = useState("open"); const [page, setPage] = useState(1);
  const [busy, setBusy] = useState(false); const [message, setMessage] = useState("");
  const [orderId, setOrderId] = useState(""); const [operation, setOperation] = useState("cancel");
  const [accountId, setAccountId] = useState("");
  const [adjustment, setAdjustment] = useState("");
  const [adjustmentReason, setAdjustmentReason] = useState("");
  const [adjustmentRef, setAdjustmentRef] = useState("");
  const [reason, setReason] = useState(""); const [reference, setReference] = useState("");
  const { data, loading, error, refetch } = useAdminResource<PageData<AffiliateIssue>>("issues", { status, page });
  async function action(path: string, body: object = {}) {
    setBusy(true); setMessage("");
    try { await affiliateAdminService.action(path, body); await refetch(); setMessage("Opération enregistrée."); }
    catch (failure: any) { setMessage(failure?.response?.data?.message ?? "Opération impossible."); }
    finally { setBusy(false); }
  }
  return <div className="space-y-5">
    <div><h1 className="text-2xl font-bold">Anomalies et reprises</h1><p className="text-sm text-gray-600">Les signalements demandent un examen humain. Aucun compte n’est bloqué automatiquement.</p></div>
    <div className="flex flex-wrap gap-2">
      <select aria-label="État des anomalies" className="rounded-lg border-gray-300" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
        <option value="open">À examiner</option><option value="resolved">Résolues</option><option value="">Toutes</option>
      </select>
      <Button variant="outline" loading={busy} onClick={() => action("issues/scan")}>Rechercher les anomalies</Button>
      <Button loading={busy} onClick={() => action("reconcile")}>Reprendre les commissions</Button>
    </div>
    {(message || error) && <p role="status" className="text-sm">{message || error}</p>}
    {loading ? <p role="status">Chargement…</p> : !data?.items.length ? <Card>Aucune anomalie pour ce filtre.</Card> : data.items.map(item =>
      <Card key={item._id}><h2 className="font-semibold">{item.category === "negative_balance" ? "Solde négatif" : item.category === "shared_phone" ? "Téléphone partagé" : "Commission à reprendre"}</h2>
        <p className="text-sm mt-2 break-words">{item.message}</p>
        <p className="text-xs text-gray-500 mt-2">{new Date(item.updatedAt).toLocaleString("fr-FR")} · {item.status === "open" ? "À examiner" : "Résolue"}{item.orderId ? " · Commande " + item.orderId : ""}</p>
        {item.resolution && <p className="text-sm mt-2">{item.resolution}</p>}
        {item.status === "open" && <Button className="mt-3" size="sm" variant="outline" disabled={busy} onClick={() => {
          const resolution = window.prompt("Indiquez le résultat de votre vérification :");
          if (resolution?.trim()) void action("issues/" + encodeURIComponent(item._id) + "/resolve", { reason: resolution.trim() });
        }}>Consigner la résolution</Button>}
      </Card>)}
    <Pagination page={page} totalPages={data?.totalPages ?? 0} total={data?.total ?? 0} onPageChange={setPage} />
    <Card><h2 className="font-semibold mb-2">Annulation et remboursement d’une commande</h2>
      <p className="text-sm text-gray-600 mb-4">Cette action conserve l’historique et régularise les commissions. Elle ne transfère pas d’argent : un remboursement doit avoir été effectué et référencé au préalable.</p>
      <form className="space-y-3" onSubmit={event => {
        event.preventDefault();
        if (window.confirm("Confirmer l’enregistrement de cette opération et la régularisation des commissions ?"))
          void action("orders/" + orderId.trim() + "/" + operation, { reason, reference });
      }}>
        <Input label="Identifiant de la commande" value={orderId} onChange={e => setOrderId(e.target.value)} required pattern="[a-fA-F0-9]{24}" />
        <label className="block text-sm">Opération<select className="block rounded-lg border-gray-300 mt-1" value={operation} onChange={e => setOperation(e.target.value)}>
          <option value="cancel">Annuler une commande non payée</option><option value="refund">Consigner un remboursement effectué</option></select></label>
        <Input label="Motif" value={reason} onChange={e => setReason(e.target.value)} required />
        {operation === "refund" && <Input label="Référence du remboursement" value={reference} onChange={e => setReference(e.target.value)} required />}
        <Button type="submit" variant="danger" loading={busy}>Enregistrer l’opération</Button>
      </form>
    </Card>
    <Card><h2 className="font-semibold mb-2">Consigner une régularisation justifiée</h2>
      <p className="text-sm text-gray-600 mb-4">À utiliser pour un remboursement reçu de l’affilié ou une correction documentée. Un montant positif crédite le compte, un montant négatif le débite. Aucun transfert d’argent n’est exécuté.</p>
      <form className="space-y-3" onSubmit={event => {
        event.preventDefault();
        if (window.confirm("Confirmer cette correction du registre avec sa référence justificative ?"))
          void action("adjustments", { affiliateId: accountId.trim(), amount: Number(adjustment), reason: adjustmentReason, reference: adjustmentRef });
      }}>
        <Input label="Identifiant de l’affilié" value={accountId} onChange={e => setAccountId(e.target.value)} pattern="[a-fA-F0-9]{24}" required />
        <Input label="Montant signé en CDF" type="number" step="0.01" value={adjustment} onChange={e => setAdjustment(e.target.value)} required />
        <Input label="Motif de la régularisation" value={adjustmentReason} onChange={e => setAdjustmentReason(e.target.value)} required />
        <Input label="Référence justificative unique" value={adjustmentRef} onChange={e => setAdjustmentRef(e.target.value)} maxLength={100} required />
        <Button type="submit" variant="outline" loading={busy}>Consigner la régularisation</Button>
      </form>
    </Card>
  </div>;
}
