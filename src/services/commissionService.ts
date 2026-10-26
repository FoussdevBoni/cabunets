// src/services/commissionService.ts

import api from "../utils/api";
import {
  Balance,
  Commission,
  CommissionStatus,
  PaginatedCommissions,
  PaginatedCommissionsPopulated,
  PaginatedLedger,
  ProgramType,
} from "../types/Commission";

export const commissionService = {
  async getMyCommissions(params?: {
    status?: CommissionStatus;
    page?: number;
    limit?: number;
  }) {
    const { data } = await api.get<{ data: PaginatedCommissions }>(
      "/commissions/me",
      { params }
    );
    return data.data;
  },

  async getMyBalance() {
    const { data } = await api.get<{ data: Balance }>(
      "/commissions/me/balance"
    );
    return data.data;
  },

  async getMyHistory(params?: { page?: number; limit?: number }) {
    const { data } = await api.get<{ data: PaginatedLedger }>(
      "/commissions/me/history",
      { params }
    );
    return data.data;
  },

  async list(params?: {
    status?: CommissionStatus;
    affiliateId?: string;
    program?: ProgramType;
    page?: number;
    limit?: number;
  }) {
    const { data } = await api.get<{ data: PaginatedCommissionsPopulated }>(
      "/commissions",
      { params }
    );
    return data.data;
  },

  async validate(commissionId: string) {
    const { data } = await api.post<{
      message: string;
      data: Commission;
    }>(`/commissions/${commissionId}/validate`);
    return data;
  },

  async cancel(commissionId: string, reason: string) {
    const { data } = await api.post<{
      message: string;
      data: Commission;
    }>(`/commissions/${commissionId}/cancel`, { reason });
    return data;
  },

  async processDue() {
    const { data } = await api.post<{
      message: string;
      data: { modifiedCount: number; timestamp: string };
    }>("/commissions/process-due");
    return data;
  },
};

export type CommissionService = typeof commissionService;