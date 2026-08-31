// src/components/ui/TableRow.tsx
import { MoreVertical } from "lucide-react";
import { ReactNode } from "react";

interface TableRowProps<T = any> {
  item: T;
  onAction?: (item: T) => void;
  onSelect?: (item: T, isSelected: boolean) => void;
  isSelected?: boolean;
  children: ReactNode;
  selectable?: boolean;
  actionable?: boolean;
}

export default function TableRow<T>({
  item,
  onAction,
  onSelect,
  isSelected = false,
  children,
  selectable = true,
  actionable = true,
}: TableRowProps<T>) {
  const handleSelect = () => {
    if (onSelect) {
      onSelect(item, !isSelected);
    }
  };

  const handleAction = () => {
    if (onAction) {
      onAction(item);
    }
  };

  return (
    <tr className={`hover:bg-gray-50 border-b border-gray-200 ${isSelected ? "bg-blue-50" : ""}`}>
      {/* Bouton check à gauche */}
      {selectable && (
        <td className="py-3 px-4 w-10">
          <button
            onClick={handleSelect}
            className="p-1 rounded hover:bg-gray-200 transition-colors"
            aria-label={isSelected ? "Désélectionner" : "Sélectionner"}
          >
            <div
              className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors
              ${isSelected ? "bg-primary border-primary" : "border-gray-400 hover:border-primary"}`}
            >
              {isSelected && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </button>
        </td>
      )}

      {/* Les autres cellules passées en children */}
      {children}

      {/* Bouton d'action à droite */}
      {actionable && (
        <td className="py-3 px-4 text-right w-10">
          <button
            onClick={handleAction}
            className="p-1.5 rounded hover:bg-gray-200 transition-colors"
            aria-label="Actions"
          >
            <MoreVertical size={18} className="text-gray-500" />
          </button>
        </td>
      )}
    </tr>
  );
}
