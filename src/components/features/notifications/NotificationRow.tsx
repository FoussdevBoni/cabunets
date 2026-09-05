// components/notifications/NotificationRow.tsx
import { formatDate } from "../../../functions/formatDate";
import { Notification } from "../../../types/Notification";
import TableRow from "../../ui/TableRow";
import { Eye, Users, MessageCircle } from "lucide-react";

interface NotificationRowProps {
  notification: Notification;
  onAction: (notification: Notification) => void;
  onSelect?: (notification: Notification, isSelected: boolean) => void;
  isSelected?: boolean;
  selectable?: boolean;
}

export default function NotificationRow({
  notification,
  onAction,
  onSelect,
  isSelected = false,
  selectable = false,
}: NotificationRowProps) {
  const getTypeColor = (type?: string) => {
    if (type === "general") return "bg-blue-100 text-blue-800";
    if (type === "private") return "bg-purple-100 text-purple-800";
    if (type === "whatsapp") return "bg-green-100 text-green-800";
    return "bg-gray-100 text-gray-800";
  };

  const getTypeText = (type?: string) => {
    if (type === "general") return "Générale";
    if (type === "private") return "Privée";
    if (type === "whatsapp") return "WhatsApp";
    return type || "-";
  };

  const getTypeIcon = (type?: string) => {
    if (type === "general") return <Users size={14} />;
    if (type === "private") return <Users size={14} />;
    if (type === "whatsapp") return <MessageCircle size={14} />;
    return null;
  };

  return (
    <TableRow
      item={notification}
      onAction={onAction}
      onSelect={onSelect}
      isSelected={isSelected}
      selectable={selectable}
      actionable={true}
    >
      <td className="py-3 px-4">
        <div>
          <span className="font-medium text-gray-900 block truncate max-w-[200px]">
            {notification.title}
          </span>
          <span className="text-gray-500 text-xs truncate block max-w-[200px]">
            {notification.body}
          </span>
        </div>
      </td>

      <td className="py-3 px-4">
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium inline-flex items-center gap-1 ${getTypeColor(notification.type)}`}>
          {getTypeIcon(notification.type)}
          {getTypeText(notification.type)}
        </span>
      </td>

      <td className="py-3 px-4">
        {notification.type !== "general" ? (
          <span className="text-sm text-gray-600">
            {notification.receivers?.length || 0} destinataire(s)
          </span>
        ) : (
          <span className="text-sm text-gray-400">-</span>
        )}
      </td>

      <td className="py-3 px-4">
        <div className="flex items-center gap-1">
          <Eye size={14} className="text-gray-400" />
          <span className="text-sm text-gray-600">
            {notification.readBy?.length || 0}
          </span>
        </div>
      </td>

      <td className="py-3 px-4">
        {notification.attachments && notification.attachments.length > 0 ? (
          <span className="text-xs text-blue-600">
            {notification.attachments.length} image(s)
          </span>
        ) : (
          <span className="text-gray-400 text-xs">-</span>
        )}
      </td>

      <td className="hidden lg:table-cell py-3 px-4">
        <span className="text-gray-500 text-sm">
          {notification.createdAt ? formatDate(notification.createdAt) : "-"}
        </span>
      </td>
    </TableRow>
  );
}