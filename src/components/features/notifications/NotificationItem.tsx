// components/notifications/NotificationItem.tsx
import { Notification } from '../../../types/Notification';
import { formatDate } from '../../../functions/formatDate';
import { Eye, EyeOff, Image, Users, MessageCircle } from 'lucide-react';

interface NotificationItemProps {
  notification: Notification;
  userId: string;
  onRead: (id: string) => void;
  onView: (notification: Notification) => void;
}

export default function NotificationItem({ notification, userId, onRead, onView }: NotificationItemProps) {
  const isRead = notification.readBy?.includes(userId) || false;
  const isWhatsApp = notification.type === "whatsapp";

  const getTypeColor = () => {
    if (notification.type === "general") return "bg-blue-50 border-blue-200";
    if (notification.type === "private") return "bg-purple-50 border-purple-200";
    if (notification.type === "whatsapp") return "bg-green-50 border-green-200";
    return "bg-gray-50 border-gray-200";
  };

  const getTypeIcon = () => {
    if (notification.type === "general") return <Users size={16} className="text-blue-500" />;
    if (notification.type === "private") return <Users size={16} className="text-purple-500" />;
    if (notification.type === "whatsapp") return <MessageCircle size={16} className="text-green-500" />;
    return null;
  };

  const getTypeText = () => {
    if (notification.type === "general") return "Générale";
    if (notification.type === "private") return "Privée";
    if (notification.type === "whatsapp") return "WhatsApp";
    return "";
  };

  const handleClick = () => {
    if (!isRead) {
      onRead(notification.id || notification._id || "");
    }
    onView(notification);
  };

  return (
    <div
      onClick={handleClick}
      className={`p-4 border rounded-xl cursor-pointer transition hover:shadow-md ${getTypeColor()} ${
        isRead ? 'opacity-70' : 'opacity-100'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`font-medium text-gray-900 ${isRead ? 'font-normal' : 'font-semibold'}`}>
              {notification.title}
            </h3>
            {!isRead && (
              <span className="inline-block w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
            )}
          </div>
          <p className={`text-sm text-gray-600 line-clamp-2 ${isRead ? 'text-gray-500' : ''}`}>
            {notification.body}
          </p>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              {getTypeIcon()}
              {getTypeText()}
            </span>
            <span>•</span>
            <span>{formatDate(notification.createdAt)}</span>
            {notification.attachments && notification.attachments.length > 0 && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Image size={12} />
                  {notification.attachments.length}
                </span>
              </>
            )}
            {isWhatsApp && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1 text-green-600">
                  <MessageCircle size={12} />
                  WhatsApp
                </span>
              </>
            )}
          </div>
        </div>
        <div className="flex-shrink-0">
          {isRead ? (
            <EyeOff size={18} className="text-gray-400" />
          ) : (
            <Eye size={18} className="text-blue-500" />
          )}
        </div>
      </div>
    </div>
  );
}