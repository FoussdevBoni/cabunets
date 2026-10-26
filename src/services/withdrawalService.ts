// src/services/withdrawalService.ts

import api from "../utils/api";
import {
  CreateWithdrawalPayload,
  PaginatedWithdrawals,
  PaginatedWithdrawalsPopulated,
  RewardWithdrawal,
  RewardWithdrawalPopulated,
  RewardWithdrawalStatus,
} from "../types/RewardWithdrawal";

export const withdrawalService = {
  async create(payload: CreateWithdrawalPayload) {
    const { data } = await api.post<{
      message: string;
      data: RewardWithdrawal;
    }>("/reward-withdrawals", payload);
    return data;
  },

  async getMyWithdrawals(params?: {
    status?: RewardWithdrawalStatus;
    page?: number;
    limit?: number;
  }) {
    const { data } = await api.get<{ data: PaginatedWithdrawals }>(
      "/reward-withdrawals/me",
      { params }
    );
    return data.data;
  },

  async getById(withdrawalId: string) {
    const { data } = await api.get<{ data: RewardWithdrawalPopulated }>(
      `/reward-withdrawals/${withdrawalId}`
    );
    return data.data;
  },

  async list(params?: {
    status?: RewardWithdrawalStatus;
    affiliateId?: string;
    page?: number;
    limit?: number;
  }) {
    const { data } = await api.get<{
      data: PaginatedWithdrawalsPopulated;
    }>("/reward-withdrawals", { params });
    return data.data;
  },

  async approve(withdrawalId: string) {
    const { data } = await api.post<{
      message: string;
      data: RewardWithdrawal;
    }>(`/reward-withdrawals/${withdrawalId}/approve`);
    return data;
  },

  async reject(withdrawalId: string, reason: string) {
    const { data } = await api.post<{
      message: string;
      data: RewardWithdrawal;
    }>(`/reward-withdrawals/${withdrawalId}/reject`, { reason });
    return data;
  },

  async markAsPaid(
    withdrawalId: string,
    externalReference: string,
    paymentProof?: string
  ) {
    const { data } = await api.post<{
      message: string;
      data: RewardWithdrawal;
    }>(`/reward-withdrawals/${withdrawalId}/paid`, {
      externalReference,
      paymentProof,
    });
    return data;
  },
};

export type WithdrawalService = typeof withdrawalService;