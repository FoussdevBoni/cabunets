// src/navigation/adminNav.ts

import {
  LayoutDashboard,
  Users,
  Store,
  Coins,
  Wallet,
  Settings,
  ShieldAlert,
  ScrollText,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

export const adminNav: NavItem[] = [
  { label: "Vue globale", path: "/admin/overview", icon: LayoutDashboard },
  { label: "Affiliés", path: "/admin/affiliates", icon: Users },
  { label: "Commissions", path: "/admin/commissions", icon: Coins },
  { label: "Retraits", path: "/admin/withdrawals", icon: Wallet },
  { label: "Vendeurs apportés", path: "/admin/sellers", icon: Store },
  { label: "Règles", path: "/admin/rules", icon: Settings },
  { label: "Anomalies", path: "/admin/anomalies", icon: ShieldAlert },
  { label: "Audit", path: "/admin/audit", icon: ScrollText },
];