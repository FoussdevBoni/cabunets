// src/services/referralService.ts

import api from "../utils/api";
import {
    MySponsorResponse,
    PaginatedReferrals,
  ReferralStats,
  ReferralType,
  ReferralWithFilleul,
} from "../types/Referral";


// ============================================================
// SERVICE
// ============================================================

export const referralService = {
  async getMyReferrals(params?: {
    page?: number;
    limit?: number;
    type?: ReferralType;
  }) {
    const { data } = await api.get<{ data: PaginatedReferrals }>(
      "/referrals/mes-filleuls",
      { params }
    );
    return data.data;
  },

  async getMyStats() {
    const { data } = await api.get<{ data: ReferralStats }>(
      "/referrals/mes-stats"
    );
    return data.data;
  },

  async getMySponsor() {
    const { data } = await api.get<{ data: MySponsorResponse | null }>(
      "/referrals/mon-parrain"
    );
    return data.data;
  },

  async getById(referralId: string) {
    const { data } = await api.get<{ data: ReferralWithFilleul }>(
      `/referrals/${referralId}`
    );
    return data.data;
  },
};

export type ReferralService = typeof referralService;