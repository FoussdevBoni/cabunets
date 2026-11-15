// src/layouts/affiliate/AffiliateLayout.tsx

import { useState } from "react";
import { useAuth } from "../../hooks/auth/useAuth";
import api from "../../utils/api";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../../components/layouts/Sidebar";
import { BottomBar } from "../../components/layouts/BottomBar";
import { Header } from "../../components/layouts/Header";
import { affiliateNav } from "../../navigation/affiliateNav";

export function AffiliateLayout() {
  const { user } = useAuth();
  const [stopping, setStopping] = useState(false);
  const [error, setError] = useState("");

  async function stopManaging() {
    setStopping(true);
    setError("");
    try {
      await api.post("/admin/manage/stop");
      window.location.assign("/admin/affiliates");
    } catch {
      setError("Impossible de revenir à l?administration. Réessayez.");
      setStopping(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 lg:pl-64">
      {/* Sidebar desktop */}
      <Sidebar items={affiliateNav} title="CabuAffili" />

      {/* Contenu */}
      <div className="min-w-0 pt-16">
        <Header title="Espace affilié" />

        <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6">
          {user?.impersonatedBy && (
            <div className="mb-4 rounded-lg bg-amber-100 p-4 text-amber-950">
              <p role="status">Prise en main du compte de {user.username || user.email}</p>
              <button type="button" className="mt-2 underline" disabled={stopping} onClick={stopManaging}>
                Revenir à l?administration
              </button>
              {error && <p role="alert">{error}</p>}
            </div>
          )}
          <Outlet />
        </main>
      </div>

      {/* BottomBar mobile/tablette */}
      <BottomBar items={affiliateNav} />
    </div>
  );
}