// src/components/layouts/Sidebar.tsx

import { NavLink } from "react-router-dom";
import type { NavItem } from "../../navigation/affiliateNav";

interface SidebarProps {
  items: NavItem[];
  title: string;
}

export function Sidebar({ items, title }: SidebarProps) {
  return (
    <aside className="hidden lg:flex lg:flex-col fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200">
      {/* Logo / Titre */}
      <div className="h-16 shrink-0 flex items-center px-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-primary">{title}</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 py-4 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`
              }
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="shrink-0 p-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">CabuAffili © 2026</p>
      </div>
    </aside>
  );
}