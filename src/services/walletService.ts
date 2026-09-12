// services/walletService.ts
import axios from "axios";
import { API_URL } from "../utils/api";

export const walletService = {
  /**
   * Récupère le wallet d'un vendeur
   */
  async getWallet(vendeurId: string) {
    try {
      const response = await axios.get(`${API_URL}/wallet/${vendeurId}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Récupère les wallets de tous les vendeurs
   */
  async getAllWallets() {
    try {
      const response = await axios.get(`${API_URL}/wallet/all`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Vérifie si un retrait est possible
   */
  async verifierRetrait(vendeurId: string, amount: number, currency: string = "CDF") {
    try {
      const response = await axios.post(`${API_URL}/wallet/${vendeurId}/check-retrait`, {
        amount,
        currency
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Récupère les taux de change
   */
  async getExchangeRates() {
    try {
      const response = await axios.get(`${API_URL}/wallet/settings/rates`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Met à jour un taux de change (admin)
   */
  async updateExchangeRate(currency: string, rate: number) {
    try {
      const response = await axios.put(`${API_URL}/wallet/settings/rates`, {
        currency,
        rate
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Met à jour la devise d'affichage par défaut (admin)
   */
  async updateDefaultCurrency(currency: string) {
    try {
      const response = await axios.put(`${API_URL}/wallet/settings/default-currency`, {
        currency
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Récupère l'évolution du CA par période
   */
  async getCAEvolution(vendeurId: string, periode: "day" | "week" | "month" = "month") {
    try {
      const response = await axios.get(`${API_URL}/wallet/${vendeurId}/evolution`, {
        params: { periode }
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Récupère l'historique des retraits d'un vendeur
   */
  async getHistoriqueRetraits(vendeurId: string, limit: number = 50) {
    try {
      const response = await axios.get(`${API_URL}/wallet/${vendeurId}/historique`, {
        params: { limit }
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Récupère le solde commission de la plateforme
   */
  async getCabunetWallet() {
    try {
      const response = await axios.get(`${API_URL}/wallet/cabunet`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Récupère tous les soldes PawaPay
   */
  async getPawaPayBalances() {
    try {
      const response = await axios.get(`${API_URL}/wallet/pawapay/balances`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Récupère les soldes PawaPay pour un pays spécifique
   */
  async getPawaPayBalancesByCountry(country: string) {
    try {
      const response = await axios.get(`${API_URL}/wallet/pawapay/balances/${country}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Récupère le solde PawaPay d'une devise spécifique dans un pays
   */
  async getPawaPayBalanceByCurrency(country: string, currency: string) {
    try {
      const response = await axios.get(
        `${API_URL}/wallet/pawapay/balances/${country}/${currency}`
      );
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },
};