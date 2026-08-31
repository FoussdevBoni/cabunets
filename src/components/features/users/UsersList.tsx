// components/users/UsersList.tsx
import { User } from "../../../utils/database";
import TableList, { SelectAction } from "../../ui/TableList";
import UserRow from "./UserRow";

interface UsersListProps {
  users: User[];
  onAction: (user: User) => void;
  onSelectUsers?: (selectedUsers: User[]) => void;
  selectable?: boolean;
  selectActions?: SelectAction[];
  onDelete?: (userId: string) => void;
}

export default function UsersList({
  users,
  onAction,
  onSelectUsers,
  selectable = false,
  selectActions,
  onDelete,
}: UsersListProps) {
  const columns = [
    { header: "Utilisateur", className: "w-1/4" },
    { header: "Rôle", className: "w-1/6" },
    { header: "Contact", className: "w-1/5" },
    { header: "Statut", className: "w-1/6" },
    { header: "Inscrit le", className: "hidden lg:table-cell w-1/6" },
  ];

  return (
    <TableList
      items={users}
      columns={columns}
      getId={(user) => user.id || user._id || ""}
      onAction={onAction}
      onSelectItems={onSelectUsers}
      selectable={selectable}
      emptyMessage="Aucun utilisateur trouvé"
      actionColumn={true}
      selectActions={selectActions}
      renderRow={(user, isSelected, onSelect) => (
        <UserRow
          key={user.id || user._id || ""}
          user={user}
          onAction={onAction}
          onSelect={onSelect}
          isSelected={isSelected}
          selectable={selectable}
          onDelete={onDelete}
        />
      )}
    />
  );
}