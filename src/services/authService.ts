import axios from "axios";
import { AuthResponse, CurrentUser, Profile, User, UserBase } from "../utils/database";
import { API_URL } from "../utils/api";


export type Role = User["role"];




export const authService = {
  async register(
    email: string,
    password: string,
    username: string,
    avatar: string,
    role: Role,
    profileData?: Partial<Profile>
  ): Promise<AuthResponse> {
    try {
      const { data } = await axios.post(`${API_URL}/auth/register`, {
        email,
        password,
        role,
        username,
        avatar,
        profileData,
      });
      return data;
    } catch (error) {
      console.error(error)
      throw error
    }
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await axios.post(`${API_URL}/auth/login`, { email, password });

    return data;
  },

  async getUserProfile(token: string): Promise<CurrentUser> {
    const { data } = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return {
      ...data,
      profile: {
        ...data.profile,
        id: data.profile?.id
      }
    }
  },


  getAuthError(error: any) {
    return error?.response?.data?.message || "Une erreur s'est produite. Veillez réessayer"
  },

  async logout() {
    // Côté backend, le logout JWT est stateless
    // On peut juste supprimer le token côté frontend
    return true;
  },

  async updateUser(token: string, userId: string,
    userBaseData: Partial<UserBase>, userProfile: Profile) {

    const updatedUser = {
      avatar: userBaseData.avatar,
      username: userBaseData.username,
      profileData: userProfile
    }
    try {
      await axios.put(`${API_URL}/auth/${userId}`, updatedUser, {
        headers: { Authorization: `Bearer ${token}` },
      })
    } catch (error) {
      throw error
    }
  },

  // === Demande reset password OTP ===
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const { data } = await axios.post(`${API_URL}/auth/request-reset-password`, { email });
    return data;
  },

  // === Réinitialisation mot de passe avec OTP ===
  async resetPasswordWithOtp(email: string, otp: string, newPassword: string): Promise<{ message: string }> {
    const { data } = await axios.post(`${API_URL}/auth/reset-password`, { email, otp, newPassword });
    return data;
  },

};
