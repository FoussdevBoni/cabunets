// components/notifications/NotificationsList.tsx
import { Notification } from "../../../types/Notification";
import TableList, { SelectAction } from "../../ui/TableList";
import NotificationRow from "./NotificationRow";

interface NotificationsListProps {
  notifications: Notification[];
  onAction: (notification: Notification) => void;
  onSelectNotifications?: (selectedNotifications: Notification[]) => void;
  selectable?: boolean;
  selectActions?: SelectAction[];
}

export default function NotificationsList({
  notifications,
  onAction,
  onSelectNotifications,
  selectable = false,
  selectActions,
}: NotificationsListProps) {
  const columns = [
    { header: "Titre / Contenu", className: "w-1/4" },
    { header: "Type", className: "w-1/6" },
    { header: "Destinataires", className: "w-1/6" },
    { header: "Vus", className: "w-1/12" },
    { header: "Images", className: "w-1/12" },
    { header: "Date", className: "hidden lg:table-cell w-1/6" },
  ];

  return (
    <TableList
      items={notifications}
      columns={columns}
      getId={(notification) => notification.id || notification._id || ""}
      onAction={onAction}
      onSelectItems={onSelectNotifications}
      selectable={selectable}
      emptyMessage="Aucune notification trouvée"
      actionColumn={true}
      selectActions={selectActions}
      renderRow={(notification, isSelected, onSelect) => (
        <NotificationRow
          key={notification.id || notification._id || ""}
          notification={notification}
          onAction={onAction}
          onSelect={onSelect}
          isSelected={isSelected}
          selectable={selectable}
        />
      )}
    />
  );
}