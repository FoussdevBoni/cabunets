// pages/OverviewPage.tsx
import { useAuth } from "../../../hooks/auth/useAuth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  CheckCircle,
  Clock,
  XCircle,
  Plus,
  List,
  AlertCircle,
  Wallet,
  MessageCircle,
} from "lucide-react";
import useWallet from "../../../hooks/wallet/useWallet";
import { useVendeurOverview } from "../../../hooks/stats/useOverviewStats";

export default function OverviewPage() {
  const { user, loading: userLoading } = useAuth();
  const navigate = useNavigate();
  const { wallet, loading: walletLoading, getWallet } = useWallet();
  const { data, loading: statsLoading, error } = useVendeurOverview();

  useEffect(() => {
    if (user?.id) getWallet(user.id);
  }, [user?.id]);

  const quickLinks = [
    {
      icon: <Plus className="h-5 w-5" />,
      label: "Créer une offre",
      onClick: () => navigate("/vendeur/nouvelle-offre"),
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: <List className="h-5 w-5" />,
      label: "Mes offres",
      onClick: () => navigate("/vendeur/offres"),
      color: "bg-green-100 text-green-600",
    },
    {
      icon: <List className="h-5 w-5" />,
      label: "Mes demandes de retraits",
      onClick: () => navigate("/vendeur/retraits"),
      color: "bg-green-100 text-green-600",
    },
    {
      icon: <Package className="h-5 w-5" />,
      label: "Commandes",
      onClick: () => navigate("/vendeur/orders"),
      color: "bg-purple-100 text-purple-600",
    },
    {
      icon: <MessageCircle className="h-5 w-5" />,
      label: "Mes plaintes",
      onClick: () => navigate("/vendeur/reclamations"),
      color: "bg-purple-100 text-purple-600",
    },
  ];

  // Chargement
  if (userLoading || walletLoading || statsLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">Chargement du tableau de bord...</p>
      </div>
    );
  }

  // Erreur
  if (error || !user || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md w-full">
          <div className="flex items-center gap-3 mb-4">
            <XCircle className="h-8 w-8 text-red-600" />
            <h2 className="text-lg font-bold text-red-800">Erreur</h2>
          </div>
          <p className="text-red-700 mb-4">
            {error || "Utilisateur non authentifié"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  const { orders, offres } = data;
  const networkOffers = offres.byNetwork;

  return (
    <div className="min-h-screen mt-10 bg-gray-50 p-4">
      {/* En-tête */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {user?.username || "Vendeur"}
          </h1>
          <p className="text-gray-600 mt-1">Espace Vendeur</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border flex items-center gap-3 shadow-sm">
          <Wallet className="h-5 w-5 text-primary" />
          <div>
            <div className="text-xs text-gray-500">Solde disponible</div>
            <div className="text-sm font-bold text-gray-900">
              {wallet?.totalInDisplay?.wallet?.toLocaleString("fr-FR") || 0}{" "}
              {wallet?.totalInDisplay?.currency || "FCFA"}
            </div>
          </div>
        </div>
      </div>

      {/* Stats commandes */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Statut des commandes
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">En attente</div>
                <div className="text-xl font-bold text-gray-900">
                  {orders.pending}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Payées</div>
                <div className="text-xl font-bold text-gray-900">
                  {orders.completed}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Livrées</div>
                <div className="text-xl font-bold text-gray-900">
                  {orders.delivered}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Échouées</div>
                <div className="text-xl font-bold text-gray-900">
                  {orders.failed}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Offres par réseau */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Offres par réseau
        </h2>
        <div className="bg-white rounded-xl border p-4">
          {networkOffers.length > 0 ? (
            <div className="space-y-3">
              {networkOffers.map(({ network, count }) => (
                <div
                  key={network}
                  className="flex justify-between items-center py-2 border-b last:border-0"
                >
                  <span className="font-medium text-gray-700">{network}</span>
                  <span className="font-bold text-gray-900">
                    {count} offre{count > 1 ? "s" : ""}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>Aucune offre publiée</p>
              <button
                onClick={() => navigate("/vendeur/nouvelle-offre")}
                className="mt-3 text-primary hover:underline text-sm font-medium"
              >
                Créer ma première offre
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Accès rapides */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Accès rapide</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickLinks.map((link, index) => (
            <button
              key={index}
              onClick={link.onClick}
              className="bg-white rounded-xl border p-4 text-left hover:bg-gray-50 transition hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`h-10 w-10 rounded-lg flex items-center justify-center ${link.color}`}
                >
                  {link.icon}
                </div>
                <span className="font-medium text-gray-900">{link.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}