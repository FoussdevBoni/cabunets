// routes/notificationRoutes.ts
import express from 'express';
import {
  createNotification,
  getNotifications,
  getNotificationById,
  updateNotification,
  deleteNotification,
  deleteManyNotifications,
  getTodayNotifications,
  getNotificationsStats,
  getNotificationsByDateRange,
  getNotificationsByReceiver,
  getNotificationsByType,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  isRead,
  resendWhatsAppNotification,
  getWhatsAppStatus,
} from '../controllers/notificationController';

const router = express.Router();

router.get('/', getNotifications);
router.get('/today', getTodayNotifications);
router.get('/stats', getNotificationsStats);
router.get('/unread/:userId', getUnreadCount);
router.get('/receiver/:userId', getNotificationsByReceiver);
router.get('/type/:type', getNotificationsByType);
router.get('/date-range', getNotificationsByDateRange);
router.get('/:id', getNotificationById);
router.get('/:id/is-read', isRead);
router.get('/:id/whatsapp-status', getWhatsAppStatus);

router.post('/', createNotification);
router.post('/delete-many', deleteManyNotifications);
router.post('/:id/read', markAsRead);
router.post('/read-all', markAllAsRead);
router.post('/:id/resend-whatsapp', resendWhatsAppNotification);

router.put('/:id', updateNotification);

router.delete('/:id', deleteNotification);

export default router;