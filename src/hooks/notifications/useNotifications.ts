// hooks/notifications/useNotifications.ts
import { useState, useEffect } from 'react';
import { notificationService, QueryFilters } from '../../services/notificationService';
import useToken from '../auth/useToken';
import { useAuth } from '../auth/useAuth';
import { Notification } from '../../types/Notification';

interface UseNotificationsProps {
  filters?: QueryFilters;
}

export default function useNotifications({ filters }: UseNotificationsProps = {}) {
  const { token } = useToken();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [stats, setStats] = useState<any>(null);

  const refresh = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const notificationsData = await notificationService.getNotifications(filters, token);
      setNotifications(notificationsData);

      if (user?.id) {
        const count = await notificationService.getUnreadCount(user.id, token);
        setUnreadCount(count.unreadCount);
      }

      const statsData = await notificationService.getNotificationsStats(token);
      setStats(statsData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationById = async (id: string) => {
    if (!token) return;
    try {
      return await notificationService.getNotificationById(id, token);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const getTodayNotifications = async () => {
    if (!token) return;
    try {
      return await notificationService.getTodayNotifications(token);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const getNotificationsByReceiver = async (userId: string) => {
    if (!token) return;
    try {
      return await notificationService.getNotificationsByReceiver(userId, token);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const getNotificationsByType = async (type: string) => {
    if (!token) return;
    try {
      return await notificationService.getNotificationsByType(type, token);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const getNotificationsByDateRange = async (startDate: string, endDate: string) => {
    if (!token) return;
    try {
      return await notificationService.getNotificationsByDateRange(startDate, endDate, token);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const isRead = async (notificationId: string) => {
    if (!token || !user?.id) return;
    try {
      return await notificationService.isRead(notificationId, user.id, token);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const getWhatsAppStatus = async (notificationId: string) => {
    if (!token) return;
    try {
      return await notificationService.getWhatsAppStatus(notificationId, token);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const resendWhatsApp = async (notificationId: string) => {
    if (!token) return;
    try {
      const result = await notificationService.resendWhatsApp(notificationId, token);
      await refresh();
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (!token || !user?.id) return;
    try {
      await notificationService.markAsRead(notificationId, user.id, token);
      await refresh();
    } catch (error) {
      console.error(error);
    }
  };

  const markAllAsRead = async () => {
    if (!token || !user?.id) return;
    try {
      await notificationService.markAllAsRead(user.id, token);
      await refresh();
    } catch (error) {
      console.error(error);
    }
  };

  const createNotification = async (data: Partial<Notification>) => {
    if (!token) return;
    try {
      const result = await notificationService.createNotification(data, token);
      await refresh();
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const updateNotification = async (id: string, data: Partial<Notification>) => {
    if (!token) return;
    try {
      const result = await notificationService.updateNotification(id, data, token);
      await refresh();
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const deleteNotification = async (id: string) => {
    if (!token) return;
    try {
      await notificationService.deleteNotification(id, token);
      await refresh();
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const deleteManyNotifications = async (ids: string[]) => {
    if (!token) return;
    try {
      const result = await notificationService.deleteManyNotifications(ids, token);
      await refresh();
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  useEffect(() => {
    refresh();
  }, [token, user?.id, JSON.stringify(filters)]);

  return {
    notifications,
    loading,
    refresh,
    unreadCount,
    stats,
    getNotificationById,
    getTodayNotifications,
    getNotificationsByReceiver,
    getNotificationsByType,
    getNotificationsByDateRange,
    isRead,
    getWhatsAppStatus,
    resendWhatsApp,
    markAsRead,
    markAllAsRead,
    createNotification,
    updateNotification,
    deleteNotification,
    deleteManyNotifications,
  };
}