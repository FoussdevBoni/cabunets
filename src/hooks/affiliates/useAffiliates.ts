// src/hooks/affiliates/useAffiliates.ts

import { useCallback, useEffect, useState } from "react";
import { affiliateService } from "../../services/affiliateService";
import {
  AffiliateStatus,
  AffiliateWithUser,
  BecomeAffiliatePayload,
} from "../../types/Affiliate";

export function useAffiliates(filters: { statut?: AffiliateStatus } = {}) {
  const filterKey = JSON.stringify(filters);
  const [affiliates, setAffiliates] = useState<AffiliateWithUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAffiliates = useCallback(
    async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await affiliateService.list({
          ...JSON.parse(filterKey),
          page,
          limit,
        });
        setAffiliates(result.items);
        setTotal(result.total);
      } catch (err: any) {
        setError(err?.message ?? "Erreur lors du chargement");
      } finally {
        setLoading(false);
      }
    },
    [page, limit, filterKey]
  );

  useEffect(() => {
    fetchAffiliates();
  }, [fetchAffiliates]);

  return {
    affiliates,
    total,
    page,
    limit,
    loading,
    error,
    setPage,
    setLimit,
    refetch: fetchAffiliates,
  };
}

export function useMyAffiliateProfile() {
  const [profile, setProfile] = useState<AffiliateWithUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await affiliateService.getMyProfile();
      setProfile(result);
    } catch (err: any) {
      setError(err?.message ?? "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, loading, error, refetch: fetchProfile };
}

export function useBecomeAffiliate() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const becomeAffiliate = async (payload: BecomeAffiliatePayload) => {
    setLoading(true);
    setError(null);
    try {
      const result = await affiliateService.becomeAffiliate(payload);
      return result;
    } catch (err: any) {
      setError(err?.message ?? "Erreur lors de l'inscription");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { becomeAffiliate, loading, error };
}

export function useAffiliateActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activate = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      return await affiliateService.activate(userId);
    } catch (err: any) {
      setError(err?.message ?? "Erreur lors de l'activation");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const suspend = async (userId: string, reason?: string) => {
    setLoading(true);
    setError(null);
    try {
      return await affiliateService.suspend(userId, reason);
    } catch (err: any) {
      setError(err?.message ?? "Erreur lors de la suspension");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reactivate = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      return await affiliateService.reactivate(userId);
    } catch (err: any) {
      setError(err?.message ?? "Erreur lors de la réactivation");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyPhone = async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      return await affiliateService.verifyPhone(userId);
    } catch (err: any) {
      setError(err?.message ?? "Erreur lors de la vérification");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { activate, suspend, reactivate, verifyPhone, loading, error };
}