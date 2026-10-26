// pages/AdminOverviewPage.tsx
import { useNavigate } from "react-router-dom";
import {
  Package, Users, DollarSign, TrendingUp, TrendingDown, XCircle,
  Clock, CheckCircle, Truck, UserIcon, UserCog, Crown, Signal,
  Calendar, UserPlus, ArrowRight, Minus,
} from "lucide-react";
import { useAdminOverview } from "../../../hooks/stats/useOverviewStats";

export default function AdminOverviewPage() {
  const navigate = useNavigate();
  const { data, loading, error } = useAdminOverview();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md w-full">
          <div className="flex items-center gap-3 mb-4">
            <XCircle className="h-8 w-8 text-red-600" />
            <h2 className="text-lg font-bold text-red-800">Erreur</h2>
          </div>
          <p className="text-red-700">{error || "Erreur de chargement"}</p>
        </div>
      </div>
    );
  }

  const {
    users, totalOffres, totalVendeurs, orders, networks,
    monthly, dailyRevenue, dailySignups, registrations, topUsers,
  } = data;

  // Helper : "phrase simple" pour une variation
  const tellVariation = (value: number, unit = "FCFA", vs = "hier") => {
    if (value === 0) return { text: `Comme ${vs}`, icon: Minus, color: "text-gray-500" };
    if (value > 0) return { text: `+${Math.round(value)}% par rapport à ${vs}`, icon: TrendingUp, color: "text-green-600" };
    return { text: `${Math.round(value)}% par rapport à ${vs}`, icon: TrendingDown, color: "text-red-600" };
  };

  // Helper : décrire le revenu du jour en phrase
  const describeTodayRevenue = () => {
    const today = dailyRevenue.today;
    const yesterday = dailyRevenue.yesterday;

    if (today === 0 && yesterday === 0) return "Aucune vente enregistrée aujourd'hui.";
    if (today === 0) return "Aucune vente aujourd'hui. Hier il y avait des ventes.";
    if (today > yesterday) return `Aujourd'hui, meilleures ventes qu'hier 🎉`;
    if (today < yesterday) return `Aujourd'hui, ventes plus faibles qu'hier.`;
    return "Aujourd'hui, autant de ventes qu'hier.";
  };

  // Helper : décrire les inscriptions du jour
  const describeTodaySignups = () => {
    const t = dailySignups.today;
    if (t === 0) return "Personne ne s'est inscrit aujourd'hui.";
    if (t === 1) return "1 nouvelle inscription aujourd'hui.";
    return `${t} nouvelles inscriptions aujourd'hui.`;
  };

  const lastMonthName = monthly.last
    ? new Date(monthly.last.year, monthly.last.month - 1, 1).toLocaleDateString("fr-FR", { month: "long" })
    : "";

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* En-tête simple */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bonjour 👋</h1>
        <p className="text-gray-600 mt-1">
          Voici ce qui s'est passé sur la plateforme aujourd'hui.
        </p>
      </div>

      {/* ==================================================== */}
      {/* 1. LES 3 CHIFFRES DU JOUR — les plus importants      */}
      {/* ==================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Argent du jour */}
        <div className="bg-white rounded-2xl border-2 border-rose-100 p-6">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="h-5 w-5 text-rose-500" />
            <span className="text-sm font-medium text-rose-600">ARGENT GAGNÉ AUJOURD'HUI</span>
          </div>
          <div className="text-4xl font-bold text-gray-900">
            {dailyRevenue.today.toLocaleString("fr-FR")}
            <span className="text-lg text-gray-500 ml-2">FCFA</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">{describeTodayRevenue()}</p>
        </div>

        {/* Commandes du jour */}
        <div className="bg-white rounded-2xl border-2 border-indigo-100 p-6">
          <div className="flex items-center gap-2 mb-3">
            <Package className="h-5 w-5 text-indigo-500" />
            <span className="text-sm font-medium text-indigo-600">COMMANDES EN ATTENTE</span>
          </div>
          <div className="text-4xl font-bold text-gray-900">
            {orders.pending}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {orders.pending === 0
              ? "Tout est traité ✅"
              : `Il reste ${orders.pending} commande${orders.pending > 1 ? "s" : ""} à traiter.`}
          </p>
        </div>

        {/* Inscriptions du jour */}
        <div className="bg-white rounded-2xl border-2 border-emerald-100 p-6">
          <div className="flex items-center gap-2 mb-3">
            <UserPlus className="h-5 w-5 text-emerald-500" />
            <span className="text-sm font-medium text-emerald-600">NOUVEAUX MEMBRES</span>
          </div>
          <div className="text-4xl font-bold text-gray-900">
            {dailySignups.today}
          </div>
          <p className="text-sm text-gray-600 mt-2">{describeTodaySignups()}</p>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 2. LES CHIFFRES TOTAUX — combien on a en tout        */}
      {/* ==================================================== */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-3">Au total, la plateforme compte</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => navigate("/admin/users")}
            className="bg-white rounded-xl border p-4 text-left hover:shadow-md transition"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{totalVendeurs}</div>
                <div className="text-xs text-gray-500">vendeurs</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate("/admin/users")}
            className="bg-white rounded-xl border p-4 text-left hover:shadow-md transition"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <UserIcon className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{users.client}</div>
                <div className="text-xs text-gray-500">clients</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate("/admin/offres")}
            className="bg-white rounded-xl border p-4 text-left hover:shadow-md transition"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Package className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{totalOffres}</div>
                <div className="text-xs text-gray-500">offres publiées</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate("/admin/orders")}
            className="bg-white rounded-xl border p-4 text-left hover:shadow-md transition"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{orders.total}</div>
                <div className="text-xs text-gray-500">commandes</div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 3. COMMENT SE PORTENT LES COMMANDES                  */}
      {/* ==================================================== */}
      <div className="bg-white rounded-2xl border p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Où en sont les commandes ?</h2>

        {/* Barre visuelle simple */}
        {orders.total > 0 && (
          <div className="w-full h-4 rounded-full overflow-hidden flex mb-5">
            {orders.completed > 0 && (
              <div
                className="bg-indigo-500"
                style={{ width: `${(orders.completed / orders.total) * 100}%` }}
              />
            )}
            {orders.delivered > 0 && (
              <div
                className="bg-green-500"
                style={{ width: `${(orders.delivered / orders.total) * 100}%` }}
              />
            )}
            {orders.pending > 0 && (
              <div
                className="bg-yellow-400"
                style={{ width: `${(orders.pending / orders.total) * 100}%` }}
              />
            )}
            {orders.failed > 0 && (
              <div
                className="bg-red-500"
                style={{ width: `${(orders.failed / orders.total) * 100}%` }}
              />
            )}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{orders.pending}</div>
              <div className="text-xs text-gray-500">en attente</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-indigo-500"></div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{orders.completed}</div>
              <div className="text-xs text-gray-500">payées</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{orders.delivered}</div>
              <div className="text-xs text-gray-500">livrées</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{orders.failed}</div>
              <div className="text-xs text-gray-500">échouées</div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 4. CE MOIS-CI                                       */}
      {/* ==================================================== */}
      {monthly.last && (
        <div className="bg-white rounded-2xl border p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Ce mois-ci</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">
                En {lastMonthName}, la plateforme a généré
              </div>
              <div className="text-3xl font-bold text-indigo-700 mt-2">
                {monthly.last.revenue.toLocaleString("fr-FR")} FCFA
              </div>
              {monthly.previous && (
                <p className="text-sm text-gray-600 mt-2">
                  {monthly.variation >= 0
                    ? `C'est mieux que le mois précédent 🎉`
                    : `C'est moins que le mois précédent.`}
                </p>
              )}
            </div>

            {monthly.history.length > 1 && (
              <div>
                <div className="text-sm text-gray-600 mb-2">Les derniers mois</div>
                <div className="space-y-2">
                  {monthly.history.slice(0, 4).map((m) => {
                    const max = Math.max(...monthly.history.map((h) => h.revenue), 1);
                    const pct = (m.revenue / max) * 100;
                    const name = new Date(m.year, m.month - 1, 1).toLocaleDateString("fr-FR", {
                      month: "long",
                    });
                    return (
                      <div key={`${m.year}-${m.month}`} className="flex items-center gap-3">
                        <span className="w-20 text-sm text-gray-600 capitalize">{name}</span>
                        <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-700 w-24 text-right">
                          {m.revenue.toLocaleString("fr-FR")} F
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 5. LE RÉSEAU QUI MARCHE LE MIEUX                     */}
      {/* ==================================================== */}
      {networks.mostSold && (
        <div className="bg-white rounded-2xl border p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Signal className="h-5 w-5 text-blue-500" />
            <h2 className="text-lg font-bold text-gray-900">Le réseau qui marche le mieux</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Aujourd'hui, c'est <strong className="text-blue-600">{networks.mostSold.network}</strong> qui
            fait le plus de ventes.
          </p>

          <div className="space-y-3">
            {networks.top3.map(({ network, count, percentage }, i) => (
              <div key={network} className="flex items-center gap-3">
                <span className={`text-lg font-bold ${i === 0 ? "text-blue-600" : "text-gray-400"}`}>
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}
                </span>
                <span className="w-24 font-medium text-gray-800">{network}</span>
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-20 text-right">
                  {count} vente{count > 1 ? "s" : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 6. QUI UTILISE LE PLUS LA PLATEFORME                 */}
      {/* ==================================================== */}
      <div className="bg-white rounded-2xl border p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Crown className="h-5 w-5 text-yellow-500" />
          <h2 className="text-lg font-bold text-gray-900">Nos utilisateurs les plus actifs</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Vendeurs */}
          <div>
            <div className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-700">
              <UserCog className="h-4 w-4 text-blue-600" />
              Top vendeurs
            </div>
            {topUsers.vendeurs.length > 0 ? (
              <div className="space-y-2">
                {topUsers.vendeurs.slice(0, 5).map((u, i) => (
                  <div key={u._id} className="flex items-center gap-3 text-sm">
                    <span className="w-6 text-gray-400 text-xs font-bold">
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                    </span>
                    <span className="flex-1 font-medium text-gray-800 truncate">
                      {u.username || u.email}
                    </span>
                    <span className="text-xs text-gray-500">
                      {u.loginCount} connexion{u.loginCount > 1 ? "s" : ""}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500">Aucun vendeur actif</div>
            )}
          </div>

          {/* Clients */}
          <div>
            <div className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-700">
              <UserIcon className="h-4 w-4 text-green-600" />
              Top clients
            </div>
            {topUsers.clients.length > 0 ? (
              <div className="space-y-2">
                {topUsers.clients.slice(0, 5).map((u, i) => (
                  <div key={u._id} className="flex items-center gap-3 text-sm">
                    <span className="w-6 text-gray-400 text-xs font-bold">
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                    </span>
                    <span className="flex-1 font-medium text-gray-800 truncate">
                      {u.username || u.email}
                    </span>
                    <span className="text-xs text-gray-500">
                      {u.loginCount} connexion{u.loginCount > 1 ? "s" : ""}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500">Aucun client actif</div>
            )}
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 7. NOUVELLES INSCRIPTIONS SUR 30 JOURS               */}
      {/* ==================================================== */}
      <div className="bg-white rounded-2xl border p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus className="h-5 w-5 text-emerald-500" />
          <h2 className="text-lg font-bold text-gray-900">Nouvelles inscriptions (30 derniers jours)</h2>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Chaque barre représente le nombre de personnes qui se sont inscrites ce jour-là.
        </p>

        <div className="flex items-end gap-1 h-24">
          {registrations.last30Days.map(({ date, count }) => {
            const max = Math.max(...registrations.last30Days.map((h) => h.count), 1);
            const height = (count / max) * 100;
            return (
              <div
                key={date}
                className="flex-1 flex flex-col items-center group relative"
                title={`${date} : ${count} inscription${count > 1 ? "s" : ""}`}
              >
                <div
                  className="w-full max-w-4 bg-emerald-400 rounded-t hover:bg-emerald-500 transition"
                  style={{ height: `${Math.max(height * 0.9, 2)}px` }}
                />
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>Il y a 30 jours</span>
          <span>Aujourd'hui</span>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 8. RACCOURCIS                                        */}
      {/* ==================================================== */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">Actions rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <button
            onClick={() => navigate("/admin/orders")}
            className="bg-white rounded-xl border p-4 text-left hover:shadow-md hover:border-indigo-200 transition group"
          >
            <div className="flex items-center justify-between mb-2">
              <Package className="h-5 w-5 text-indigo-600" />
              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-600 transition" />
            </div>
            <div className="text-sm font-semibold text-gray-900">Voir les commandes</div>
            <div className="text-xs text-gray-500 mt-1">Surveiller les ventes en cours</div>
          </button>

          <button
            onClick={() => navigate("/admin/offres")}
            className="bg-white rounded-xl border p-4 text-left hover:shadow-md hover:border-emerald-200 transition group"
          >
            <div className="flex items-center justify-between mb-2">
              <Package className="h-5 w-5 text-emerald-600" />
              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-emerald-600 transition" />
            </div>
            <div className="text-sm font-semibold text-gray-900">Voir les offres</div>
            <div className="text-xs text-gray-500 mt-1">Toutes les offres publiées</div>
          </button>

          <button
            onClick={() => navigate("/admin/users")}
            className="bg-white rounded-xl border p-4 text-left hover:shadow-md hover:border-blue-200 transition group"
          >
            <div className="flex items-center justify-between mb-2">
              <Users className="h-5 w-5 text-blue-600" />
              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition" />
            </div>
            <div className="text-sm font-semibold text-gray-900">Voir les utilisateurs</div>
            <div className="text-xs text-gray-500 mt-1">Gérer vendeurs et clients</div>
          </button>

          <button
            onClick={() => navigate("/admin/vendeurs")}
            className="bg-white rounded-xl border p-4 text-left hover:shadow-md hover:border-purple-200 transition group"
          >
            <div className="flex items-center justify-between mb-2">
              <UserCog className="h-5 w-5 text-purple-600" />
              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600 transition" />
            </div>
            <div className="text-sm font-semibold text-gray-900">Gérer les vendeurs</div>
            <div className="text-xs text-gray-500 mt-1">Surveiller les vendeurs</div>
          </button>
        </div>
      </div>
    </div>
  );
}