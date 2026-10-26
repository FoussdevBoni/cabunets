// src/services/affiliateService.ts

import api from "../utils/api";
import {
  AffiliateStatus,
  AffiliateWithUser,
  BecomeAffiliatePayload,
  BecomeAffiliateResponse,
  PaginatedAffiliates,
} from "../types/Affiliate";


// ============================================================
// SERVICE
// ============================================================

export const affiliateService = {
  async becomeAffiliate(payload: BecomeAffiliatePayload) {
    const { data } = await api.post<{ message: string; data: BecomeAffiliateResponse }>(
      "/affiliates/devenir",
      payload
    );
    return data;
  },

  async getMyProfile() {
    const { data } = await api.get<{ data: AffiliateWithUser }>(
      "/affiliates/me"
    );
    return data.data;
  },

  async verifyPhone(userId: string) {
    const { data } = await api.post<{
      message: string;
      data: { success: boolean; telephoneVerifie: boolean };
    }>("/affiliates/verifier-telephone", { userId });
    return data;
  },

  async list(params?: {
    statut?: AffiliateStatus;
    page?: number;
    limit?: number;
  }) {
    const { data } = await api.get<{ data: PaginatedAffiliates }>(
      "/affiliates",
      { params }
    );
    return data.data;
  },

  async activate(userId: string) {
    const { data } = await api.post<{
      message: string;
      data: { success: boolean; statut: AffiliateStatus; alreadyActive: boolean };
    }>(`/affiliates/${userId}/activer`);
    return data;
  },

  async suspend(userId: string, reason?: string) {
    const { data } = await api.post<{
      message: string;
      data: { success: boolean; statut: AffiliateStatus; alreadySuspended: boolean };
    }>(`/affiliates/${userId}/suspendre`, { motif: reason });
    return data;
  },

  async reactivate(userId: string) {
    const { data } = await api.post<{
      message: string;
      data: { success: boolean; statut: AffiliateStatus };
    }>(`/affiliates/${userId}/reactiver`);
    return data;
  },
};

export type AffiliateService = typeof affiliateService;