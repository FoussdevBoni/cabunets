import { ReactNode } from "react";
import { ArrowLeft, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PageLayoutProps {
  title: string;
  children: ReactNode;
  onBack?: () => void;
  showBackButton?: boolean;
  showCloseButton?: boolean;
  actions?: ReactNode;
  className?: string;
}

export default function PageLayout({
  title,
  children,
  onBack,
  showBackButton = true,
  showCloseButton = false,
  actions,
  className = "",
}: PageLayoutProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={`bg-gray-50 min-h-screen ${className}`}>
      {/* En-tête */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              {showBackButton && (
                <button
                  onClick={handleBack}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Retour"
                >
                  <ArrowLeft size={20} className="text-gray-600" />
                </button>
              )}

              {showCloseButton && (
                <button
                  onClick={handleBack}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Fermer"
                >
                  <X size={20} className="text-gray-600" />
                </button>
              )}

              <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            </div>

            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="">{children}</div>
    </div>
  );
}
