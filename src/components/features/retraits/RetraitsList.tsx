// components/retraits/RetraitsList.tsx
import { Retrait } from "../../../types/Retrait";
import TableList, { SelectAction } from "../../ui/TableList";
import RetraitRow from "./RetraitRow";

interface RetraitsListProps {
    retraits: Retrait[];
    onAction: (retrait: Retrait) => void;
    onSelectRetraits?: (selectedRetraits: Retrait[]) => void;
    selectable?: boolean;
    selectActions?: SelectAction[];
}

export default function RetraitsList({
    retraits,
    onAction,
    onSelectRetraits,
    selectable = false,
    selectActions,
}: RetraitsListProps) {
    const columns = [
        { header: "Vendeur", className: "w-1/5" },
        { header: "Montant", className: "w-1/6" },
        { header: "Méthode", className: "w-1/6" },
        { header: "Statut", className: "w-1/6" },
        { header: "Date", className: "hidden lg:table-cell w-1/6" },
    ];
    console.log(retraits)

    return (
        <TableList
            items={retraits}
            columns={columns}
            getId={(retrait) => retrait.id || retrait._id || ""}
            onAction={onAction}
            onSelectItems={onSelectRetraits}
            selectable={selectable}
            emptyMessage="Aucun retrait trouvé"
            actionColumn={true}
            selectActions={selectActions}
            renderRow={(retrait, isSelected, onSelect) => (
                <RetraitRow
                    key={retrait.id || retrait._id || ""}
                    retrait={retrait}
                    onAction={onAction}
                    onSelect={onSelect}
                    isSelected={isSelected}
                    selectable={selectable}
                />
            )}
        />
    );
}