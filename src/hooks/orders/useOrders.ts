// src/hooks/useOrders.ts
import { Order } from '../../utils/database'
import { dataService, QueryFilters } from '../../services/dataService'
import { useData } from '../data/useData'
import axios from 'axios'
import { API_URL } from '../../utils/api'



export interface PredictCorrespondentResponse {
    success: boolean
    data: {
        correspondent: string
        country: string
    }
}

export interface InitiatePaymentPayload {
    appId: string
    clientReference: string
    amount: string
    currency: string
    phone: string
    correspondent: string
    country: string
    callbackUrl: string
    description?: string
}

export interface InitiatePaymentResponse {
    success: boolean
    message: string
    data: {
        depositId: string
        status: string
        pawaResponse?: any
    }
}

export const baseService = dataService<Order>('orders')

export const ordersService = {
    ...baseService,

    /**
     * 1. Détecter l'opérateur (Correspondent) à partir du numéro de téléphone
     */
    predictCorrespondent: async (phoneNumber: string): Promise<PredictCorrespondentResponse> => {
        try {
            const response = await axios.post<PredictCorrespondentResponse>(
                `${API_URL}/payments/predict-correspondent`,
                { phoneNumber }
            )
            return response.data
        } catch (error: any) {
            console.error('[ordersService] Erreur predictCorrespondent:', error?.response?.data || error.message)
            throw new Error(error?.response?.data?.error || 'Impossible de détecter l\'opérateur')
        }
    },

    /**
     * 2. Initier un paiement mobile money
     */
    initiatePayment: async (payload: InitiatePaymentPayload): Promise<InitiatePaymentResponse> => {
        try {
            const response = await axios.post<InitiatePaymentResponse>(
                `${API_URL}/payments/initiate-payment`,
                payload
            )
            return response.data
        } catch (error: any) {
            console.error('[ordersService] Erreur initiatePayment:', error?.response?.data || error.message)
            throw new Error(error?.response?.data?.error || 'Erreur lors de l\'initiation du paiement')
        }
    },

    /**
     * 3. Vérifier le statut d'un paiement (par référence ou depositId)
     */
    getPaymentStatus: async (referenceOrId: string): Promise<any> => {
        try {
            const response = await axios.get(
                `${API_URL}/payments/payment-status/${referenceOrId}`
            )
            return response.data
        } catch (error: any) {
            console.error('[ordersService] Erreur getPaymentStatus:', error?.response?.data || error.message)
            throw new Error(error?.response?.data?.error || 'Échec de la récupération du statut')
        }
    }
}

interface Props {
    filters?: QueryFilters
}

export default function useOrders({ filters }: Props) {
    return useData<Order>(ordersService, filters)
}