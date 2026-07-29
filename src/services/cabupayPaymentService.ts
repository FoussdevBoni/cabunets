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

export interface InitiatePaymentResponse {
  success: boolean;
  message: string;
  data: {
    depositId: string;
    status: string;
    pawaResponse?: any;
  };
}

export interface PredictCorrespondentResponse {
  success: boolean;
  data: {
    correspondent: string;
    country: string;
  };
}

// 📩 Payload envoyé par Cabupay vers le callback de ton application cliente
export interface CabupayWebhookPayload {
  clientReference: string;
  depositId: string;
  status: 'COMPLETED' | 'FAILED' | string;
  failureReason?: string;
  providerTransactionId?: string;
}

export class CabupayPaymentService {
  private baseUrl = process.env.CABUPAY_BASE_URL || 'https://cabupay-production.up.railway.app/v1';
  private paymentsUrl = `${this.baseUrl}/payments`;
  private sharedSecret = process.env.INTERNAL_SHARED_SECRET || 'fallback_secret';

  /**
   * 1. Déterminer l'opérateur (correspondent) à partir d'un numéro de téléphone
   */
  public async predictCorrespondent(phone: string): Promise<PredictCorrespondentResponse> {
    try {
      console.log('[CabupayPaymentService] Prédiction de l\'opérateur pour:', phone);

      const response = await axios.post(
        `${this.baseUrl}/predict-correspondent`,
        { phoneNumber: phone },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 5000,
        }
      );

      console.log('[CabupayPaymentService] Opérateur détecté:', response.data?.data?.correspondent);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        console.error('[CabupayPaymentService] Rejet lors de la prédiction:', error.response.data);
        throw new Error(error.response.data?.error || error.response.data?.message || 'Erreur lors de la détection de l\'opérateur');
      } else if (error.request) {
        console.error('[CabupayPaymentService] Aucune réponse de Cabupay (Timeout)');
        throw new Error('Le service Cabupay est injoignable (Timeout réseau)');
      } else {
        console.error('[CabupayPaymentService] Erreur de prédiction:', error.message);
        throw new Error(error.message);
      }
    }
  }

  /**
   * 2. Initier un dépôt (Paiement Mobile Money via Cabupay)
   */
  public async createDeposit(payload: CreateDepositDTO): Promise<InitiatePaymentResponse> {
    try {
      const body = {
        appId: payload.appId,
        clientReference: payload.clientReference,
        amount: payload.amount,
        currency: payload.currency,
        phone: payload.phone,
        correspondent: payload.correspondent,
        country: payload.country,
        callbackUrl: payload.callbackUrl,
        description: payload.description || 'Paiement',
        payerType: 'MSISDN',
      };

      console.log('[CabupayPaymentService] Envoi de la demande d\'initiation...', body.clientReference);

      const response = await axios.post(`${this.paymentsUrl}/initiate`, body, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      console.log('[CabupayPaymentService] Dépôt initié avec succès !');
      return response.data;
    } catch (error: any) {
      if (error.response) {
        console.error('[CabupayPaymentService] Rejet par le serveur:', error.response.data);
        throw new Error(error.response.data?.error || error.response.data?.message || 'Erreur lors de l\'initiation du paiement');
      } else if (error.request) {
        console.error('[CabupayPaymentService] Aucune réponse de Cabupay (Timeout)');
        throw new Error('Le service Cabupay est injoignable (Timeout réseau)');
      } else {
        console.error('[CabupayPaymentService] Erreur de configuration:', error.message);
        throw new Error(error.message);
      }
    }
  }

  /**
   * 3. Récupérer/Vérifier l'état d'une transaction (par depositId ou clientReference)
   */
  public async getTransactionStatus(referenceOrId: string): Promise<any> {
    try {
      console.log(`[CabupayPaymentService] Vérification du statut pour: ${referenceOrId}`);
      
      const response = await axios.get(`${this.paymentsUrl}/${referenceOrId}`, {
        timeout: 5000,
      });

      return response.data;
    } catch (error: any) {
      if (error.response) {
        console.error('[CabupayPaymentService] Erreur lors de la récupération:', error.response.data);
        throw new Error(error.response.data?.error || 'Transaction introuvable');
      }
      throw new Error(`[CabupayPaymentService] Échec de la vérification du statut: ${error.message}`);
    }
  }

  /**
   * 4. Vérifier et parser le Webhook entrant envoyé par Cabupay vers ton app cliente
   */
  public handleWebhookNotification(
    payload: CabupayWebhookPayload,
    signatureHeader?: string
  ): CabupayWebhookPayload {
    if (signatureHeader && signatureHeader !== this.sharedSecret) {
      throw new Error('Signature du Webhook invalide ou corrompue');
    }

    console.log(`[CabupayPaymentService Webhook] Notification reçue pour Ref: ${payload.clientReference} | Statut: ${payload.status}`);

    return payload;
  }
}

export const cabupayPaymentService = new CabupayPaymentService();