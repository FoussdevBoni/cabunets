import axios from 'axios';

export interface CreateDepositDTO {
  appId: string;
  clientReference: string;
  amount: string;
  currency: string;
  phone: string;
  correspondent: string; 
  country: string;       
  callbackUrl: string;   
  description?: string;
}

class CabupayService {
  private cabupayUrl = process.env.CABUPAY_SERVICE_URL || 'https://cabupay-production.up.railway.app/v1/payments';

  /**
   * Envoie la demande de débit au microservice cabupay
   */
  public async requestPayment(data: CreateDepositDTO): Promise<any> {
    try {
      const response = await axios.post(`${this.cabupayUrl}/initiate`, data, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      return response.data;
    } catch (error: any) {
      console.error("[cabupayService] Erreur lors de l'appel au microservice :", error.response?.data || error.message);
      throw new Error(error.response?.data?.error || "Impossible de joindre le service de paiement.");
    }
  }
}

export const cabupayService = new CabupayService();