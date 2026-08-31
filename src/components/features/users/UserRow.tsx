// components/users/UserRow.tsx
import { ExternalLink, Trash2, UserCog, Users, UserIcon } from "lucide-react";
import TableRow from "../../ui/TableRow";
import { User, UserRole } from "../../../utils/database";

interface UserRowProps {
  user: User;
  onAction: (user: User) => void;
  onSelect?: (user: User, isSelected: boolean) => void;
  isSelected?: boolean;
  selectable?: boolean;
  onDelete?: (userId: string) => void;
}

export default function UserRow({
  user,
  onAction,
  onSelect,
  isSelected = false,
  selectable = false,
  onDelete,
}: UserRowProps) {
  const currentId = user.id || user._id || "";

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <UserCog className="h-4 w-4" />;
      case 'vendeur':
        return <Users className="h-4 w-4" />;
      case 'client':
        return <UserIcon className="h-4 w-4" />;
      default:
        return <UserIcon className="h-4 w-4" />;
    }
  };

  const getRoleBadgeStyle = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-700';
      case 'vendeur':
        return 'bg-blue-100 text-blue-700';
      case 'client':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'vendeur':
        return 'Vendeur';
      case 'client':
        return 'Client';
      default:
        return role;
    }
  };

  const getProfileInfo = () => {
    const profile = user.profile as any;
    switch (user.role) {
      case 'admin':
        return {
          primary: profile?.nom || 'N/A',
          secondary: profile?.tel || 'N/A'
        };
      case 'vendeur':
        return {
          primary: profile?.whatsappNumber || 'N/A',
          secondary: `${profile?.paymentAmount || 0} FCFA/transaction`
        };
      case 'client':
        return {
          primary: profile?.whatsappNumber || 'N/A',
          secondary: profile?.address || 'Adresse non renseignée'
        };
      default:
        return { primary: 'N/A', secondary: '' };
    }
  };

  const profileInfo = getProfileInfo();

  return (
    <TableRow
      item={user}
      onAction={onAction}
      onSelect={onSelect}
      isSelected={isSelected}
      selectable={selectable}
      actionable={true}
    >
      {/* Utilisateur */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.username}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">
                {user.username?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
          )}
          <div>
            <span className="font-medium text-gray-900 block">{user.username}</span>
            <span className="text-gray-500 text-xs">{user.email}</span>
          </div>
        </div>
      </td>

      {/* Rôle */}
      <td className="py-3 px-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getRoleBadgeStyle(user.role)}`}>
          {getRoleIcon(user.role)}
          {getRoleLabel(user.role)}
        </span>
      </td>

      {/* Contact */}
      <td className="py-3 px-4">
        <div>
          <span className="text-gray-900 font-medium block">{profileInfo.primary}</span>
          <span className="text-gray-500 text-xs">{profileInfo.secondary}</span>
        </div>
      </td>

      {/* Statut Vérifié */}
      <td className="py-3 px-4">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
          user.isVerified 
            ? 'bg-green-100 text-green-700' 
            : 'bg-yellow-100 text-yellow-700'
        }`}>
          <span className={`h-1.5 w-1.5 rounded-full ${
            user.isVerified ? 'bg-green-500' : 'bg-yellow-500'
          }`} />
          {user.isVerified ? 'Vérifié' : 'Non vérifié'}
        </span>
      </td>

      {/* Date d'inscription */}
      <td className="hidden lg:table-cell py-3 px-4">
        <span className="text-gray-500 text-sm">
          {user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          }) : "-"}
        </span>
      </td>

    
    </TableRow>
  );
}