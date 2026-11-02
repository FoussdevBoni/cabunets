import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { registerSW } from "virtual:pwa-register";

let ready = false;
const listeners = new Set<() => void>();
const update = registerSW({ onNeedRefresh() { ready = true; listeners.forEach(fn => fn()); } });

export default function PwaUpdateNotice() {
  const [available, setAvailable] = useState(ready);
  const location = useLocation();
  useEffect(() => {
    const listener = () => setAvailable(ready);
    listeners.add(listener);
    if (ready) listener();
    return () => { listeners.delete(listener); };
  }, []);
  if (!available) return null;
  const inCheckout = ["/checkout", "/order-pending"].includes(location.pathname);
  return <aside role="status" className="fixed bottom-20 left-4 right-4 z-50 rounded-xl border bg-white p-4 shadow-lg sm:left-auto sm:max-w-sm">
    <p className="font-medium">Une nouvelle version de Cabunets est disponible.</p>
    <p className="text-sm text-gray-600 mt-1">{inCheckout ? "Terminez le suivi de votre commande avant de mettre à jour." : "Votre page sera rechargée lorsque vous choisirez de mettre à jour."}</p>
    <button type="button" disabled={inCheckout} className="mt-3 rounded-lg bg-primary px-4 py-2 text-white disabled:opacity-50" onClick={() => update(true)}>Mettre à jour</button>
  </aside>;
}