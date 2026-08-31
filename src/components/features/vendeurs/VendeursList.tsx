// components/vendeurs/VendeursList.tsx
import { Vendeur } from "../../../utils/database";
import TableList, { SelectAction } from "../../ui/TableList";
import VendeurRow from "./VendeurRow";

interface VendeursListProps {
  vendeurs: Vendeur[];
  onAction: (vendeur: Vendeur) => void;
  onSelectVendeurs?: (selectedVendeurs: Vendeur[]) => void;
  selectable?: boolean;
  selectActions?: SelectAction[];
  onDelete?: (vendeurId: string) => void;
}

export default function VendeursList({
  vendeurs,
  onAction,
  onSelectVendeurs,
  selectable = false,
  selectActions,
  onDelete,
}: VendeursListProps) {
  const columns = [
    { header: "Vendeur", className: "w-1/3" },
    { header: "Contact", className: "w-1/3" },
    { header: "Réseaux", className: "w-1/4" },
  ];

  return (
    <TableList
      items={vendeurs}
      columns={columns}
      getId={(vendeur) => vendeur.id || vendeur._id || ""}
      onAction={onAction}
      onSelectItems={onSelectVendeurs}
      selectable={selectable}
      emptyMessage="Aucun vendeur trouvé"
      actionColumn={true}
      selectActions={selectActions}
      renderRow={(vendeur, isSelected, onSelect) => (
        <VendeurRow
          key={vendeur.id || vendeur._id || ""}
          vendeur={vendeur}
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