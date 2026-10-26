// src/hooks/reward-withdrawals/useWithdrawals.ts

import { useCallback, useEffect, useState } from "react";
import { withdrawalService } from "../../services/withdrawalService";
import {
  CreateWithdrawalPayload,
  RewardWithdrawal,
  RewardWithdrawalPopulated,
  RewardWithdrawalStatus,
} from "../../types/RewardWithdrawal";

export function useMyWithdrawals(filters?: {
  status?: RewardWithdrawalStatus;
}) {
  const [withdrawals, setWithdrawals] = useState<RewardWithdrawal[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filterKey = JSON.stringify(filters ?? {});
  const fetchWithdrawals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await withdrawalService.getMyWithdrawals({
        ...JSON.parse(filterKey),
        page,
        limit,
      });
      setWithdrawals(result.items);
      setTotal(result.total);
    } catch (err: any) {
      setError(err?.message ?? "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  }, [filterKey, page, limit]);

  useEffect(() => {
    fetchWithdrawals();
  }, [fetchWithdrawals]);

  return {
    withdrawals,
    total,
    page,
    limit,
    loading,
    error,
    setPage,
    setLimit,
    refetch: fetchWithdrawals,
  };
}

export function useWithdrawal(withdrawalId: string) {
  const [withdrawal, setWithdrawal] =
    useState<RewardWithdrawalPopulated | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWithdrawal = useCallback(async () => {
    if (!withdrawalId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await withdrawalService.getById(withdrawalId);
      setWithdrawal(result);
    } catch (err: any) {
      setError(err?.message ?? "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  }, [withdrawalId]);

  useEffect(() => {
    fetchWithdrawal();
  }, [fetchWithdrawal]);

  return { withdrawal, loading, error, refetch: fetchWithdrawal };
}

export function useAdminWithdrawals(filters?: {
  status?: RewardWithdrawalStatus;
  affiliateId?: string;
}) {
  const [withdrawals, setWithdrawals] = useState<RewardWithdrawalPopulated[]>(
    []
  );
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filterKey = JSON.stringify(filters ?? {});
  const fetchWithdrawals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await withdrawalService.list({
        ...JSON.parse(filterKey),
        page,
        limit,
      });
      setWithdrawals(result.items);
      setTotal(result.total);
    } catch (err: any) {
      setError(err?.message ?? "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  }, [filterKey, page, limit]);

  useEffect(() => {
    fetchWithdrawals();
  }, [fetchWithdrawals]);

  return {
    withdrawals,
    total,
    page,
    limit,
    loading,
    error,
    setPage,
    setLimit,
    refetch: fetchWithdrawals,
  };
}

export function useWithdrawalActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (payload: CreateWithdrawalPayload) => {
    setLoading(true);
    setError(null);
    try {
      return await withdrawalService.create(payload);
    } catch (err: any) {
      setError(err?.message ?? "Erreur lors de la création");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const approve = async (withdrawalId: string) => {
    setLoading(true);
    setError(null);
    try {
      return await withdrawalService.approve(withdrawalId);
    } catch (err: any) {
      setError(err?.message ?? "Erreur lors de l'approbation");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reject = async (withdrawalId: string, reason: string) => {
    setLoading(true);
    setError(null);
    try {
      return await withdrawalService.reject(withdrawalId, reason);
    } catch (err: any) {
      setError(err?.message ?? "Erreur lors du rejet");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const markAsPaid = async (
    withdrawalId: string,
    externalReference: string,
    paymentProof?: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      return await withdrawalService.markAsPaid(
        withdrawalId,
        externalReference,
        paymentProof
      );
    } catch (err: any) {
      setError(err?.message ?? "Erreur lors du marquage");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, approve, reject, markAsPaid, loading, error };
}