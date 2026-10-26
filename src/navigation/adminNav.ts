// src/navigation/adminNav.ts

import {
  LayoutDashboard,
  Users,
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
  { label: "Règles", path: "/admin/rules", icon: Settings },
  { label: "Anomalies", path: "/admin/anomalies", icon: ShieldAlert },
  { label: "Audit", path: "/admin/audit", icon: ScrollText },
];