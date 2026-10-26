// src/components/layouts/Header.tsx

import { Menu, LogOut, User } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/auth/useAuth";

interface HeaderProps {
  title: string;
  onMenuClick?: () => void;
}

export function Header({ title, onMenuClick }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
      {/* Menu mobile (burger) */}
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            aria-label="Ouvrir le menu"
          >
            <Menu size={22} />
          </button>
        )}
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>

      {/* Menu utilisateur */}
      <div className="relative">
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100"
        >
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <User size={18} className="text-white" />
          </div>
          <span className="hidden sm:block text-sm font-medium text-gray-700">
            {user?.username || user?.email || "Mon compte"}
          </span>
        </button>

        {showUserMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut size={16} />
              Déconnexion
            </button>
          </div>
        )}
      </div>
    </header>
  );
}