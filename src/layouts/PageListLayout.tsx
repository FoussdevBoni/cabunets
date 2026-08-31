// src/components/ui/layouts/PageLayout.tsx
import { ReactNode } from "react";

import { LucideIcon } from "lucide-react";
import MenuModal from "../components/ui/MenuModal";
import DeleteConfirmationModal from "../components/ui/DeleteConfirmationModal";

interface MenuItem {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
}

interface PageListLayoutProps {
  // Header
  title: string;
  description?: string | ReactNode;
  actions?: ReactNode; // Les boutons d'action à droite

  // Contenu principal
  children: ReactNode;

  // Menu modal (optionnel)
  menu?: {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    icon?: ReactNode;
    items: MenuItem[];
  };

  // Delete modal (optionnel)
  deleteModal?: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
  };

  // Loading
  loading?: boolean;
}

export default function PageLitLayout({
  title,
  description,
  actions,
  children,
  menu,
  deleteModal,
  loading = false,
}: PageListLayoutProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          {description && <div className="text-sm text-gray-500 mt-1">{description}</div>}
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>

      {/* Contenu (statistiques, filtres, liste, etc.) */}
      {children}

      {/* Menu Modal */}
      {menu && (
        <MenuModal title={menu.title} icon={menu.icon} isOpen={menu.isOpen} onClose={menu.onClose} menu={menu.items} />
      )}

      {/* Delete Modal */}
      {deleteModal && (
        <DeleteConfirmationModal
          isOpen={deleteModal.isOpen}
          onClose={deleteModal.onClose}
          onConfirm={deleteModal.onConfirm}
          title={deleteModal.title}
          message={deleteModal.message}
          confirmText="Supprimer"
          cancelText="Annuler"
        />
      )}
    </div>
  );
}
