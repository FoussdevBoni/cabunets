// components/features/impersonation/ImpersonationBanner.tsx
import { useState } from "react";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { useAuth } from "../../../hooks/auth/useAuth";
import { adminService } from "../../../services/adminService";
import { alertError, alertSuccess } from "../../../helpers/alertError";
import useToken from "../../../hooks/auth/useToken";

interface ImpersonationBannerProps {
  redirectTo?: string;
}

const ImpersonationBanner = ({
  redirectTo = "/admin/overview",
}: ImpersonationBannerProps) => {
  const { user } = useAuth();
  const { token } = useToken();
  const [stopping, setStopping] = useState(false);

  const impersonatedBy = user?.impersonatedBy ?? null;
  const isImpersonating = !!impersonatedBy;

  const handleBackToAdmin = async () => {
    if (!token || stopping) return;
    setStopping(true);
    try {
      const result = await adminService.stopManaging(token);
      if (result.success) {
        alertSuccess("Retour au compte admin...");
        setTimeout(() => {
          window.location.href = redirectTo;
        }, 400);
      } else {
        alertError(result.message);
        setStopping(false);
      }
    } catch {
      alertError("Erreur lors du retour admin");
      setStopping(false);
    }
  };

  if (!isImpersonating) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-orange-500 text-white px-4 py-2 flex items-center justify-center gap-3 text-sm shadow-md">
      <ShieldAlert size={16} className="flex-shrink-0" />
      <span className="truncate">
        Vous agissez en tant que <strong>{user?.username}</strong>
        {impersonatedBy?.adminUsername && (
          <> (admin : <strong>{impersonatedBy.adminUsername}</strong>)</>
        )}
      </span>
      <button
        onClick={handleBackToAdmin}
        disabled={stopping}
        className="ml-3 flex items-center gap-1 px-3 py-1 rounded-md bg-white/20 hover:bg-white/30 transition text-xs font-medium flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ArrowLeft size={14} />
        {stopping ? "Retour..." : "Revenir en admin"}
      </button>
    </div>
  );
};

export default ImpersonationBanner;