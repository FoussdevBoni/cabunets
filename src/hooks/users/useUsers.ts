// src/hooks/useUsers.ts
import { User } from '../../utils/database'
import { dataService, QueryFilters } from '../../services/dataService'
import { useData } from '../data/useData'
import axios from 'axios'
import { API_URL } from '../../utils/api'

export const baseService = dataService<User>('users')

export const userService = {
  ...baseService,
  verifyUser: async (userId: string): Promise<any> => {
    try {
      const response = await axios.patch(
        `${API_URL}/users/${userId}/verify`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      )
      return response.data
    } catch (error: any) {
      console.error('[userService] Erreur verifyUser:', error?.response?.data || error.message)
      throw error
    }
  },
  toggleUserStatus: async (userId: string, isActive?: boolean): Promise<any> => {
    try {
      const response = await axios.patch(
        `${API_URL}/users/${userId}/toggle-status`,
        { isActive },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      )
      return response.data
    } catch (error: any) {
      console.error('[userService] Erreur toggleUserStatus:', error?.response?.data || error.message)
      throw error
    }
  }
}

interface Props {
  filters?: QueryFilters
}

export default function useUsers({ filters }: Props) {
  return useData<User>(userService, filters)
}