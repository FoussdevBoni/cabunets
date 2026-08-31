import { LucideIcon } from "lucide-react";
import BaseModal from "./Modal";
import { ReactNode } from "react";

export interface Menu {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
}

interface MenuModalProps {
  menu: Menu[];
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon: ReactNode;
}

export default function MenuModal({ menu, isOpen, onClose, title, icon }: MenuModalProps) {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={title} icon={icon}>
      <div className="py-2">
        {menu.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <button
              key={index}
              onClick={() => {
                item.onClick();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-0"
            >
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <IconComponent size={18} className="text-primary" />
              </div>
              <span className="text-sm font-medium text-gray-700">{item.label}</span>
            </button>
          );
        })}
      </div>
    </BaseModal>
  );
}
