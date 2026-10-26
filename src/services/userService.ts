// services/userService.ts
import axios from "axios";
import { API_URL } from "../utils/api";
import { User } from "../utils/database";
import { dataService, QueryFilters } from "./dataService";

// ============================================================
// TYPES
// ============================================================

export interface UserListFilters extends QueryFilters {
  page?: number;
  limit?: number;
  role?: "client" | "vendeur" | "admin";
  isActive?: boolean;
  isVerified?: boolean;
  search?: string;
  day?: boolean;
  week?: boolean;
  month?: boolean;
  year?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface UserListResponse {
  data: (User & { id: string })[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserStats {
  total: number;
  clients: number;
  vendeurs: number;
  admins: number;
  verified: number;
  active: number;
  inactive: number;
}

// ============================================================
// BASE SERVICE
// ============================================================

export const baseService = dataService<User>("users");

// ============================================================
// USER SERVICE
// ============================================================

export const userService = {
  ...baseService,

  // ----------------------------------------------------------
  // Vérifier un utilisateur
  // ----------------------------------------------------------
  verifyUser: async (userId: string, token?: string): Promise<any> => {
    try {
      const t = token ?? localStorage.getItem("token") ?? undefined;
      const response = await axios.patch(
        `${API_URL}/users/${userId}/verify`,
        {},
        { headers: t ? { Authorization: `Bearer ${t}` } : undefined }
      );
      return response.data;
    } catch (error: any) {
      console.error(
        "[userService] Erreur verifyUser:",
        error?.response?.data || error.message
      );
      throw error;
    }
  },

  // ----------------------------------------------------------
  // Activer / désactiver
  // ----------------------------------------------------------
  toggleUserStatus: async (
    userId: string,
    isActive?: boolean,
    token?: string
  ): Promise<any> => {
    try {
      const t = token ?? localStorage.getItem("token") ?? undefined;
      const response = await axios.patch(
        `${API_URL}/users/${userId}/toggle-status`,
        { isActive },
        { headers: t ? { Authorization: `Bearer ${t}` } : undefined }
      );
      return response.data;
    } catch (error: any) {
      console.error(
        "[userService] Erreur toggleUserStatus:",
        error?.response?.data || error.message
      );
      throw error;
    }
  },

  // ----------------------------------------------------------
  // 🆕 Liste paginée + filtres
  // ----------------------------------------------------------
  getAllPaginated: async (
    filters: UserListFilters = {},
    token?: string
  ): Promise<UserListResponse> => {
    try {
      const params: Record<string, any> = {};
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") params[k] = v;
      });

      const res = await axios.get(`${API_URL}/users`, {
        params,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      const raw = res.data;
      const data = Array.isArray(raw?.data)
        ? raw.data.map((doc: any) => ({ ...doc, id: doc._id }))
        : [];

      return {
        data,
        total: raw?.total ?? data.length,
        page: raw?.page ?? 1,
        limit: raw?.limit ?? data.length,
        totalPages: raw?.totalPages ?? 1,
      };
    } catch (error: any) {
      console.error(
        "[userService] Erreur getAllPaginated:",
        error?.response?.data || error.message
      );
      throw error;
    }
  },

  // ----------------------------------------------------------
  // 🆕 Stats (mêmes filtres que la liste)
  // ----------------------------------------------------------
  getStats: async (
    filters: UserListFilters = {},
    token?: string
  ): Promise<UserStats> => {
    try {
      const { page, limit, ...rest } = filters;
      const params: Record<string, any> = {};
      Object.entries(rest).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") params[k] = v;
      });

      const res = await axios.get(`${API_URL}/users/stats`, {
        params,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      return res.data;
    } catch (error: any) {
      console.error(
        "[userService] Erreur getStats:",
        error?.response?.data || error.message
      );
      throw error;
    }
  },
};