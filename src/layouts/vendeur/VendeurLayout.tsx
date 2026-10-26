// layouts/vendeur/VendeurLayout.tsx
import { Home, ShoppingBag, FileText, OutdentIcon } from "lucide-react";
import UserNotAdminLayout, { NavItem } from "../UserNotAdminLayout";

interface VendeurLayoutProps { children: React.ReactNode }

const navItems: NavItem[] = [
  { id: "overview", title: "Accueil",    icon: Home,        iconActive: Home,        route: "/overview" },
  { id: "orders",   title: "Commandes",  icon: ShoppingBag, iconActive: ShoppingBag, route: "/orders" },
  { id: "offres",   title: "Offres",     icon: FileText,    iconActive: FileText,    route: "/offres" },
  { id: "retraits", title: "Retraits",   icon: OutdentIcon, iconActive: FileText,    route: "/retraits" },
];

const VendeurLayout = ({ children }: VendeurLayoutProps) => {
  return (
    <UserNotAdminLayout
      navItems={navItems}
      basePath="/vendeur"
      roleLabel="Vendeur"
      profileRoute="/vendeur/profile"
      getActiveTab={(path) => {
        if (path.includes("/overview")) return "overview";
        if (path.includes("/orders")) return "orders";
        if (path.includes("/offres")) return "offres";
        if (path.includes("/retraits")) return "retraits";
        return "dashboard";
      }}
    >
      {children}
    </UserNotAdminLayout>
  );
};

export default VendeurLayout;