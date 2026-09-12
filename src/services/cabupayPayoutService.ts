// services/cabupayPayoutService.ts
import axios from 'axios';

export interface CreatePayoutDTO {
  amount: string;
  currency: string;
  phone: string;
  correspondent: string;
  clientReference?: string;
  description?: string;
  callbackUrl?: string;
}

export interface InitiatePayoutResponse {
  success: boolean;
  message: string;
  data: {
    payoutId: string;
    status: string;
    pawaResponse?: any;
  };
}

export interface PayoutWebhookPayload {
  clientReference?: string;
  payoutId: string;
  status: 'COMPLETED' | 'FAILED' | 'PROCESSING' | string;
  failureReason?: string;
  providerTransactionId?: string;
  amount?: string;
  currency?: string;
  phone?: string;
  correspondent?: string;
}

export interface PayoutRecipient {
  type: string;
  accountDetails: {
    phoneNumber: string;
    provider: string;
  };
}


export interface DirectPayout {
  payoutId: string;
  status: string;
  amount: string;
  currency: string;
  country: string;
  recipient: PayoutRecipient;
  customerMessage: string;
  created: string;
  providerTransactionId: string;
};
export class CabupayPayoutService {
  private baseUrl = process.env.CABUPAY_URL || 'https://cabupay-production.up.railway.app/v1';
  private payoutsUrl = `${this.baseUrl}/payouts`;
  private sharedSecret = process.env.INTERNAL_SHARED_SECRET || 'fallback_secret';
  private callbackUrl = process.env.BASE_URL || 'https://cabunets-production.up.railway.app';

  /**
   * 2. Initier un retrait
   */
  public async initiatePayout(payload: CreatePayoutDTO): Promise<InitiatePayoutResponse> {

    try {
      console.log('[CabupayPayoutService] Envoi de la demande d\'initiation...', payload.clientReference);

      const response = await axios.post(`${this.payoutsUrl}/initiate`, {
        ...payload,
        callbackUrl: `${this.callbackUrl}/api/retraits/cabupay-callback`,

      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      console.log('[CabupayPayoutService] Retrait initié avec succès !');
      return response.data;
    } catch (error: any) {
      if (error.response) {
        console.error('[CabupayPayoutService] Rejet par le serveur:', error.response.data);
        throw new Error(error.response.data?.error || error.response.data?.message || 'Erreur lors de l\'initiation du retrait');
      } else if (error.request) {
        console.error('[CabupayPayoutService] Aucune réponse du serveur (Timeout)');
        throw new Error('Le service Cabupay est injoignable (Timeout réseau)');
      } else {
        console.error('[CabupayPayoutService] Erreur de configuration:', error.message);
        throw new Error(error.message);
      }
    }
  }

  /**
   * 3. Récupérer l'état d'un retrait (par payoutId ou clientReference)
   */
  public async getPayout(referenceOrId: string): Promise<any> {
    try {
      console.log(`[CabupayPayoutService] Vérification du statut pour: ${referenceOrId}`);

      const response = await axios.get(`${this.payoutsUrl}/${referenceOrId}`, {
        timeout: 5000,
      });

      return response.data;
    } catch (error: any) {
      if (error.response) {
        console.error('[CabupayPayoutService] Erreur lors de la récupération:', error.response.data);
        throw new Error(error.response.data?.error || 'Retrait introuvable');
      }
      throw new Error(`[CabupayPayoutService] Échec de la vérification du statut: ${error.message}`);
    }
  }

  /**
   * 4. Récupérer un retrait directement depuis PawaPay (sans BDD)
   */
  public async getPayoutDirect(payoutId: string): Promise<{
    success: boolean;
    data: DirectPayout
  }> {
    try {
      console.log(`[CabupayPayoutService] Récupération directe depuis PawaPay: ${payoutId}`);

      const response = await axios.get(`${this.payoutsUrl}/deposite/${payoutId}`, {
        timeout: 5000,
      });

      return {
        success: response.data.success,
        data: response?.data?.data?.data
      };
    } catch (error: any) {
      if (error.response) {
        console.error('[CabupayPayoutService] Erreur lors de la récupération directe:', error.response.data);
        throw new Error(error.response.data?.error || 'Retrait introuvable chez PawaPay');
      }
      throw new Error(`[CabupayPayoutService] Échec de la récupération directe: ${error.message}`);
    }
  }

  /**
   * 5. Demander à PawaPay de renvoyer le callback d'un retrait
   */
  public async resendPayoutCallback(payoutId: string): Promise<any> {
    try {
      console.log(`[CabupayPayoutService] Demande de renvoi de callback pour: ${payoutId}`);

      const response = await axios.post(
        `${this.payoutsUrl}/resend-callback`,
        { payoutId },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      console.log('[CabupayPayoutService] Callback renvoyé avec succès !');
      return response.data;
    } catch (error: any) {
      if (error.response) {
        console.error('[CabupayPayoutService] Rejet lors du renvoi:', error.response.data);
        throw new Error(error.response.data?.error || error.response.data?.message || 'Erreur lors du renvoi du callback');
      } else if (error.request) {
        console.error('[CabupayPayoutService] Aucune réponse du serveur (Timeout)');
        throw new Error('Le service Cabupay est injoignable (Timeout réseau)');
      } else {
        console.error('[CabupayPayoutService] Erreur de configuration:', error.message);
        throw new Error(error.message);
      }
    }
  }

  /**
   * 6. Vérifier et parser le Webhook entrant
   */
  public handleWebhookNotification(
    payload: PayoutWebhookPayload,
    signatureHeader?: string
  ): PayoutWebhookPayload {
    if (signatureHeader && signatureHeader !== this.sharedSecret) {
      throw new Error('Signature du Webhook invalide ou corrompue');
    }

    console.log(`[CabupayPayoutService Webhook] Notification reçue pour Payout: ${payload.payoutId} | Statut: ${payload.status}`);

    return payload;
  }
}

export const cabupayPayoutService = new CabupayPayoutService();