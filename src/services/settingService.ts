// services/settingService.ts
import axios from "axios";
import { API_URL } from "../utils/api";

function authConfig(token?: string) {
  if (!token) throw new Error("Veuillez vous connecter comme administrateur.");
  return { headers: { Authorization: "Bearer " + token } };
}

export const settingService = {
  async getSettings() {
    try {
      const response = await axios.get(`${API_URL}/settings`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  async updateCommission(commissionRate: number, token?: string) {
    try {
      const response = await axios.put(`${API_URL}/settings/commission`, {
        commissionRate
      }, authConfig(token));
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  async updateExchangeRate(currency: string, rate: number, token?: string) {
    try {
      const response = await axios.put(`${API_URL}/settings/rates`, {
        currency,
        rate
      }, authConfig(token));
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  async updateDefaultCurrency(currency: string, token?: string) {
    try {
      const response = await axios.put(`${API_URL}/settings/currency`, {
        currency
      }, authConfig(token));
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  async updateWithdrawalLimits(minAmount: number, maxAmount: number, token?: string) {
    try {
      const response = await axios.put(`${API_URL}/settings/limits`, {
        minAmount,
        maxAmount
      }, authConfig(token));
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }
};