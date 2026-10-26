// src/navigation/affiliateNav.ts

import {
  LayoutDashboard,
  Link as LinkIcon,
  Users,
  Coins,
  Wallet,
  User,
  Banknote,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

export const affiliateNav: NavItem[] = [
  { label: "Tableau de bord", path: "/affiliate/overview", icon: LayoutDashboard },
  { label: "Mon lien", path: "/affiliate/my-link", icon: LinkIcon },
  { label: "Mes filleuls", path: "/affiliate/my-referrals", icon: Users },
  { label: "Mes commissions", path: "/affiliate/my-commissions", icon: Coins },

  { label: "Mon solde", path: "/affiliate/my-balance", icon: Wallet },
  { label: "Retraits", path: "/affiliate/withdrawals", icon: Banknote },  // 🆕

  { label: "Mon profil", path: "/affiliate/profile", icon: User },
];