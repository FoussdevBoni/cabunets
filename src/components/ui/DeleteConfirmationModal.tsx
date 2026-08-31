import React from "react";
import { AlertTriangle, X } from "lucide-react";
import BaseModal from "./Modal";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  variant?: "danger" | "warning" | "info";
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Supprimer",
  cancelText = "Annuler",
  isLoading = false,
  variant = "danger",
}) => {
  const getVariantColors = () => {
    switch (variant) {
      case "warning":
        return {
          bg: "bg-yellow-50",
          icon: "text-yellow-600",
          border: "border-yellow-200",
          button: "bg-yellow-600 hover:bg-yellow-700",
          text: "text-yellow-800",
        };
      case "info":
        return {
          bg: "bg-blue-50",
          icon: "text-blue-600",
          border: "border-blue-200",
          button: "bg-blue-600 hover:bg-blue-700",
          text: "text-blue-800",
        };
      default: // danger
        return {
          bg: "bg-red-50",
          icon: "text-red-600",
          border: "border-red-200",
          button: "bg-red-600 hover:bg-red-700",
          text: "text-red-800",
        };
    }
  };

  const colors = getVariantColors();

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle="Confirmation requise"
      icon={<AlertTriangle className="w-5 h-5 text-white" />}
      size="sm"
    >
      <div className={`${colors.bg} ${colors.border} border rounded-xl p-4 mb-6`}>
        <div className="flex items-start space-x-3">
          <AlertTriangle className={`w-5 h-5 mt-0.5 ${colors.icon}`} />
          <div className={`text-sm ${colors.text}`}>{message}</div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row-reverse sm:justify-between space-y-3 sm:space-y-0">
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 sm:flex-none px-6 py-3 text-gray-700 hover:text-gray-900 font-medium rounded-xl hover:bg-gray-100 transition-all duration-200 disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`${colors.button} text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Suppression...</span>
              </>
            ) : (
              <span>{confirmText}</span>
            )}
          </button>
        </div>

        <div className="flex items-center justify-center sm:justify-start">
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            title="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Message d'avertissement supplémentaire */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          <p className="font-medium mb-1">⚠️ Attention :</p>
          <p>Cette action est irréversible. Une fois confirmée, elle ne pourra pas être annulée.</p>
        </div>
      </div>
    </BaseModal>
  );
};

export default DeleteConfirmationModal;
