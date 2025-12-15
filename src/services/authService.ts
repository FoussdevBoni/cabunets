import axios from "axios";
import { AuthResponse, CurrentUser, Profile, User } from "../utils/database";


export type Role = User["role"];



const API_BASE = "http://localhost:5000/api";

export const authService = {
  async register(
    email: string,
    password: string,
    role: Role,
    profileData?: Partial<Profile>
  ): Promise<AuthResponse> {
    try {
      const { data } = await axios.post(`${API_BASE}/auth/register`, {
        email,
        password,
        role,
        profileData,
      });
      return data;
    } catch (error) {
      console.error(error)
      throw error
    }
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const { data } = await axios.post(`${API_BASE}/auth/login`, { email, password });

    return data;
  },

  async getUserProfile(token: string): Promise<CurrentUser> {
    const { data } = await axios.get(`${API_BASE}/auth/me`, {
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
};
