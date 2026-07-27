import axios from 'axios';

export interface OrderNotificationData {
  vendeurName: string;
  vendeurPhone: string;
  orderRef: string;
  network: string;
  units: number | string;
  price: number | string;
  currency: string;
  customerPhone: string;
}

export class CabupayWhatsappService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl =
      process.env.CABUPAY_WHATSAPP_API_URL ||
      'https://cabupay-production.up.railway.app';
  }

  /**
   * Notifie le vendeur par WhatsApp lorsqu'une nouvelle commande est validée.
   */
  async notifyNewOrder(data: OrderNotificationData): Promise<boolean> {
    try {
      const payload = {
        to: data.vendeurPhone,
        templateName: 'nouvelle_commande_cabunets',
        headerVariables: {
          order_ref: data.orderRef,
        },
        bodyVariables: {
          vendeur_name: data.vendeurName,
          network: data.network,
          units: data.units,
          price: data.price,
          currency: data.currency,
          phone_number: data.customerPhone,
        },
        languageCode: 'fr',
      };

      const response = await axios.post(
        `${this.baseUrl}/v1/whatsapp/send`, // <-- Corrected path to /v1
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      if (response.data?.success) {
        console.log(
          `✅ Notification WhatsApp envoyée à ${data.vendeurPhone} (${data.orderRef})`
        );
        return true;
      }

      console.warn("⚠️ Réponse inattendue de l'API WhatsApp:", response.data);
      return false;
    } catch (error: any) {
      console.error(
        '❌ Échec envoi notification WhatsApp via Cabupay:',
        error.response?.data || error.message
      );
      return false;
    }
  }
}

export const cabupayWhatsappService = new CabupayWhatsappService();
