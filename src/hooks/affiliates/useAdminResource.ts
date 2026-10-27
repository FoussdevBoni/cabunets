import { useCallback, useEffect, useState } from "react";
import { affiliateAdminService } from "../../services/affiliateAdminService";
export function useAdminResource<T>(path: string, params: object = {}) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const key = JSON.stringify(params);
  const refetch = useCallback(async () => {
    setLoading(true); setError("");
    try { setData(await affiliateAdminService.get<T>(path, JSON.parse(key))); }
    catch (failure: any) { setError(failure?.response?.data?.message ?? "Chargement impossible."); }
    finally { setLoading(false); }
  }, [path, key]);
  useEffect(() => { void refetch(); }, [refetch]);
  return { data, loading, error, refetch };
}
