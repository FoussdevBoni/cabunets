import axios from "axios";
import { API_URL } from "../utils/api";
import { Order } from "../utils/database";
import { dataService, QueryFilters } from "./dataService";
import { alertError } from "../helpers/alertError";

export interface PredictCorrespondentResponse {
  success: boolean;
  data: {
    correspondent: string;
    country: string;
  };
}

export interface InitiatePaymentPayload {
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

export interface OrdersListFilters extends QueryFilters {
  page?: number;
  limit?: number;
  status?: string;
  vendeurId?: string;
  clientId?: string;
  network?: string;
  search?: string;
  day?: boolean;
  week?: boolean;
  month?: boolean;
  year?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface OrdersListResponse {
  data: (Order & { id: string })[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface OrdersStats {
  total: number;
  pending: number;
  completed: number;
  delivered: number;
  failed: number;
  whatsappPending: number;
  ca: number;
}

// ============================================================
// BASE SERVICE (dataService générique)
// ============================================================

export const baseService = dataService<Order>("orders");

// ============================================================
// ORDERS SERVICE
// ============================================================

export const orderService = {
  ...baseService,

  // ----------------------------------------------------------
  // 1. Détecter l'opérateur (Correspondent) à partir du numéro
  // ----------------------------------------------------------
  predictCorrespondent: async (
    phoneNumber: string
  ): Promise<PredictCorrespondentResponse> => {
    try {
      const response = await axios.post<PredictCorrespondentResponse>(
        `${API_URL}/payments/predict-correspondent`,
        { phoneNumber }
      );
      return response.data;
    } catch (error: any) {
      console.error(
        "[ordersService] Erreur predictCorrespondent:",
        error?.response?.data || error.message
      );
      throw new Error(
        error?.response?.data?.error || "Impossible de détecter l'opérateur"
      );
    }
  },

  // ----------------------------------------------------------
  // 2. Initier un paiement mobile money
  // ----------------------------------------------------------
  initiatePayment: async (
    payload: InitiatePaymentPayload
  ): Promise<InitiatePaymentResponse> => {
    try {
      const response = await axios.post<InitiatePaymentResponse>(
        `${API_URL}/payments/initiate-payment`,
        payload
      );
      return response.data;
    } catch (error: any) {
      console.error(
        "[ordersService] Erreur initiatePayment:",
        error?.response?.data || error.message
      );
      throw new Error(
        error?.response?.data?.error || "Erreur lors de l'initiation du paiement"
      );
    }
  },

  // ----------------------------------------------------------
  // 3. Vérifier le statut d'un paiement
  // ----------------------------------------------------------
  getPaymentStatus: async (referenceOrId: string): Promise<any> => {
    try {
      const response = await axios.get(
        `${API_URL}/payments/payment-status/${referenceOrId}`
      );
      return response.data;
    } catch (error: any) {
      console.error(
        "[ordersService] Erreur getPaymentStatus:",
        error?.response?.data || error.message
      );
      throw new Error(
        error?.response?.data?.error || "Échec de la récupération du statut"
      );
    }
  },

  // ----------------------------------------------------------
  // 4. Sync order status (public)
  // ----------------------------------------------------------
  syncOrderStatus: async (orderId: string): Promise<any> => {
    try {
      const response = await axios.get(
        `${API_URL}/orders/sync-status/${orderId}`
      );
      return response.data;
    } catch (error: any) {
      console.error(
        "[ordersService] Erreur syncOrderStatus:",
        error?.response?.data || error.message
      );
      throw new Error(
        error?.response?.data?.error || "Échec de la récupération du statut"
      );
    }
  },

  // ----------------------------------------------------------
  // 5. Traiter une commande (auth)
  // ----------------------------------------------------------
  traitOrder: async (token: string, orderId: string): Promise<any> => {
    try {
      const response = await axios.get(
        `${API_URL}/orders/trait-order/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error(
        "[ordersService] Erreur traitOrder:",
        error?.response?.data || error.message
      );
      throw error;
    }
  },

  // ----------------------------------------------------------
  // 6. Livrer une commande (auth)
  // ----------------------------------------------------------
  deliverOrder: async (token: string, orderId: string): Promise<any> => {
    if (!token || !orderId) {
      alertError("Une erreur s'est produite. Veuillez vous reconnecter");
      return;
    }
    try {
      const response = await axios.get(
        `${API_URL}/orders/deliver-order/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error(
        "[ordersService] Erreur deliverOrder:",
        error?.response?.data || error.message
      );
      throw error;
    }
  },

  // ----------------------------------------------------------
  // 7. Récupérer un dépôt (auth)
  // ----------------------------------------------------------
  getDeposit: async (token: string, depositId: string): Promise<any> => {
    try {
      const response = await axios.get(
        `${API_URL}/payments/deposit/${depositId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error(
        "[ordersService] Erreur getDeposit:",
        error?.response?.data || error.message
      );
      throw error;
    }
  },

  // ----------------------------------------------------------
  // 8. Envoyer les WhatsApp en attente
  // ----------------------------------------------------------
  sendPendingWhatsApp: async (token: string) => {
    try {
      const response = await axios.get(
        `${API_URL}/orders/whatsapp/send-pending`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error(`[ordersService] Erreur sendPendingWhatsApp:`, error.response);
      throw error;
    }
  },

  // ----------------------------------------------------------
  // 9. 🆕 Liste paginée + filtres étendus
  // ----------------------------------------------------------
  getAllPaginated: async (
    filters: OrdersListFilters = {},
    token?: string
  ): Promise<OrdersListResponse> => {
    try {
      const params: Record<string, any> = {};
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") params[k] = v;
      });

      const res = await axios.get(`${API_URL}/orders`, {
        params,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      const raw = res.data;
      const data = Array.isArray(raw?.data)
        ? raw.data.map((doc: any) => ({ ...doc, id: doc._id }))
        : [];

      return {
        data,
        total: raw?.total ?? data.length,
        page: raw?.page ?? 1,
        limit: raw?.limit ?? data.length,
        totalPages: raw?.totalPages ?? 1,
      };
    } catch (error: any) {
      
      console.error(
        "[ordersService] Erreur getAllPaginated:",
        error?.response?.data || error.message
      );
      throw error;
    }
  },

  // ----------------------------------------------------------
  // 10. 🆕 Stats (mêmes filtres que la liste)
  // ----------------------------------------------------------
  getStats: async (
    filters: OrdersListFilters = {},
    token?: string
  ): Promise<OrdersStats> => {
    try {
      // page/limit inutiles pour les stats
      const { page, limit, ...rest } = filters;
      const params: Record<string, any> = {};
      Object.entries(rest).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") params[k] = v;
      });

      const res = await axios.get(`${API_URL}/orders/stats`, {
        params,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      return res.data;
    } catch (error: any) {
      console.error(
        "[ordersService] Erreur getStats:",
        error?.response?.data || error.message
      );
      throw error;
    }
  },
};