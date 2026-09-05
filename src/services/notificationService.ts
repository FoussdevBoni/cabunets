// services/notificationService.ts
import Notification, { INotification } from "../models/Notification";

export const notificationService = {
  async getNotifications(query: any): Promise<INotification[]> {
    return await Notification.find(query).sort({ createdAt: -1 });
  },

  async getNotificationById(id: string): Promise<INotification | null> {
    return await Notification.findById(id);
  },

  async createNotification(data: Partial<INotification>): Promise<INotification> {
    const notification = new Notification(data);
    return await notification.save();
  },

  async updateNotification(id: string, data: Partial<INotification>): Promise<INotification | null> {
    return await Notification.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true }
    );
  },

  async deleteNotification(id: string): Promise<INotification | null> {
    return await Notification.findByIdAndDelete(id);
  },

  async deleteManyNotifications(ids: string[]): Promise<any> {
    return await Notification.deleteMany({ _id: { $in: ids } });
  },

  async getTodayNotifications(): Promise<INotification[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return await Notification.find({
      createdAt: {
        $gte: today,
        $lt: tomorrow,
      },
    }).sort({ createdAt: -1 });
  },

  async getNotificationsByType(type: string): Promise<INotification[]> {
    return await Notification.find({ type }).sort({ createdAt: -1 });
  },

  async getNotificationsByReceiver(userId: string): Promise<INotification[]> {
    return await Notification.find({
      $or: [
        { type: "general" },
        { type: "private", receivers: userId },
        { type: "whatsapp", receivers: userId }
      ]
    }).sort({ createdAt: -1 });
  },

  async getNotificationsByDateRange(startDate: Date, endDate: Date): Promise<INotification[]> {
    return await Notification.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate,
      },
    }).sort({ createdAt: -1 });
  },

  async getStats(): Promise<any> {
    const stats = await Notification.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
        },
      },
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayNotifications = await Notification.find({
      createdAt: {
        $gte: today,
        $lt: tomorrow,
      },
    });

    return {
      stats,
      todayCount: todayNotifications.length,
      total: await Notification.countDocuments(),
    };
  },

  async markAsRead(notificationId: string, userId: string): Promise<INotification | null> {
    return await Notification.findByIdAndUpdate(
      notificationId,
      {
        $addToSet: { readBy: userId },
        updatedAt: new Date()
      },
      { new: true }
    );
  },

  async markAllAsRead(userId: string): Promise<any> {
    return await Notification.updateMany(
      {
        $or: [
          { type: "general" },
          { receivers: userId }
        ],
        readBy: { $ne: userId }
      },
      {
        $addToSet: { readBy: userId }
      }
    );
  },

  async isRead(notificationId: string, userId: string): Promise<boolean> {
    const notification = await Notification.findOne({
      _id: notificationId,
      readBy: userId
    });
    return !!notification;
  },

  async markWhatsAppSent(
    id: string,
    data: { sent: boolean; sentAt: Date | null; sentCount: number; failedCount: number } 
  ): Promise<INotification | null> {
    return await Notification.findByIdAndUpdate(
      id,
      {
        whatsappSent: data.sent,
        whatsappSentAt: data.sentAt,
        updatedAt: new Date(),
      },
      { new: true }
    );
  },

  async resetWhatsAppStatus(id: string): Promise<INotification | null> {
    return await Notification.findByIdAndUpdate(
      id,
      {
        whatsappSent: false,
        whatsappSentAt: null,
        updatedAt: new Date(),
      },
      { new: true }
    );
  },
};