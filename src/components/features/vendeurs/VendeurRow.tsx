// components/vendeurs/VendeurRow.tsx
import { Clock, ExternalLink, Trash2 } from "lucide-react";
import TableRow from "../../ui/TableRow";
import { Vendeur } from "../../../utils/database";

interface VendeurRowProps {
  vendeur: Vendeur;
  onAction: (vendeur: Vendeur) => void;
  onSelect?: (vendeur: Vendeur, isSelected: boolean) => void;
  isSelected?: boolean;
  selectable?: boolean;
  onDelete?: (vendeurId: string) => void;
}

export default function VendeurRow({
  vendeur,
  onAction,
  onSelect,
  isSelected = false,
  selectable = false,
  onDelete,
}: VendeurRowProps) {
  const currentId = vendeur.id || vendeur._id || "";

  const countActiveNetworks = () => {
    if (!vendeur.networks) return 0;
    return Object.values(vendeur.networks).filter(Boolean).length;
  };

  const getStatusBadge = () => {
    const isOnline = vendeur.isOnline || false;
    return {
      label: isOnline ? "En ligne" : "Hors ligne",
      color: isOnline ? "text-green-600" : "text-gray-500",
      dotColor: isOnline ? "bg-green-500" : "bg-gray-400",
    };
  };

  const status = getStatusBadge();

  return (
    <TableRow
      item={vendeur}
      onAction={onAction}
      onSelect={onSelect}
      isSelected={isSelected}
      selectable={selectable}
      actionable={true}
    >
      {/* Vendeur */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          {vendeur.photoUrls?.[0] ? (
            <img
              src={vendeur.photoUrls[0]}
              alt={vendeur.username}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">
                {vendeur.username?.charAt(0).toUpperCase() || "V"}
              </span>
            </div>
          )}
          <div>
            <span className="font-medium text-gray-900 block">{vendeur.username}</span>
            <span className="text-gray-500 text-xs">{vendeur.email}</span>
          </div>
        </div>
      </td>

      {/* Contact & Statut en ligne */}
      <td className="py-3 px-4">
        <div>
          <span className="text-gray-900 font-medium block">{vendeur.whatsappNumber}</span>
          <div className="flex items-center gap-1.5 mt-1">
            <span className={`h-2 w-2 rounded-full ${status.dotColor}`} />
            <span className={`text-xs font-medium ${status.color}`}>
              {status.label}
            </span>
          </div>
          {vendeur.openingTime && vendeur.closingTime && (
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
              <Clock className="h-3 w-3" />
              <span>{vendeur.openingTime} - {vendeur.closingTime}</span>
            </div>
          )}
        </div>
      </td>

      {/* Réseaux */}
      <td className="py-3 px-4">
        <div>
          <span className="font-medium text-gray-900 block">
            {countActiveNetworks()}/4 réseaux
          </span>
          <div className="flex gap-1 mt-1">
            {vendeur.networks && Object.entries(vendeur.networks).map(([name, active]) => (
              active && (
                <span key={name} className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded">
                  {name}
                </span>
              )
            ))}
          </div>
        </div>
      </td>
    </TableRow>
  );
}