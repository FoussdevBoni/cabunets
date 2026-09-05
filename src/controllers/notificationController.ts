// controllers/notificationController.ts
import { Request, Response } from 'express';
import { notificationService } from '../services/notificationService';
import { cabupayWhatsappService } from '../services/cabupayWhatsappService';
import { Client } from '../models/Client';
import { Vendeur } from '../models/Vendeur';

const sendWhatsAppNotification = async (notificationId: string) => {
    try {
        const notification = await notificationService.getNotificationById(notificationId);
        if (!notification) {
            throw new Error('Notification non trouvée');
        }

        if (notification.type !== "whatsapp") {
            throw new Error('La notification n\'est pas de type WhatsApp');
        }

        if (notification.whatsappSent) {
            throw new Error('La notification WhatsApp a déjà été envoyée');
        }

        const receivers = notification.receivers || [];
        if (receivers.length === 0) {
            throw new Error('Aucun destinataire pour la notification WhatsApp');
        }

        const clients = await Client.find({ _id: { $in: receivers } });
        const vendeurs = await Vendeur.find({ _id: { $in: receivers } });

        const phoneNumbers: string[] = [];

        clients.forEach(client => {
            if (client.whatsappNumber) {
                phoneNumbers.push(client.whatsappNumber);
            }
        });

        vendeurs.forEach(vendeur => {
            if (vendeur.whatsappNumber) {
                phoneNumbers.push(vendeur.whatsappNumber);
            }
        });

        if (phoneNumbers.length === 0) {
            throw new Error('Aucun numéro de téléphone trouvé pour les destinataires');
        }

        const BATCH_SIZE = 50;
        let sentCount = 0;
        let failedCount = 0;
        const failedNumbers: string[] = [];

        for (let i = 0; i < phoneNumbers.length; i += BATCH_SIZE) {
            const batch = phoneNumbers.slice(i, i + BATCH_SIZE);

            const results = await Promise.all(
                batch.map(async (phoneNumber) => {
                    try {
                        const result = await cabupayWhatsappService.notifyAnnonce({
                            whatsappNumber: phoneNumber,
                            title: notification.title,
                            body: notification.body
                        });

                        const success = result === true ;
                        return { phoneNumber, success };
                    } catch (error) {
                        console.error(`❌ Erreur envoi WhatsApp à ${phoneNumber}:`, error);
                        return { phoneNumber, success: false };
                    }
                })
            );

            results.forEach(r => {
                if (r.success) {
                    sentCount++;
                } else {
                    failedCount++;
                    failedNumbers.push(r.phoneNumber);
                }
            });

            if (i + BATCH_SIZE < phoneNumbers.length) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        // Marquer comme envoyée SEULEMENT si au moins un message a été envoyé
        if (sentCount > 0) {
            await notificationService.markWhatsAppSent(notificationId, {
                sent: true,
                sentAt: new Date(),
                sentCount,
                failedCount
            });
        } else {
            await notificationService.markWhatsAppSent(notificationId, {
                sent: false,
                sentAt: null,
                sentCount: 0,
                failedCount
            });
        }

      

        return { sentCount, failedCount, total: phoneNumbers.length, failedNumbers };

    } catch (error) {
        console.error('❌ Erreur sendWhatsAppNotification:', error);
        throw error;
    }
};

export const createNotification = async (req: Request, res: Response): Promise<Response> => {
    try {
        const {
            title,
            receivers,
            type,
            body,
            attachments
        } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'Le titre est obligatoire' });
        }

        if (!body) {
            return res.status(400).json({ error: 'Le contenu est obligatoire' });
        }

        const notification = await notificationService.createNotification({
            title,
            receivers: receivers || [],
            type: type || 'general',
            body,
            attachments,
            whatsappSent: false,
        });

        if (type === "whatsapp" && receivers && receivers.length > 0) {
            try {
                const clients = await Client.find({ _id: { $in: receivers } });
                const vendeurs = await Vendeur.find({ _id: { $in: receivers } });

                const phoneNumbers: string[] = [];

                clients.forEach(client => {
                    if (client.whatsappNumber) {
                        phoneNumbers.push(client.whatsappNumber);
                    }
                });

                vendeurs.forEach(vendeur => {
                    if (vendeur.whatsappNumber) {
                        phoneNumbers.push(vendeur.whatsappNumber);
                    }
                });

                const BATCH_SIZE = 50;
                let sentCount = 0;
                let failedCount = 0;

                for (let i = 0; i < phoneNumbers.length; i += BATCH_SIZE) {
                    const batch = phoneNumbers.slice(i, i + BATCH_SIZE);

                    const results = await Promise.all(
                        batch.map(async (phoneNumber) => {
                            try {
                                const result = await cabupayWhatsappService.notifyAnnonce({
                                    whatsappNumber: phoneNumber,
                                    title,
                                    body
                                });

                                const success = result === true ;
                                return { phoneNumber, success };
                            } catch (error) {
                                console.error(`❌ Erreur envoi WhatsApp à ${phoneNumber}:`, error);
                                return { phoneNumber, success: false };
                            }
                        })
                    );

                    results.forEach(r => {
                        if (r.success) sentCount++;
                        else failedCount++;
                    });

                    if (i + BATCH_SIZE < phoneNumbers.length) {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }

                if (sentCount > 0) {
                    await notificationService.markWhatsAppSent(notification._id.toString(), {
                        sent: true,
                        sentAt: new Date(),
                        sentCount,
                        failedCount
                    });
                }
            } catch (whatsappError) {
                console.error('❌ Erreur envoi WhatsApp:', whatsappError);
            }
        }

        return res.status(201).json({
            success: true,
            message: 'Notification créée avec succès',
            notification,
        });

    } catch (err: any) {
        console.error('❌ Erreur createNotification:', err.message || err);
        return res.status(500).json({
            error: 'Erreur lors de la création de la notification',
            details: err.message || err,
        });
    }
};

export const getNotifications = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { day, week, month, year, type, receiver, ...filters } = req.query;
        let query: any = { ...filters };

        if (type) {
            query.type = type;
        }

        if (receiver) {
            query.$or = [
                { type: 'general' },
                { type: 'private', receivers: receiver },
                { type: 'whatsapp', receivers: receiver }
            ];
        }

        if (day || week || month || year) {
            const now = new Date();
            let start: Date | null = null;
            let end: Date | null = null;

            if (day) {
                start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
            } else if (week) {
                const dayOfWeek = now.getDay();
                start = new Date(now);
                start.setDate(now.getDate() - dayOfWeek);
                start.setHours(0, 0, 0, 0);
                end = new Date(start);
                end.setDate(start.getDate() + 7);
            } else if (month) {
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            } else if (year) {
                start = new Date(now.getFullYear(), 0, 1);
                end = new Date(now.getFullYear() + 1, 0, 1);
            }

            if (start && end) {
                query.createdAt = { $gte: start, $lt: end };
            }
        }

        const notifications = await notificationService.getNotifications(query);
        return res.json(notifications);
    } catch (err: any) {
        console.error('❌ Erreur getNotifications:', err.message || err);
        return res.status(500).json({ error: 'Erreur lors de la récupération des notifications' });
    }
};

export const getNotificationById = async (req: Request, res: Response): Promise<Response> => {
    try {
        const notification = await notificationService.getNotificationById(req.params.id);
        if (!notification) {
            return res.status(404).json({ error: 'Notification non trouvée' });
        }
        return res.json(notification);
    } catch (err: any) {
        console.error('❌ Erreur getNotificationById:', err.message || err);
        return res.status(500).json({ error: 'Erreur lors de la récupération de la notification' });
    }
};

export const updateNotification = async (req: Request, res: Response): Promise<Response> => {
    try {
        const notification = await notificationService.updateNotification(req.params.id, req.body);
        if (!notification) {
            return res.status(404).json({ error: 'Notification non trouvée' });
        }
        return res.json(notification);
    } catch (err: any) {
        console.error('❌ Erreur updateNotification:', err.message || err);
        return res.status(500).json({ error: 'Erreur lors de la mise à jour de la notification' });
    }
};

export const deleteNotification = async (req: Request, res: Response): Promise<Response> => {
    try {
        const notification = await notificationService.deleteNotification(req.params.id);
        if (!notification) {
            return res.status(404).json({ error: 'Notification non trouvée' });
        }
        return res.json({ message: 'Notification supprimée avec succès' });
    } catch (err: any) {
        console.error('❌ Erreur deleteNotification:', err.message || err);
        return res.status(500).json({ error: 'Erreur lors de la suppression de la notification' });
    }
};

export const deleteManyNotifications = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: 'Liste d\'IDs invalide' });
        }
        const result = await notificationService.deleteManyNotifications(ids);
        return res.status(200).json({
            message: `${result.deletedCount} notifications supprimées`,
            deletedCount: result.deletedCount
        });
    } catch (err: any) {
        console.error('❌ Erreur deleteManyNotifications:', err.message || err);
        return res.status(500).json({ error: 'Erreur lors de la suppression multiple' });
    }
};

export const getNotificationsByType = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { type } = req.params;
        const notifications = await notificationService.getNotificationsByType(type);
        return res.json(notifications);
    } catch (err: any) {
        console.error('❌ Erreur getNotificationsByType:', err.message || err);
        return res.status(500).json({ error: 'Erreur lors de la récupération des notifications' });
    }
};

export const getNotificationsByReceiver = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { userId } = req.params;
        const notifications = await notificationService.getNotificationsByReceiver(userId);
        return res.json(notifications);
    } catch (err: any) {
        console.error('❌ Erreur getNotificationsByReceiver:', err.message || err);
        return res.status(500).json({ error: 'Erreur lors de la récupération des notifications' });
    }
};

export const getNotificationsByDateRange = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'startDate et endDate sont obligatoires' });
        }
        const notifications = await notificationService.getNotificationsByDateRange(
            new Date(startDate as string),
            new Date(endDate as string)
        );
        return res.json(notifications);
    } catch (err: any) {
        console.error('❌ Erreur getNotificationsByDateRange:', err.message || err);
        return res.status(500).json({ error: 'Erreur lors de la récupération des notifications' });
    }
};

export const getTodayNotifications = async (req: Request, res: Response): Promise<Response> => {
    try {
        const notifications = await notificationService.getTodayNotifications();
        return res.json(notifications);
    } catch (err: any) {
        console.error('❌ Erreur getTodayNotifications:', err.message || err);
        return res.status(500).json({ error: 'Erreur lors de la récupération des notifications du jour' });
    }
};

export const getNotificationsStats = async (req: Request, res: Response): Promise<Response> => {
    try {
        const stats = await notificationService.getStats();
        return res.json(stats);
    } catch (err: any) {
        console.error('❌ Erreur getNotificationsStats:', err.message || err);
        return res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
    }
};

export const markAsRead = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id } = req.params;
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'userId est obligatoire' });
        }

        const notification = await notificationService.markAsRead(id, userId);
        if (!notification) {
            return res.status(404).json({ error: 'Notification non trouvée' });
        }

        return res.status(200).json({
            success: true,
            message: 'Notification marquée comme lue',
            notification
        });
    } catch (err: any) {
        console.error('❌ Erreur markAsRead:', err.message || err);
        return res.status(500).json({ error: 'Erreur lors du marquage de la notification' });
    }
};

export const markAllAsRead = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'userId est obligatoire' });
        }

        const result = await notificationService.markAllAsRead(userId);

        return res.status(200).json({
            success: true,
            message: 'Toutes les notifications marquées comme lues',
            modifiedCount: result.modifiedCount
        });
    } catch (err: any) {
        console.error('❌ Erreur markAllAsRead:', err.message || err);
        return res.status(500).json({ error: 'Erreur lors du marquage des notifications' });
    }
};

export const getUnreadCount = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ error: 'userId est obligatoire' });
        }

        const notifications = await notificationService.getNotificationsByReceiver(userId);
        const unreadCount = notifications.filter(n => !n.readBy.includes(userId)).length;

        return res.json({ unreadCount });
    } catch (err: any) {
        console.error('❌ Erreur getUnreadCount:', err.message || err);
        return res.status(500).json({ error: 'Erreur lors du comptage des notifications non lues' });
    }
};

export const isRead = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id } = req.params;
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: 'userId est obligatoire' });
        }

        const read = await notificationService.isRead(id, userId as string);
        return res.json({ read });
    } catch (err: any) {
        console.error('❌ Erreur isRead:', err.message || err);
        return res.status(500).json({ error: 'Erreur lors de la vérification' });
    }
};

export const resendWhatsAppNotification = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id } = req.params;

        const notification = await notificationService.getNotificationById(id);
        if (!notification) {
            return res.status(404).json({ error: 'Notification non trouvée' });
        }

        if (notification.type !== "whatsapp") {
            return res.status(400).json({ error: 'Cette notification n\'est pas de type WhatsApp' });
        }

        await notificationService.resetWhatsAppStatus(id);

        const result = await sendWhatsAppNotification(id);

        // ✅ VÉRIFIER SI AU MOINS UN MESSAGE A ÉTÉ ENVOYÉ
        if (result.sentCount === 0) {
            return res.status(500).json({
                success: false,
                message: 'Échec de l\'envoi WhatsApp',
                result
            });
        }

        return res.status(200).json({
            success: true,
            message: `${result.sentCount} message(s) envoyés sur ${result.total}`,
            result
        });

    } catch (err: any) {
        console.error('❌ Erreur resendWhatsAppNotification:', err.message || err);
        return res.status(500).json({
            error: 'Erreur lors du renvoi de la notification WhatsApp',
            details: err.message || err,
        });
    }
};

export const getWhatsAppStatus = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { id } = req.params;

        const notification = await notificationService.getNotificationById(id);
        if (!notification) {
            return res.status(404).json({ error: 'Notification non trouvée' });
        }

        return res.status(200).json({
            type: notification.type,
            whatsappSent: notification.whatsappSent,
            whatsappSentAt: notification.whatsappSentAt,
        });

    } catch (err: any) {
        console.error('❌ Erreur getWhatsAppStatus:', err.message || err);
        return res.status(500).json({
            error: 'Erreur lors de la récupération du statut WhatsApp',
            details: err.message || err,
        });
    }
};