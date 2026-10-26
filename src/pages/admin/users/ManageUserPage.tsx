// pages/admin/ManageUserPage.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, UserCog, LogOut } from "lucide-react";
import PageLitLayout from "../../../layouts/PageListLayout";
import { adminService, ManagedUser } from "../../../services/adminService";
import { alertSuccess, alertError } from "../../../helpers/alertError";
import useToken from "../../../hooks/auth/useToken";

export default function ManageUserPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useToken();

  const [managed, setManaged] = useState<ManagedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { managed } = await adminService.getManagedUser(token!);
        setManaged(managed);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const handleStartManaging = async () => {
    if (!id) return;
    setStarting(true);
    try {
      const result = await adminService.manageUser(id, token!);

      if (result.success && result.data) {
        const { managedRole } = result.data;

        // ✅ Route selon le rôle de la cible
        const targetHome =
          managedRole === "vendeur"
            ? "/vendeur/overview"
            : "/client/overview";

        alertSuccess(
          `Impersonation activée (${managedRole}). Redirection...`
        );

        setTimeout(() => {
          window.location.href = targetHome;
        }, 600);
      } else {
        alertError(result.message);
        setStarting(false);
      }
    } catch (err) {
      alertError("Erreur lors de l'activation");
      setStarting(false);
    }
  };

  const handleStopManaging = async () => {
    try {
      const result = await adminService.stopManaging(token!);
      if (result.success) {
        alertSuccess("Impersonation terminée. Redirection...");
        setTimeout(() => {
          window.location.href = "/admin/users";
        }, 600);
      } else {
        alertError(result.message);
      }
    } catch (err) {
      alertError("Erreur lors de l'arrêt");
    }
  };

  if (loading) {
    return (
      <PageLitLayout title="Gérer l'utilisateur">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PageLitLayout>
    );
  }

  const isManagingThisUser = managed?._id === id;

  return (
    <PageLitLayout title="Gérer l'utilisateur">
      <div className="px-6 py-8 max-w-3xl mx-auto space-y-6">
        <button
          onClick={() => navigate("/admin/users")}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft size={16} />
          Retour à la liste
        </button>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <UserCog className="text-primary" size={24} />
            <h2 className="text-lg font-semibold text-gray-900">
              Impersonation
            </h2>
          </div>

          <p className="text-sm text-gray-600 mb-6">
            En activant l'impersonation, vous agirez <strong>exactement</strong> comme
            cet utilisateur dans toute l'application. Toutes vos actions seront
            enregistrées dans les logs d'audit.
          </p>

          {managed && !isManagingThisUser && (
            <div className="mb-4 p-3 rounded-lg bg-orange-50 border border-orange-200 text-sm text-orange-800">
              ⚠️ Vous impersonnez actuellement un autre utilisateur
              (<strong>{managed.username}</strong>). Arrêtez d'abord cette
              impersonation avant d'en démarrer une nouvelle.
            </div>
          )}

          {isManagingThisUser ? (
            <button
              onClick={handleStopManaging}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 text-white hover:bg-red-700"
            >
              <LogOut size={16} />
              Arrêter l'impersonation
            </button>
          ) : (
            <button
              onClick={handleStartManaging}
              disabled={starting || (!!managed && !isManagingThisUser)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UserCog size={16} />
              {starting ? "Activation..." : "Prendre le contrôle"}
            </button>
          )}
        </div>
      </div>
    </PageLitLayout>
  );
}