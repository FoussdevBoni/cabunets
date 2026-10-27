// components/features/clients/ClientRow.tsx
import { MapPin, Phone } from "lucide-react";
import TableRow from "../../ui/TableRow";
import { User } from "../../../utils/database";

interface ClientRowProps {
  user: User;
  onAction: (user: User) => void;
  onSelect?: (user: User, isSelected: boolean) => void;
  isSelected?: boolean;
  selectable?: boolean;
  onDelete?: (userId: string) => void;
}

export default function ClientRow({
  user,
  onAction,
  onSelect,
  isSelected = false,
  selectable = false,
}: ClientRowProps) {
  const profile = user.profile as any;

  const formatLastLogin = (date?: string | Date | null) => {
    if (!date) return "Jamais connecté";

    const d = new Date(date);
    const now = new Date();
    const diffMin = Math.floor((now.getTime() - d.getTime()) / 60000);

    if (diffMin < 1) return "À l'instant";
    if (diffMin < 60) return `Il y a ${diffMin} min`;
    if (diffMin < 1440) return `Il y a ${Math.floor(diffMin / 60)}h`;
    if (diffMin < 10080) return `Il y a ${Math.floor(diffMin / 1440)}j`;

    return d.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <TableRow
      item={user}
      onAction={onAction}
      onSelect={onSelect}
      isSelected={isSelected}
      selectable={selectable}
      actionable={true}
    >
      {/* Client */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.username}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-sm font-bold text-green-600">
                {user.username?.charAt(0).toUpperCase() || "C"}
              </span>
            </div>
          )}
          <div>
            <span className="font-medium text-gray-900 block">
              {user.username || "Sans nom"}
            </span>
            <span className="text-gray-500 text-xs">{user.email}</span>
          </div>
        </div>
      </td>

      {/* WhatsApp */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <Phone className="h-3.5 w-3.5 text-green-600" />
          <span className="text-sm text-gray-900">
            {profile?.whatsappNumber || "Non renseigné"}
          </span>
        </div>
      </td>

      {/* Adresse */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 text-purple-500" />
          <span className="text-sm text-gray-600 truncate max-w-[220px]">
            {profile?.address || "Non renseignée"}
          </span>
        </div>
      </td>

      {/* Statut */}
      <td className="py-3 px-4">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
            user.isActive !== false
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              user.isActive !== false ? "bg-green-500" : "bg-red-500"
            }`}
          />
          {user.isActive !== false ? "Actif" : "Désactivé"}
        </span>
      </td>

      {/* Dernière connexion */}
      <td className="hidden lg:table-cell py-3 px-4">
        <div>
          <span className="text-gray-900 text-sm block">
            {formatLastLogin(user.lastLoginAt)}
          </span>
          <span className="text-gray-500 text-xs">
            {user.loginCount ?? 0} connexion
            {(user.loginCount ?? 0) > 1 ? "s" : ""}
          </span>
        </div>
      </td>

      {/* Inscrit le */}
      <td className="hidden lg:table-cell py-3 px-4">
        <span className="text-gray-500 text-sm">
          {user.createdAt
            ? new Date(user.createdAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "-"}
        </span>
      </td>
    </TableRow>
  );
}