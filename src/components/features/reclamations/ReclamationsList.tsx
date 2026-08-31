// components/reclamations/ReclamationsList.tsx
import { Reclamation } from "../../../types/Reclamation";
import TableList, { SelectAction } from "../../ui/TableList";
import ReclamationRow from "./ReclamationRow";

interface ReclamationsListProps {
  reclamations: Reclamation[];
  onAction: (reclamation: Reclamation) => void;
  onSelectReclamations?: (selectedReclamations: Reclamation[]) => void;
  selectable?: boolean;
  selectActions?: SelectAction[];
}

export default function ReclamationsList({
  reclamations,
  onAction,
  onSelectReclamations,
  selectable = false,
  selectActions,
}: ReclamationsListProps) {
  const columns = [
    { header: "Client", className: "w-1/6" },
    { header: "Objet", className: "w-1/3" },
    { header: "Statut", className: "w-1/6" },
    { header: "Pièces jointes", className: "w-1/6" },
    { header: "Date", className: "hidden lg:table-cell w-1/6" },
  ];

  return (
    <TableList
      items={reclamations}
      columns={columns}
      getId={(reclamation) => reclamation.id || reclamation._id || ""}
      onAction={onAction}
      onSelectItems={onSelectReclamations}
      selectable={selectable}
      emptyMessage="Aucune réclamation trouvée"
      actionColumn={true}
      selectActions={selectActions}
      renderRow={(reclamation, isSelected, onSelect) => (
        <ReclamationRow
          key={reclamation.id || reclamation._id || ""}
          reclamation={reclamation}
          onAction={onAction}
          onSelect={onSelect}
          isSelected={isSelected}
          selectable={selectable}
        />
      )}
    />
  );
}