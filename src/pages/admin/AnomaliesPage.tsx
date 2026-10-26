// src/pages/admin/AnomaliesPage.tsx

import { ShieldAlert, AlertTriangle, Users, Coins, TrendingUp } from "lucide-react";
import { Card, CardHeader } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";

const detectionRules = [
  {
    icon: Users,
    title: "Auto-parrainage",
    description:
      "Un affilié qui tente de parrainer son propre compte (même téléphone, même email).",
    status: "actif",
  },
  {
    icon: Coins,
    title: "Doublons de commission",
    description:
      "Deux commissions créées pour le même événement source. Bloqué par l'index unique.",
    status: "actif",
  },
  {
    icon: TrendingUp,
    title: "Volumes anormaux",
    description:
      "Un affilié qui génère un nombre inhabituel de filleuls en peu de temps.",
    status: "a_venir",
  },
  {
    icon: AlertTriangle,
    title: "Commandes fictives",
    description:
      "Commandes sans livraison réelle ou avec des montants suspects.",
    status: "a_venir",
  },
];

export default function AnomaliesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Anomalies</h1>
        <p className="text-sm text-gray-600 mt-1">
          Détection et suivi des cas suspects
        </p>
      </div>

      {/* Bandeau info */}
      <Card>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="text-orange-700" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              Module en construction
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              La détection automatique des anomalies sera disponible dans une
              prochaine version. Les règles déjà actives côté backend sont
              listées ci-dessous.
            </p>
          </div>
        </div>
      </Card>

      {/* Règles de détection */}
      <Card>
        <CardHeader
          title="Règles de détection"
          description="Mécanismes de protection en place"
        />

        <div className="space-y-3">
          {detectionRules.map((rule, i) => {
            const Icon = rule.icon;
            return (
              <div
                key={i}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center flex-shrink-0 border border-gray-200">
                  <Icon className="text-gray-600" size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-gray-900">{rule.title}</p>
                    <Badge
                      variant={rule.status === "actif" ? "success" : "warning"}
                    >
                      {rule.status === "actif" ? "Actif" : "À venir"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {rule.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Ce qui sera ajouté */}
      <Card>
        <CardHeader
          title="Prochaines étapes"
          description="Fonctionnalités prévues"
        />

        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex gap-2">
            <span className="text-primary font-bold">•</span>
            <span>
              Page dédiée avec liste des cas suspects détectés automatiquement
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary font-bold">•</span>
            <span>
              Bouton d'action : "Vérifier" pour confirmer ou infirmer une
              anomalie
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary font-bold">•</span>
            <span>
              Historique des actions sur les anomalies (audit)
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-primary font-bold">•</span>
            <span>
              Notifications automatiques quand une anomalie est détectée
            </span>
          </li>
        </ul>
      </Card>
    </div>
  );
}