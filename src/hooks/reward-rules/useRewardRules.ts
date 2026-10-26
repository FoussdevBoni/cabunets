// src/hooks/reward-rules/useRewardRules.ts

import { useCallback, useEffect, useState } from "react";
import { rewardRuleService } from "../../services/rewardRuleService";
import {
  CreateRewardRulePayload,
  RewardRule,
  UpdateRewardRulePayload,
} from "../../types/RewardRule";

export function useRewardRules() {
  const [rules, setRules] = useState<RewardRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRules = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await rewardRuleService.list();
      setRules(result);
    } catch (err: any) {
      setError(err?.message ?? "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  return { rules, loading, error, refetch: fetchRules };
}

export function useRewardRule(id: string) {
  const [rule, setRule] = useState<RewardRule | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRule = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const result = await rewardRuleService.getById(id);
      setRule(result);
    } catch (err: any) {
      setError(err?.message ?? "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRule();
  }, [fetchRule]);

  return { rule, loading, error, refetch: fetchRule };
}

export function useRewardRuleActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (payload: CreateRewardRulePayload) => {
    setLoading(true);
    setError(null);
    try {
      return await rewardRuleService.create(payload);
    } catch (err: any) {
      setError(err?.message ?? "Erreur lors de la création");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const update = async (id: string, payload: UpdateRewardRulePayload) => {
    setLoading(true);
    setError(null);
    try {
      return await rewardRuleService.update(id, payload);
    } catch (err: any) {
      setError(err?.message ?? "Erreur lors de la mise à jour");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (id: string, active: boolean) => {
    setLoading(true);
    setError(null);
    try {
      return await rewardRuleService.toggleActive(id, active);
    } catch (err: any) {
      setError(err?.message ?? "Erreur lors du changement de statut");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { create, update, toggleActive, loading, error };
}