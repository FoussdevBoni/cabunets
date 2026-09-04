// components/reclamations/ReclamationRow.tsx
import { formatDate } from "../../../functions/formatDate";
import { useAuth } from "../../../hooks/auth/useAuth";
import { Reclamation } from "../../../types/Reclamation";
import TableRow from "../../ui/TableRow";

interface ReclamationRowProps {
  reclamation: Reclamation;
  onAction: (reclamation: Reclamation) => void;
  onSelect?: (reclamation: Reclamation, isSelected: boolean) => void;
  isSelected?: boolean;
  selectable?: boolean;
}

export default function ReclamationRow({
  reclamation,
  onAction,
  onSelect,
  isSelected = false,
  selectable = false,
}: ReclamationRowProps) {

  const { user } = useAuth()
  const getStatutColor = (statut?: Reclamation["statut"]) => {
    if (statut === "resolue") return "bg-green-100 text-green-800";
    if (statut === "rejetee") return "bg-red-100 text-red-800";
    if (statut === "en_cours") return "bg-blue-100 text-blue-800";
    if (statut === "soumise") return "bg-yellow-100 text-yellow-800";
    return "bg-gray-100 text-gray-800";
  };

  const getStatutText = (statut?: Reclamation["statut"]) => {
    if (statut === "resolue") return "Résolue";
    if (statut === "rejetee") return "Rejetée";
    if (statut === "en_cours") return "En cours";
    if (statut === "soumise") return "Soumise";
    return "Brouillon";
  };

  return (
    <TableRow
      item={reclamation}
      onAction={onAction}
      onSelect={onSelect}
      isSelected={isSelected}
      selectable={selectable}
      actionable={true}
    >

      {
        user?.role === "admin" && <td className="py-3 px-4">
          <div>
            <span className="font-medium text-gray-900 block">{reclamation?.user?.username}</span>
            {reclamation.reference && (
              <span className="text-gray-500 text-xs">{reclamation.user.role}</span>
            )}
          </div>
        </td>
      }


      <td className="py-3 px-4">
        <div>
          <span className="font-medium text-gray-900 block">{reclamation.objet}</span>
          {reclamation.description && (
            <span className="text-gray-500 text-xs truncate block max-w-[200px]">
              {reclamation.description}
            </span>
          )}
        </div>
      </td>

      <td className="py-3 px-4">
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatutColor(reclamation.statut)}`}>
          {getStatutText(reclamation.statut)}
        </span>
      </td>

      <td className="py-3 px-4">
        {reclamation.attachements && reclamation.attachements.length > 0 ? (
          <span className="text-xs text-blue-600">
            {reclamation.attachements.length} fichier(s)
          </span>
        ) : (
          <span className="text-gray-400 text-xs">-</span>
        )}
      </td>

      <td className="hidden lg:table-cell py-3 px-4">
        <span className="text-gray-500 text-sm">
          {reclamation.createdAt ? formatDate(reclamation.createdAt) : "-"}
        </span>
      </td>
    </TableRow>
  );
}