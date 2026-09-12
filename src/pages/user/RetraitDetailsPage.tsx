// pages/RetraitDetailsPage.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  
  Wallet,
  Smartphone,
  Building2,
  User,
  Hash,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
} from "lucide-react";
import useToken from "../../hooks/auth/useToken";
import { retraitsService } from "../../hooks/retraits/useRetraits";
import { alertSuccess, alertError, getErrorMessage } from "../../helpers/alertError";
import { Retrait } from "../../types/Retrait";
import MenuModal, { Menu } from "../../components/ui/MenuModal";
import PageLayout from "../../layouts/PageLayout";
import { useAuth } from "../../hooks/auth/useAuth";

export default function RetraitDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token } = useToken();
  const { user } = useAuth();

  const [retrait, setRetrait] = useState<Retrait | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const isAdmin = user?.role === "admin";

  // Charger le retrait
  useEffect(() => {
    if (id) {
      loadRetrait();
    }
  }, [id]);

  const loadRetrait = async () => {
    setLoading(true);
    try {
      const data = await retraitsService.getById(id!, token);
      setRetrait(data);
    } catch (error: any) {
      alertError(getErrorMessage(error) || "Impossible de charger le retrait");
      navigate("/vendeur/retraits");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleValidate = async () => {
    if (!retrait) return;
    setIsProcessing(true);
    try {
      const response = await retraitsService.validateRetrait(
        token,
        retrait.id || retrait._id || ""
      );
      if (response.success) {
        alertSuccess("Retrait validé avec succès");
        await loadRetrait();
        setShowActions(false);
      } else {
        alertError(response.message || "Erreur lors de la validation");
      }
    } catch (error: any) {
      alertError(getErrorMessage(error) || "Erreur lors de la validation");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!retrait) return;
    const reason = prompt("Motif du rejet :");
    if (!reason) return;

    setIsProcessing(true);
    try {
      const response = await retraitsService.rejectRetrait(
        token,
        retrait.id || retrait._id || "",
        reason
      );
      if (response.success) {
        alertSuccess("Retrait rejeté avec succès");
        await loadRetrait();
        setShowActions(false);
      } else {
        alertError(response.message || "Erreur lors du rejet");
      }
    } catch (error: any) {
      alertError(getErrorMessage(error) || "Erreur lors du rejet");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResendCallback = async () => {
    if (!retrait) return;
    const payoutId = retrait.payoutId || retrait.id || retrait._id || "";

    if (!payoutId) {
      alertError("Aucun payoutId disponible pour ce retrait");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await retraitsService.resendPayoutCallback(token, payoutId);
      if (response.success) {
        alertSuccess("Callback renvoyé avec succès. Le statut sera mis à jour prochainement.");
        await loadRetrait();
        setShowActions(false);
      } else {
        alertError(response.message || "Erreur lors du renvoi du callback");
      }
    } catch (error: any) {
      alertError(getErrorMessage(error) || "Erreur lors du renvoi du callback");
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    const s = status?.toUpperCase();
    switch (s) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
            <Clock size={14} />
            En attente
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <CheckCircle size={14} />
            Validé
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <XCircle size={14} />
            Rejeté
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            {status || "Inconnu"}
          </span>
        );
    }
  };

  const getActionsMenu = (): Menu[] => {
    if (!retrait) return [];
    const actions: Menu[] = [];
    const status = retrait.status?.toUpperCase();

    if (status === "PENDING") {
      actions.push({
        label: "Valider",
        icon: CheckCircle,
        onClick: handleValidate,
        disabled: isProcessing,
      });
      actions.push({
        label: "Rejeter",
        icon: XCircle,
        onClick: handleReject,
        disabled: isProcessing,
      });
    }

    if (retrait.payoutId && status === "PENDING") {
      actions.push({
        label: "Renvoyer le callback",
        icon: RefreshCw,
        onClick: handleResendCallback,
        disabled: isProcessing,
      });
    }

    return actions;
  };

  const formatDate = (date?: string | Date) => {
    if (!date) return "—";
    return new Date(date).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <PageLayout title="Détails du retrait">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      </PageLayout>
    );
  }

  if (!retrait) {
    return (
      <PageLayout title="Détails du retrait">
        <div className="text-center py-20">
          <p className="text-gray-500">Retrait introuvable</p>
          <button
            onClick={() => navigate("/vendeur/retraits")}
            className="mt-4 text-primary hover:underline"
          >
            Retour à la liste
          </button>
        </div>
      </PageLayout>
    );
  }

  const actionsMenu = getActionsMenu();
  const hasActions = actionsMenu.length > 0;

  return (
    <PageLayout title="Détails du retrait">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-6">
          {hasActions && (
            <button
              onClick={() => setShowActions(true)}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
            >
              Actions
            </button>
          )}
        </div>

        {/* Carte principale */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Header avec statut */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-primary/5 to-transparent">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Retrait #{retrait.id?.slice(-6) || retrait._id?.slice(-6)}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Créé le {formatDate(retrait.createdAt)}
                </p>
              </div>
              {getStatusBadge(retrait.status)}
            </div>
          </div>

          {/* Montant */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Wallet className="h-7 w-7 text-primary" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Montant demandé</p>
                <p className="text-3xl font-bold text-gray-900">
                  {retrait.amount?.toLocaleString()}{" "}
                  <span className="text-lg text-gray-500">
                    {(retrait as any).currency || "CDF"}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Informations de paiement */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Informations de paiement
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Méthode */}
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  {retrait.methodPayment?.type === "Momo" ? (
                    <Smartphone className="h-5 w-5 text-gray-600" />
                  ) : (
                    <Building2 className="h-5 w-5 text-gray-600" />
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500">Méthode de paiement</p>
                  <p className="text-sm font-medium text-gray-900">
                    {retrait.methodPayment?.type === "Momo"
                      ? "Mobile Money"
                      : "Virement bancaire"}
                  </p>
                </div>
              </div>

              {/* Correspondant (admin uniquement) */}
              {isAdmin && (retrait as any).correspondent && (
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Smartphone className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Opérateur</p>
                    <p className="text-sm font-medium text-gray-900">
                      {(retrait as any).correspondent}
                    </p>
                  </div>
                </div>
              )}

              {/* Numéro */}
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Hash className="h-5 w-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">
                    {retrait.methodPayment?.type === "Momo"
                      ? "Numéro de téléphone"
                      : "Numéro de compte"}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900 font-mono">
                      {isAdmin
                        ? retrait.methodPayment?.number
                        : retrait.methodPayment?.number
                          ? `****${retrait.methodPayment.number.slice(-4)}`
                          : "—"}
                    </p>
                    {isAdmin && (
                      <button
                        onClick={() => handleCopy(retrait.methodPayment?.number || "")}
                        className="text-gray-400 hover:text-primary transition"
                        title="Copier"
                      >
                        {copied ? (
                          <Check size={14} className="text-green-500" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Nom du titulaire (admin uniquement) */}
              {isAdmin && (
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Nom du titulaire</p>
                    <p className="text-sm font-medium text-gray-900">
                      {retrait.methodPayment?.intitule}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Informations PawaPay (admin uniquement) */}
          {isAdmin && (retrait as any).payoutId && (
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Informations PawaPay
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Hash className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Payout ID</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 font-mono break-all">
                        {(retrait as any).payoutId}
                      </p>
                      <button
                        onClick={() => handleCopy((retrait as any).payoutId)}
                        className="text-gray-400 hover:text-primary transition flex-shrink-0"
                        title="Copier"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {(retrait as any).providerTransactionId && (
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Hash className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">
                        Transaction opérateur
                      </p>
                      <p className="text-sm font-medium text-gray-900 font-mono break-all">
                        {(retrait as any).providerTransactionId}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Historique
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Calendar className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Date de création</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(retrait.createdAt)}
                  </p>
                </div>
              </div>

              {retrait.updatedAt && (
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">
                      Dernière mise à jour
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(retrait.updatedAt)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Motif de rejet */}
          {retrait.status?.toUpperCase() === "REJECTED" &&
            retrait.rejectReason && (
              <div className="p-6 bg-red-50">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-red-700">
                      Motif du rejet
                    </p>
                    <p className="text-sm text-red-600 mt-1">
                      {retrait.rejectReason}
                    </p>
                  </div>
                </div>
              </div>
            )}
        </div>

        {/* Modal actions */}
        {showActions && hasActions && (
          <MenuModal
            title="Actions sur le retrait"
            isOpen={showActions}
            onClose={() => setShowActions(false)}
            icon={null}
            menu={actionsMenu}
          />
        )}
      </div>
    </PageLayout>
  );
}