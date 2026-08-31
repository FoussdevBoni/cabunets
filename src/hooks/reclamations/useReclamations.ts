// src/hooks/useReclamations.ts
import { dataService, QueryFilters } from '../../services/dataService'
import { useData } from '../data/useData'
import axios from 'axios'
import { API_URL } from '../../utils/api'
import { Reclamation } from '../../types/Reclamation'

export const baseService = dataService<Reclamation>('reclamations')

export const reclamationsService = {
    ...baseService,

    updateStatut: async (
        token: string,
        reclamationId: string,
        statut: Reclamation['statut']
    ): Promise<any> => {
        try {
            const response = await axios.put(
                `${API_URL}/reclamations/${reclamationId}/statut`,
                { statut },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            return response.data
        } catch (error: any) {
            console.error(
                '[reclamationsService] Erreur updateStatut:',
                error?.response?.data || error.message
            )
            throw error
        }
    },

    getTodayReclamations: async (token: string): Promise<any> => {
        try {
            const response = await axios.get(
                `${API_URL}/reclamations/today`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            return response.data
        } catch (error: any) {
            console.error(
                '[reclamationsService] Erreur getTodayReclamations:',
                error?.response?.data || error.message
            )
            throw error
        }
    },

    getReclamationsStats: async (token: string): Promise<any> => {
        try {
            const response = await axios.get(
                `${API_URL}/reclamations/stats`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            return response.data
        } catch (error: any) {
            console.error(
                '[reclamationsService] Erreur getReclamationsStats:',
                error?.response?.data || error.message
            )
            throw error
        }
    },

    getReclamationsByClient: async (token: string, clientId: string): Promise<any> => {
        try {
            const response = await axios.get(
                `${API_URL}/reclamations?clientId=${clientId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            return response.data
        } catch (error: any) {
            console.error(
                '[reclamationsService] Erreur getReclamationsByClient:',
                error?.response?.data || error.message
            )
            throw error
        }
    },

    getReclamationsByStatut: async (token: string, statut: string): Promise<any> => {
        try {
            const response = await axios.get(
                `${API_URL}/reclamations?statut=${statut}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            return response.data
        } catch (error: any) {
            console.error(
                '[reclamationsService] Erreur getReclamationsByStatut:',
                error?.response?.data || error.message
            )
            throw error
        }
    },
}

interface Props {
    filters?: QueryFilters
}

export default function useReclamations({ filters }: Props) {
    return useData<Reclamation>(reclamationsService, filters)
}