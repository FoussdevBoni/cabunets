// src/components/layouts/BottomBar.tsx

import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import MenuModal from "../ui/MenuModal";
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
import type { NavItem } from "../../navigation/affiliateNav";

interface BottomBarProps {
  items: NavItem[];
}

/**
 * Barre de navigation fixe en bas de l'écran.
 * Visible uniquement sur mobile et tablette (< lg).
 * Affiche jusqu'à 5 items max.
 */
export function BottomBar({ items }: BottomBarProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const visibleItems = items.length > 5 ? items.slice(0, 4) : items;
  const remainingItems = items.slice(4);

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 safe-area-bottom">
      <ul className="flex items-center justify-around h-16">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.path} className="flex-1">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-0.5 h-full text-xs transition-colors ${
                    isActive ? "text-primary" : "text-gray-500"
                  }`
                }
              >
                <Icon size={20} />
                <span className="text-[10px]">{item.label}</span>
              </NavLink>
            </li>
          );
        })}
        {items.length > 5 && <li className="flex-1"><button type="button" aria-label="Plus de rubriques" onClick={() => setOpen(true)} className="flex flex-col items-center justify-center gap-1 w-full h-16 text-xs text-gray-600"><MoreHorizontal size={20} />Plus</button></li>}
      </ul>
      <MenuModal isOpen={open} onClose={() => setOpen(false)} title="Toutes les rubriques" icon={<MoreHorizontal />} menu={remainingItems.map(item => ({ label: item.label, icon: item.icon, onClick: () => navigate(item.path) }))} />
    </nav>
  );
}