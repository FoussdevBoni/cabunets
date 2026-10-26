// src/services/authService.ts

import api from "../utils/api";
import {
  AuthResponse,
  CurrentUser,
  Profile,
  User,
  UserBase,
} from "../types/User";

export type Role = User["role"];

export interface RegisterPayload {
  email: string;
  password: string;
  username?: string;
  avatar?: string;
  role?: Role;
  telephone?: string;
  becomeAffiliate?: boolean;
  referralCode?: string;
  profileData?: Partial<Profile>;
}

export const authService = {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    try {
      const { data } = await api.post<AuthResponse>("/auth/register", {
        email: payload.email,
        password: payload.password,
        role: payload.role ?? "client",
        username: payload.username,
        avatar: payload.avatar,
        telephone: payload.telephone,
        becomeAffiliate: payload.becomeAffiliate,
        referralCode: payload.referralCode,
        profileData: payload.profileData,
      });
      return data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>("/auth/login", {
      email,
      password,
    });
    return data;
  },

  async getUserProfile(): Promise<CurrentUser> {
    const { data } = await api.get<CurrentUser>("/auth/me");
    return {
      ...data,
      profile: {
        ...data.profile,
      },
    };
  },

  getAuthError(error: any) {
    return (
      error?.response?.data?.message ||
      (error?.response?.status ? "Impossible de charger votre session (HTTP " + error.response.status + ")." : error?.message) ||
      "Une erreur s'est produite. Veuillez réessayer"
    );
  },

  async logout() {
    // Côté backend, le logout JWT est stateless
    return true;
  },

  async updateUser(
    userId: string,
    userBaseData: Partial<UserBase>,
    userProfile: Profile
  ) {
    const updatedUser = {
      avatar: userBaseData.avatar,
      username: userBaseData.username,
      profileData: userProfile,
    };
    const { data } = await api.put(`/auth/${userId}`, updatedUser);
    return data;
  },

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const { data } = await api.post<{ message: string }>(
      "/auth/request-reset-password",
      { email }
    );
    return data;
  },

  async resetPasswordWithOtp(
    email: string,
    otp: string,
    newPassword: string
  ): Promise<{ message: string }> {
    const { data } = await api.post<{ message: string }>(
      "/auth/reset-password",
      { email, otp, newPassword }
    );
    return data;
  },
};