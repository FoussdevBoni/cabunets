// services/adminService.ts
import axios from "axios";
import { API_URL } from "../utils/api";

export interface ManageUserResponse {
  success: boolean;
  message: string;
  data?: {
    adminId: string;
    managedUserId: string;
    managedRole: "client" | "vendeur";
    managedUntil?: string | null;
  };
}

export interface ManagedUser {
  _id: string;
  username?: string;
  email?: string;
  role: "client" | "vendeur";
  avatar?: string;
  isActive?: boolean;
}

export interface StopManagingResponse {
  success: boolean;
  message: string;
}

export interface GetManagedUserResponse {
  managed: ManagedUser | null;
}

export const adminService = {
  /**
   * Démarre une impersonation : l'admin agit en tant que `userId`.
   */
  async manageUser(
    userId: string,
    token: string,
    durationMinutes?: number
  ): Promise<ManageUserResponse> {
    try {
      const response = await axios.post(
        `${API_URL}/admin/manage/${userId}`,
        durationMinutes ? { durationMinutes } : {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error: any) {
      console.error(
        "[adminService] manageUser error:",
        error?.response?.data || error.message
      );
      throw error;
    }
  },

  /**
   * Arrête l'impersonation en cours.
   */
  async stopManaging(token: string): Promise<StopManagingResponse> {
    try {
      const response = await axios.post(
        `${API_URL}/admin/manage/stop`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error: any) {
      console.error(
        "[adminService] stopManaging error:",
        error?.response?.data || error.message
      );
      throw error;
    }
  },

  /**
   * Récupère l'utilisateur actuellement managé (ou null).
   */
  async getManagedUser(token: string): Promise<GetManagedUserResponse> {
    try {
      const response = await axios.get(
        `${API_URL}/admin/manage/current`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error: any) {
      console.error(
        "[adminService] getManagedUser error:",
        error?.response?.data || error.message
      );
      throw error;
    }
  },
};