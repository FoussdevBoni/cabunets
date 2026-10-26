// hooks/stats/useOverviewStats.ts
import { useCallback, useEffect, useState } from "react";
import { statsService, AdminOverview, VendeurOverview } from "../../services/statsService";
import useToken from "../auth/useToken";

// ============================================================
// ADMIN
// ============================================================
export function useAdminOverview() {
  const { token } = useToken();
  const [data, setData] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await statsService.getAdminOverview(token);
      setData(res);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}

// ============================================================
// VENDEUR
// ============================================================
export function useVendeurOverview() {
  const { token } = useToken();
  const [data, setData] = useState<VendeurOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await statsService.getVendeurOverview(token);
      setData(res);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}