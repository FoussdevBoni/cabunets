// src/hooks/useRetraits.ts
import { dataService, QueryFilters } from '../../services/dataService'
import { useData } from '../data/useData'
import axios from 'axios'
import { API_URL } from '../../utils/api'
import { Retrait } from '../../types/Retrait'

export const baseService = dataService<Retrait>('retraits')

export const retraitsService = {
    ...baseService,

    traitRetrait: async (
        token: string,
        retraitId: string,
        status: Retrait['status']
    ): Promise<any> => {
        try {
            const response = await axios.patch(
                `${API_URL}/retraits/trait-retrait/${retraitId}`,
                {
                    status,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            return response.data
        } catch (error: any) {
            console.error(
                '[retraitsService] Erreur traitRetrait:',
                error?.response?.data || error.message
            )
            throw error
        }
    },

    validateRetrait: async (
        token: string,
        retraitId: string
    ): Promise<any> => {
        try {
            const response = await axios.put(
                `${API_URL}/retraits/${retraitId}/validate`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            return response.data
        } catch (error: any) {
            console.error(
                '[retraitsService] Erreur validateRetrait:',
                error?.response?.data || error.message
            )
            throw error
        }
    },

    rejectRetrait: async (
        token: string,
        retraitId: string,
        reason: string
    ): Promise<any> => {
        try {
            const response = await axios.put(
                `${API_URL}/retraits/${retraitId}/reject`,
                { reason },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            return response.data
        } catch (error: any) {
            console.error(
                '[retraitsService] Erreur rejectRetrait:',
                error?.response?.data || error.message
            )
            throw error
        }
    },

    getTodayRetraits: async (token: string): Promise<any> => {
        try {
            const response = await axios.get(
                `${API_URL}/retraits/today`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            return response.data
        } catch (error: any) {
            console.error(
                '[retraitsService] Erreur getTodayRetraits:',
                error?.response?.data || error.message
            )
            throw error
        }
    },

    getRetraitsStats: async (token: string): Promise<any> => {
        try {
            const response = await axios.get(
                `${API_URL}/retraits/stats`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            return response.data
        } catch (error: any) {
            console.error(
                '[retraitsService] Erreur getRetraitsStats:',
                error?.response?.data || error.message
            )
            throw error
        }
    },
}

interface Props {
    filters?: QueryFilters
}

export default function useRetraits({ filters }: Props) {
    return useData<Retrait>(retraitsService, filters)
}