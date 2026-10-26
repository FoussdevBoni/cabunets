// src/hooks/commissions/useCommissions.ts

import { useCallback, useEffect, useState } from "react";
import { commissionService } from "../../services/commissionService";
import {
  Balance,
  Commission,
  CommissionPopulated,
  CommissionStatus,
  LedgerEntry,
  ProgramType,
} from "../../types/Commission";

export function useMyCommissions(filters?: { status?: CommissionStatus }) {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filterKey = JSON.stringify(filters ?? {});
  const fetchCommissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await commissionService.getMyCommissions({
        ...JSON.parse(filterKey),
        page,
        limit,
      });
      setCommissions(result.items);
      setTotal(result.total);
    } catch (err: any) {
      setError(err?.message ?? "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  }, [filterKey, page, limit]);

  useEffect(() => {
    fetchCommissions();
  }, [fetchCommissions]);

  return {
    commissions,
    total,
    page,
    limit,
    loading,
    error,
    setPage,
    setLimit,
    refetch: fetchCommissions,
  };
}

export function useMyBalance() {
  const [balance, setBalance] = useState<Balance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await commissionService.getMyBalance();
      setBalance(result);
    } catch (err: any) {
      setError(err?.message ?? "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return { balance, loading, error, refetch: fetchBalance };
}

export function useMyLedger() {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLedger = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await commissionService.getMyHistory({ page, limit });
      setEntries(result.items);
      setTotal(result.total);
    } catch (err: any) {
      setError(err?.message ?? "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchLedger();
  }, [fetchLedger]);

  return {
    entries,
    total,
    page,
    limit,
    loading,
    error,
    setPage,
    setLimit,
    refetch: fetchLedger,
  };
}

export function useAdminCommissions(filters?: {
  status?: CommissionStatus;
  affiliateId?: string;
  program?: ProgramType;
}) {
  const [commissions, setCommissions] = useState<CommissionPopulated[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filterKey = JSON.stringify(filters ?? {});
  const fetchCommissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await commissionService.list({
        ...JSON.parse(filterKey),
        page,
        limit,
      });
      setCommissions(result.items);
      setTotal(result.total);
    } catch (err: any) {
      setError(err?.message ?? "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  }, [filterKey, page, limit]);

  useEffect(() => {
    fetchCommissions();
  }, [fetchCommissions]);

  return {
    commissions,
    total,
    page,
    limit,
    loading,
    error,
    setPage,
    setLimit,
    refetch: fetchCommissions,
  };
}

export function useCommissionActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = async (commissionId: string) => {
    setLoading(true);
    setError(null);
    try {
      return await commissionService.validate(commissionId);
    } catch (err: any) {
      setError(err?.message ?? "Erreur lors de la validation");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancel = async (commissionId: string, reason: string) => {
    setLoading(true);
    setError(null);
    try {
      return await commissionService.cancel(commissionId, reason);
    } catch (err: any) {
      setError(err?.message ?? "Erreur lors de l'annulation");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const processDue = async () => {
    setLoading(true);
    setError(null);
    try {
      return await commissionService.processDue();
    } catch (err: any) {
      setError(err?.message ?? "Erreur lors du traitement");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { validate, cancel, processDue, loading, error };
}