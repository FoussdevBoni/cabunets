// pages/user/NotificationsPage.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, X } from 'lucide-react';
import PageLitLayout from '../../layouts/PageListLayout';
import useNotifications from '../../hooks/notifications/useNotifications';
import { useAuth } from '../../hooks/auth/useAuth';
import NotificationItem from '../../components/features/notifications/NotificationItem';
import { Notification } from '../../types/Notification';
import { alertSuccess } from '../../helpers/alertError';

export default function UserNotificationsPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { notifications, loading, unreadCount, markAsRead, markAllAsRead, refresh } = useNotifications({
        filters: { receiver: user?.id }
    });

    useEffect(() => {
        refresh();
    }, []);

    const handleRead = async (id: string) => {
        await markAsRead(id);
    };

    const handleView = (notification: Notification) => {
        navigate(`/${user?.role}/notifications/details/${notification.id || notification._id}`);
    };

    const handleMarkAllAsRead = async () => {
        await markAllAsRead();
        alertSuccess("Toutes les notifications ont été marquées comme lues");
    };

    if (loading) {
        return (
            <PageLitLayout title="">
                <div className="flex px-6 py-4   items-center gap-3">
                    <Bell size={24} className="text-primary" />
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Mes notifications</h1>
                      
                    </div>
                </div>
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </PageLitLayout>
        );
    }

    return (
        <PageLitLayout title="">
            <div className="px-6 py-4 bg-white border-b border-gray-200">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Bell size={24} className="text-primary" />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Mes notifications</h1>
                                <p className="text-sm text-gray-500">
                                    {unreadCount > 0 ? `${unreadCount} non lue(s)` : "Toutes vos notifications sont lues"}
                                </p>
                            </div>
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition"
                            >
                                <CheckCheck size={18} />
                                Tout marquer comme lu
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="px-6 py-8 max-w-4xl mx-auto">
                {notifications.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                        <Bell size={48} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500">Aucune notification</p>
                        <p className="text-sm text-gray-400">Vous n'avez pas encore de notifications</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {notifications.map((notification) => (
                            <NotificationItem
                                key={notification.id || notification._id}
                                notification={notification}
                                userId={user?.id || ""}
                                onRead={handleRead}
                                onView={handleView}
                            />
                        ))}
                    </div>
                )}
            </div>
        </PageLitLayout>
    );
}