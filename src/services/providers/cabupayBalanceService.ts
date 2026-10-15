// services/cabupayBalanceService.ts
import axios from 'axios';

export interface WalletBalance {
  country: string;
  balance: string;
  currency: string;
}

export interface BalanceResponse {
  success: boolean;
  data: WalletBalance[];
}

export class CabupayBalanceService {
  private baseUrl = process.env.CABUPAY_URL || 'https://cabupay-production.up.railway.app/v1';
  private balancesUrl = `${this.baseUrl}/balances`;

  /**
   * 1. Récupérer tous les soldes de wallets
   */
  public async getAllBalances(): Promise<BalanceResponse> {
    try {
      console.log('[CabupayBalanceService] Récupération de tous les soldes...');

      const response = await axios.get(this.balancesUrl, {
        timeout: 10000,
      });

      console.log('[CabupayBalanceService] Soldes récupérés avec succès !');
      return response.data;
    } catch (error: any) {
      if (error.response) {
        console.error('[CabupayBalanceService] Rejet par le serveur:', error.response.data);
        throw new Error(error.response.data?.error || error.response.data?.message || 'Erreur lors de la récupération des soldes');
      } else if (error.request) {
        console.error('[CabupayBalanceService] Aucune réponse du serveur (Timeout)');
        throw new Error('Le service Cabupay est injoignable (Timeout réseau)');
      } else {
        console.error('[CabupayBalanceService] Erreur de configuration:', error.message);
        throw new Error(error.message);
      }
    }
  }

  /**
   * 2. Récupérer les soldes d'un pays spécifique
   */
  public async getBalancesByCountry(country: string): Promise<BalanceResponse> {
    try {
      console.log(`[CabupayBalanceService] Récupération des soldes pour: ${country}`);

      const response = await axios.get(`${this.balancesUrl}/${country}`, {
        timeout: 5000,
      });

      return response.data;
    } catch (error: any) {
      if (error.response) {
        console.error('[CabupayBalanceService] Erreur lors de la récupération:', error.response.data);
        throw new Error(error.response.data?.error || 'Soldes introuvables pour ce pays');
      }
      throw new Error(`[CabupayBalanceService] Échec de la récupération: ${error.message}`);
    }
  }

  /**
   * 3. Récupérer le solde d'une devise spécifique dans un pays
   */
  public async getBalanceByCurrency(country: string, currency: string): Promise<WalletBalance | null> {
    try {
      console.log(`[CabupayBalanceService] Récupération du solde ${currency} pour ${country}`);

      const response = await axios.get(`${this.balancesUrl}/${country}/${currency}`, {
        timeout: 5000,
      });

      return response.data?.data || null;
    } catch (error: any) {
      if (error.response) {
        console.error('[CabupayBalanceService] Erreur lors de la récupération:', error.response.data);
        throw new Error(error.response.data?.error || 'Solde introuvable');
      }
      throw new Error(`[CabupayBalanceService] Échec de la récupération: ${error.message}`);
    }
  }
}

export const cabupayBalanceService = new CabupayBalanceService();