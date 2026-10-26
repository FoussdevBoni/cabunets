// components/features/clients/ClientsList.tsx
import { User } from "../../../utils/database";
import TableList, { SelectAction } from "../../ui/TableList";
import ClientRow from "./ClientRow";

interface ClientsListProps {
  clients: User[];
  onAction: (client: User) => void;
  onSelectClients?: (selected: User[]) => void;
  selectable?: boolean;
  selectActions?: SelectAction[];
  onDelete?: (clientId: string) => void;
}

export default function ClientsList({
  clients,
  onAction,
  onSelectClients,
  selectable = false,
  selectActions,
  onDelete,
}: ClientsListProps) {
  const columns = [
    { header: "Client", className: "w-1/4" },
    { header: "WhatsApp", className: "w-1/6" },
    { header: "Adresse", className: "w-1/4" },
    { header: "Statut", className: "w-1/6" },
    { header: "Dernière connexion", className: "hidden lg:table-cell w-1/6" },
    { header: "Inscrit le", className: "hidden lg:table-cell w-1/6" },
  ];

  return (
    <TableList
      items={clients}
      columns={columns}
      getId={(client) => client.id || client._id || ""}
      onAction={onAction}
      onSelectItems={onSelectClients}
      selectable={selectable}
      emptyMessage="Aucun client trouvé"
      actionColumn={true}
      selectActions={selectActions}
      renderRow={(client, isSelected, onSelect) => (
        <ClientRow
          key={client.id || client._id || ""}
          user={client}
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