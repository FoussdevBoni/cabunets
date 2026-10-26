// services/statsService.ts
import axios from "axios";
import { API_URL } from "../utils/api";

// ============================================================
// TYPES
// ============================================================

export interface AdminOverview {
  users: { client: number; vendeur: number; admin: number; total: number };
  totalOffres: number;
  totalVendeurs: number;
  orders: {
    total: number;
    completed: number;
    delivered: number;
    failed: number;
    pending: number;
    revenue: number;
  };
  networks: {
    mostSold: { network: string; count: number; percentage: number } | null;
    top3: { network: string; count: number; percentage: number }[];
  };
  monthly: {
    last: { year: number; month: number; revenue: number } | null;
    previous: { year: number; month: number; revenue: number } | null;
    variation: number;
    history: { year: number; month: number; revenue: number }[];
  };
  dailyRevenue: {
    today: number;
    yesterday: number;
    variation: number;
    history: { date: string; revenue: number }[];
  };
  dailySignups: {
    today: number;
    yesterday: number;
    variation: number;
    history: { date: string; count: number }[];
  };
  registrations: {
    last7Days: { date: string; count: number }[];
    last30Days: { date: string; count: number }[];
  };
  topUsers: {
    vendeurs: TopUser[];
    clients: TopUser[];
  };
}

export interface TopUser {
  _id: string;
  username?: string;
  email: string;
  avatar?: string;
  actionsCount: number;
  loginCount: number;
  lastLoginAt?: string;
}

export interface VendeurOverview {
  orders: {
    total: number;
    pending: number;
    completed: number;
    delivered: number;
    failed: number;
    revenue: number;
  };
  offres: {
    total: number;
    byNetwork: { network: string; count: number }[];
  };
}

// ============================================================
// SERVICE
// ============================================================

export const statsService = {
  async getAdminOverview(token: string): Promise<AdminOverview> {
    try {
      const res = await axios.get(`${API_URL}/stats/admin-overview`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (error: any) {
      console.error(
        "[statsService] getAdminOverview error:",
        error?.response?.data || error.message
      );
      throw error;
    }
  },

  async getVendeurOverview(token: string): Promise<VendeurOverview> {
    try {
      const res = await axios.get(`${API_URL}/stats/vendeur-overview`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (error: any) {
      console.error(
        "[statsService] getVendeurOverview error:",
        error?.response?.data || error.message
      );
      throw error;
    }
  },
};