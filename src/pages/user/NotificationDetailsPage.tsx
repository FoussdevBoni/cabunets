// pages/user/NotificationDetailsPage.tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {  Image, Clock, X } from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import useToken from '../../hooks/auth/useToken';
import { useAuth } from '../../hooks/auth/useAuth';
import { Notification } from '../../types/Notification';
import { formatDate } from '../../functions/formatDate';
import useNotifications from '../../hooks/notifications/useNotifications';
import PageLayout from '../../layouts/PageLayout';

export default function UserNotificationDetailsPage() {
  const { id } = useParams();
  const { token } = useToken();
  const { user } = useAuth();
  const { markAsRead  } = useNotifications({});
  const [notification, setNotification] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (id && token) {
      fetchNotification();
    }
  }, [id, token]);

  const fetchNotification = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotificationById(id!, token);
      setNotification(data);
      // Marquer comme lu automatiquement
      if (!data.readBy.includes(user?.id || "")) {
        await markAsRead(id!);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeText = () => {
    if (notification?.type === "general") return "Générale";
    if (notification?.type === "private") return "Privée";
    if (notification?.type === "whatsapp") return "WhatsApp";
    return "";
  };

  const getTypeColor = () => {
    if (notification?.type === "general") return "text-blue-600 bg-blue-50";
    if (notification?.type === "private") return "text-purple-600 bg-purple-50";
    if (notification?.type === "whatsapp") return "text-green-600 bg-green-50";
    return "text-gray-600 bg-gray-50";
  };

  if (loading) {
    return (
      <PageLayout title="Détails">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PageLayout>
    );
  }

  if (!notification) {
    return (
      <PageLayout title="Détails">
        <div className="text-center py-12">
          <p className="text-gray-500">Notification non trouvée</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title={notification.title || "Détails de la notification"}>
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto">
         
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <Clock size={14} />
              {formatDate(notification.createdAt)}
            </span>
          </div>
        </div>
      </div>

      <div className="px-6 py-8 max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Contenu</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{notification.body}</p>
            </div>

        

            {notification.attachments && notification.attachments.length > 0 && (
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Image size={16} />
                  Images jointes
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {notification.attachments.map((url, index) => (
                    <div key={index} className="relative group cursor-pointer">
                      <img
                        src={url}
                        alt={`Image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200 hover:opacity-90 transition"
                        onClick={() => setSelectedImage(url)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-gray-200 pt-4 text-sm text-gray-500">
              <p>Reçu le {new Date(notification.createdAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal image */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition"
            >
              <X size={32} />
            </button>
            <img
              src={selectedImage}
              alt="Agrandissement"
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </PageLayout>
  );
}