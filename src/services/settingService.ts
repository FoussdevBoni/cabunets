// services/settingService.ts
import axios from "axios";
import { API_URL } from "../utils/api";

export const settingService = {
  async getSettings() {
    try {
      const response = await axios.get(`${API_URL}/settings`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  async updateCommission(commissionRate: number) {
    try {
      const response = await axios.put(`${API_URL}/settings/commission`, {
        commissionRate
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  async updateExchangeRate(currency: string, rate: number) {
    try {
      const response = await axios.put(`${API_URL}/settings/rates`, {
        currency,
        rate
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  async updateDefaultCurrency(currency: string) {
    try {
      const response = await axios.put(`${API_URL}/settings/currency`, {
        currency
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  async updateWithdrawalLimits(minAmount: number, maxAmount: number) {
    try {
      const response = await axios.put(`${API_URL}/settings/limits`, {
        minAmount,
        maxAmount
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }
};