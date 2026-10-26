// layouts/client/ClientLayout.tsx
import { Home, ShoppingBag, MessageCircle, User } from "lucide-react";
import UserNotAdminLayout, { NavItem } from "../UserNotAdminLayout";
import useNotifications from "../../hooks/notifications/useNotifications";
import { useAuth } from "../../hooks/auth/useAuth";

interface ClientLayoutProps { children: React.ReactNode }

const navItems: NavItem[] = [
  { id: "dashboard",    title: "Accueil",      icon: Home,          iconActive: Home,          route: "/overview" },
  { id: "achats",       title: "Mes achats",   icon: ShoppingBag,   iconActive: ShoppingBag,   route: "/achats" },
  { id: "reclamations", title: "Réclamations", icon: MessageCircle, iconActive: MessageCircle, route: "/reclamations" },
  { id: "profile",      title: "Profil",       icon: User,          iconActive: User,          route: "/profile" },
];

const ClientLayout = ({ children }: ClientLayoutProps) => {
  const { user } = useAuth();
  const { unreadCount } = useNotifications({ filters: { receiver: user?.id } });

  return (
    <UserNotAdminLayout
      navItems={navItems}
      basePath="/client"
      roleLabel="Client"
      profileRoute="/client/profile"
      notificationsRoute="/client/notifications"
      notificationCount={unreadCount}
      getActiveTab={(path) => {
        if (path.includes("/dashboard")) return "dashboard";
        if (path.includes("/achats")) return "achats";
        if (path.includes("/reclamations")) return "reclamations";
        if (path.includes("/profile")) return "profile";
        return "dashboard";
      }}
    >
      {children}
    </UserNotAdminLayout>
  );
};

export default ClientLayout;