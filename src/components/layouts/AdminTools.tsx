import { useState } from "react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { PeriodFilter, ProgramSettings } from "../../types/AffiliateAdmin";
import { affiliateAdminService } from "../../services/affiliateAdminService";
import { useAdminResource } from "../../hooks/affiliates/useAdminResource";

export function PeriodToolbar({ value, onChange }: { value: PeriodFilter; onChange: (value: PeriodFilter) => void }) {
  return <div className="flex flex-wrap items-end gap-3">
    <label className="text-sm">Du<input aria-label="Date de début" className="block rounded-lg border-gray-300" type="date" value={value.from ?? ""} onChange={e => onChange({ ...value, from: e.target.value || undefined })} /></label>
    <label className="text-sm">Au<input aria-label="Date de fin" className="block rounded-lg border-gray-300" type="date" value={value.to ?? ""} onChange={e => onChange({ ...value, to: e.target.value || undefined })} /></label>
    <Button variant="ghost" onClick={() => onChange({})}>Toute la période</Button>
  </div>;
}
export function ExportControls({ filters = {} }: { filters?: PeriodFilter }) {
  const [busy, setBusy] = useState(""); const [error, setError] = useState("");
  return <div className="space-y-2"><div className="flex flex-wrap gap-2">
    {([["commissions", "Commissions"], ["withdrawals", "Retraits"], ["referrals", "Filleuls"]] as const).map(([kind, label]) =>
      <Button key={kind} size="sm" variant="outline" disabled={!!busy} loading={busy === kind} onClick={async () => {
        setBusy(kind); setError("");
        try { await affiliateAdminService.export(kind, filters); } catch { setError("Export impossible. Veuillez réessayer."); }
        finally { setBusy(""); }
      }}>Exporter {label} CSV</Button>)}
  </div>{error && <p role="alert" className="text-sm text-red-600">{error}</p>}</div>;
}
export function ProgramSettingsForm() {
  const { data, error, refetch } = useAdminResource<ProgramSettings>("settings");
  const [amount, setAmount] = useState(""); const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  return <Card><h2 className="font-semibold mb-3">Paramètres du programme</h2>
    <p className="text-sm text-gray-600 mb-3">Les retraits sont traités manuellement, après vérification et confirmation du paiement.</p>
    {(error || message) && <p role="status" className="text-sm mb-3">{error || message}</p>}
    <form className="flex flex-wrap gap-3 items-end" onSubmit={async event => {
      event.preventDefault(); setBusy(true); setMessage("");
      try { await affiliateAdminService.settings(Number(amount || data?.minWithdrawalAmount)); await refetch(); setMessage("Seuil de retrait enregistré."); }
      catch (failure: any) { setMessage(failure?.response?.data?.message ?? "Enregistrement impossible."); }
      finally { setBusy(false); }
    }}>
      <Input label="Minimum de retrait (CDF)" type="number" min="1" step="0.01" value={amount || String(data?.minWithdrawalAmount ?? "")} onChange={event => setAmount(event.target.value)} required />
      <Button type="submit" loading={busy} disabled={!data}>Enregistrer le seuil</Button>
    </form>
  </Card>;
}
