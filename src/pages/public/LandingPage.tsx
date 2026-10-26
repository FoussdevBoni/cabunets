// pages/LandingPage.tsx
import { Link, useNavigate } from "react-router-dom";
import {
  Loader2,
  CheckCircle,
  Smartphone,
  Clock,
  ChevronRight,
  UserPlus,
} from "lucide-react";
import useVendeurs from "../../hooks/vendeurs/useVendeurs";
import { useAuth } from "../../hooks/auth/useAuth";
import PublicLayout from "../../layouts/public/PublicLayout";

export default function LandingPage() {
  const { data: vendeurs, loading } = useVendeurs({});
  const { user } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-9 w-9 animate-spin text-primary" />
        <p className="text-sm font-medium text-zinc-400 tracking-wide">
          Chargement des marchands...
        </p>
      </div>
    );
  }

  return (
    <PublicLayout>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {vendeurs && vendeurs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {vendeurs.map((vendeur) => (
              <div
                key={vendeur.id}
                className="group bg-white rounded-3xl border border-zinc-100 overflow-hidden shadow-sm hover:shadow-xl hover:border-zinc-200/80 transition-all duration-300 flex flex-col cursor-pointer"
                onClick={() => navigate(`/vendeur-details?id=${vendeur.id}`)}
              >
                {/* Image / Header visuel */}
                <div className="relative h-48 overflow-hidden bg-zinc-50 border-b border-zinc-100 flex-shrink-0">
                  {vendeur.avatar ? (
                    <>
                      <img
                        src={vendeur.avatar}
                        alt={vendeur.username}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border border-primary/10">
                        <span className="text-xl font-bold text-primary">
                          {vendeur.username?.charAt(0)?.toUpperCase() || "M"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Contenu */}
                <div className="p-6 flex flex-col flex-grow">
                  {/* Nom + statut en ligne */}
                  <div className="mb-3">
                    <h3 className="text-lg font-bold text-zinc-900 transition-colors group-hover:text-primary mb-1.5">
                      {vendeur.username}
                    </h3>

                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                          vendeur.isOnline
                            ? "text-emerald-600"
                            : "text-zinc-400"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            vendeur.isOnline
                              ? "bg-emerald-500 animate-pulse"
                              : "bg-zinc-400"
                          }`}
                        />
                        {vendeur.isOnline ? "En ligne" : "Hors ligne"}
                      </span>
                    </div>
                  </div>

                  <p className="text-zinc-500 text-sm leading-relaxed mb-6 line-clamp-2 flex-grow">
                    {vendeur.advantage}
                  </p>

                  {/* Horaires d'ouverture */}
                  {(vendeur.openingTime || vendeur.closingTime) && (
                    <div className="mb-4 flex items-center gap-2 text-xs text-zinc-600 bg-zinc-50 rounded-lg px-3 py-2 border border-zinc-100">
                      <Clock className="h-3.5 w-3.5 text-zinc-400 flex-shrink-0" />
                      <span className="font-medium">
                        Ouvert de {vendeur.openingTime || "?"} à{" "}
                        {vendeur.closingTime || "?"}
                      </span>
                    </div>
                  )}

                  {/* Réseaux */}
                  <div className="mb-6 pt-4 border-t border-zinc-100/60">
                    <div className="flex items-center gap-1.5 mb-3">
                      <Smartphone className="h-3.5 w-3.5 text-zinc-400" />
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                        Réseaux actifs
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(vendeur.networks || {}).map(
                        ([name, active]) =>
                          active && (
                            <span
                              key={name}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-50 text-zinc-600 rounded-lg text-xs font-medium border border-zinc-100"
                            >
                              <CheckCircle className="h-3 w-3 text-emerald-500" />
                              {name}
                            </span>
                          )
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="border-t border-zinc-100/60 pt-3 mt-auto">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/vendeur-details?id=${vendeur.id}`);
                      }}
                      className="w-full flex items-center justify-between group/btn text-primary font-semibold py-1 transition-all duration-200"
                    >
                      <span className="text-xs uppercase tracking-wider">
                        Voir les offres
                      </span>
                      <ChevronRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 max-w-sm mx-auto">
            <div className="w-12 h-12 bg-zinc-50 rounded-2xl border border-zinc-100 flex items-center justify-center mx-auto mb-4">
              <Clock className="h-5 w-5 text-zinc-400" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 mb-1">
              Aucun marchand disponible
            </h3>
            <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
              Soyez le premier à rejoindre la plateforme.
            </p>
            <button
              onClick={() => navigate("/register")}
              className="inline-flex items-center gap-2 bg-zinc-950 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-zinc-900 active:scale-[0.98] transition-all shadow-sm"
            >
              <UserPlus className="h-4 w-4" />
              Commencer maintenant
            </button>
          </div>
        )}
      </main>
    </PublicLayout>
  );
}