// services/notificationService.ts
import axios from 'axios';
import { API_URL } from '../utils/api';
import { Notification } from '../types/Notification';

export interface QueryFilters {
  day?: boolean;
  week?: boolean;
  month?: boolean;
  year?: boolean;
  type?: string;
  receiver?: string;
  [key: string]: any;
}

export const notificationService = {
  async getNotifications(filters: QueryFilters = {}, token: string): Promise<Notification[]> {
    try {
      const response = await axios.get(`${API_URL}/notifications`, {
        params: filters,
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      console.error('[notificationService] Erreur getNotifications:', error?.response?.data || error.message);
      throw error;
    }
  },

  async getNotificationById(id: string, token: string): Promise<Notification> {
    try {
      const response = await axios.get(`${API_URL}/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      console.error('[notificationService] Erreur getNotificationById:', error?.response?.data || error.message);
      throw error;
    }
  },

  async getTodayNotifications(token: string): Promise<Notification[]> {
    try {
      const response = await axios.get(`${API_URL}/notifications/today`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      console.error('[notificationService] Erreur getTodayNotifications:', error?.response?.data || error.message);
      throw error;
    }
  },

  async getNotificationsStats(token: string): Promise<any> {
    try {
      const response = await axios.get(`${API_URL}/notifications/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      console.error('[notificationService] Erreur getNotificationsStats:', error?.response?.data || error.message);
      throw error;
    }
  },

  async getUnreadCount(userId: string, token: string): Promise<{ unreadCount: number }> {
    try {
      const response = await axios.get(`${API_URL}/notifications/unread/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      console.error('[notificationService] Erreur getUnreadCount:', error?.response?.data || error.message);
      throw error;
    }
  },

  async getNotificationsByReceiver(userId: string, token: string): Promise<Notification[]> {
    try {
      const response = await axios.get(`${API_URL}/notifications/receiver/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      console.error('[notificationService] Erreur getNotificationsByReceiver:', error?.response?.data || error.message);
      throw error;
    }
  },

  async getNotificationsByType(type: string, token: string): Promise<Notification[]> {
    try {
      const response = await axios.get(`${API_URL}/notifications/type/${type}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      console.error('[notificationService] Erreur getNotificationsByType:', error?.response?.data || error.message);
      throw error;
    }
  },

  async getNotificationsByDateRange(startDate: string, endDate: string, token: string): Promise<Notification[]> {
    try {
      const response = await axios.get(`${API_URL}/notifications/date-range`, {
        params: { startDate, endDate },
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      console.error('[notificationService] Erreur getNotificationsByDateRange:', error?.response?.data || error.message);
      throw error;
    }
  },

  async isRead(notificationId: string, userId: string, token: string): Promise<{ read: boolean }> {
    try {
      const response = await axios.get(`${API_URL}/notifications/${notificationId}/is-read`, {
        params: { userId },
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      console.error('[notificationService] Erreur isRead:', error?.response?.data || error.message);
      throw error;
    }
  },

  async getWhatsAppStatus(notificationId: string, token: string): Promise<any> {
    try {
      const response = await axios.get(`${API_URL}/notifications/${notificationId}/whatsapp-status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      console.error('[notificationService] Erreur getWhatsAppStatus:', error?.response?.data || error.message);
      throw error;
    }
  },

  async resendWhatsApp(notificationId: string, token: string): Promise<any> {
    try {
      const response = await axios.post(`${API_URL}/notifications/${notificationId}/resend-whatsapp`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(response.data)
      return response.data;
    } catch (error: any) {
      console.error('[notificationService] Erreur resendWhatsApp:', error?.response?.data || error.message);
      throw error;
    }
  },

  async createNotification(data: Partial<Notification>, token: string): Promise<Notification> {
    try {
      const response = await axios.post(`${API_URL}/notifications`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      console.error('[notificationService] Erreur createNotification:', error?.response?.data || error.message);
      throw error;
    }
  },

  async updateNotification(id: string, data: Partial<Notification>, token: string): Promise<Notification> {
    try {
      const response = await axios.put(`${API_URL}/notifications/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      console.error('[notificationService] Erreur updateNotification:', error?.response?.data || error.message);
      throw error;
    }
  },

  async deleteNotification(id: string, token: string): Promise<any> {
    try {
      const response = await axios.delete(`${API_URL}/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      console.error('[notificationService] Erreur deleteNotification:', error?.response?.data || error.message);
      throw error;
    }
  },

  async deleteManyNotifications(ids: string[], token: string): Promise<any> {
    try {
      const response = await axios.post(`${API_URL}/notifications/delete-many`, { ids }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      console.error('[notificationService] Erreur deleteManyNotifications:', error?.response?.data || error.message);
      throw error;
    }
  },

  async markAsRead(notificationId: string, userId: string, token: string): Promise<Notification> {
    try {
      const response = await axios.post(`${API_URL}/notifications/${notificationId}/read`, { userId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      console.error('[notificationService] Erreur markAsRead:', error?.response?.data || error.message);
      throw error;
    }
  },

  async markAllAsRead(userId: string, token: string): Promise<any> {
    try {
      const response = await axios.post(`${API_URL}/notifications/read-all`, { userId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      console.error('[notificationService] Erreur markAllAsRead:', error?.response?.data || error.message);
      throw error;
    }
  },
};