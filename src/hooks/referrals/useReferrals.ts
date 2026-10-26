// src/hooks/referrals/useReferrals.ts

import { useCallback, useEffect, useState } from "react";
import { referralService } from "../../services/referralService";
import {
  MySponsorResponse,
  PaginatedReferrals,
  ReferralStats,
  ReferralType,
  ReferralWithFilleul,
} from "../../types/Referral";

export function useMyReferrals(filters?: { type?: ReferralType }) {
  const [referrals, setReferrals] = useState<ReferralWithFilleul[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filterKey = JSON.stringify(filters ?? {});
  const fetchReferrals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result: PaginatedReferrals = await referralService.getMyReferrals({
        ...JSON.parse(filterKey),
        page,
        limit,
      });
      setReferrals(result.items);
      setTotal(result.total);
    } catch (err: any) {
      setError(err?.message ?? "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  }, [filterKey, page, limit]);

  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

  return {
    referrals,
    total,
    page,
    limit,
    loading,
    error,
    setPage,
    setLimit,
    refetch: fetchReferrals,
  };
}

export function useMyReferralStats() {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await referralService.getMyStats();
      setStats(result);
    } catch (err: any) {
      setError(err?.message ?? "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}

export function useMySponsor() {
  const [sponsor, setSponsor] = useState<MySponsorResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSponsor = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await referralService.getMySponsor();
      setSponsor(result);
    } catch (err: any) {
      setError(err?.message ?? "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSponsor();
  }, [fetchSponsor]);

  return { sponsor, loading, error, refetch: fetchSponsor };
}

export function useReferral(referralId: string) {
  const [referral, setReferral] = useState<ReferralWithFilleul | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReferral = useCallback(async () => {
    if (!referralId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await referralService.getById(referralId);
      setReferral(result);
    } catch (err: any) {
      setError(err?.message ?? "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  }, [referralId]);

  useEffect(() => {
    fetchReferral();
  }, [fetchReferral]);

  return { referral, loading, error, refetch: fetchReferral };
}