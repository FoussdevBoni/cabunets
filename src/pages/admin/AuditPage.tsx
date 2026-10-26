// src/pages/admin/AuditPage.tsx

import {
  ScrollText,
  FileText,
  Shield,
  Clock,
  Database,
} from "lucide-react";
import { Card, CardHeader } from "../../components/ui/Card";


const auditActions = [
  {
    icon: Shield,
    label: "Activation d'affilié",
    description: "Quand un admin active un affilié en attente",
  },
  {
    icon: Shield,
    label: "Suspension d'affilié",
    description: "Quand un admin suspend un affilié (avec motif)",
  },
  {
    icon: FileText,
    label: "Validation de commission",
    description: "Quand un admin valide une commission",
  },
  {
    icon: FileText,
    label: "Annulation de commission",
    description: "Quand un admin annule une commission (avec motif)",
  },
  {
    icon: FileText,
    label: "Approbation de retrait",
    description: "Quand un admin approuve une demande de retrait",
  },
  {
    icon: FileText,
    label: "Rejet de retrait",
    description: "Quand un admin rejette une demande (avec motif)",
  },
  {
    icon: FileText,
    label: "Paiement de retrait",
    description: "Quand un admin marque un retrait comme payé",
  },
  {
    icon: Database,
    label: "Modification de règle",
    description: "Quand un admin crée ou modifie une RewardRule",
  },
];

export default function AuditPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Journal d'audit</h1>
        <p className="text-sm text-gray-600 mt-1">
          Historique des actions administratives
        </p>
      </div>

      {/* Bandeau info */}
      <Card>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
            <ScrollText className="text-blue-700" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              Module en construction
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Le journal d'audit complet sera disponible dans une prochaine
              version. Il enregistrera toutes les actions administratives avec
              horodatage, acteur et détails.
            </p>
          </div>
        </div>
      </Card>

      {/* Actions qui seront tracées */}
      <Card>
        <CardHeader
          title="Actions tracées"
          description="Toutes les opérations sensibles seront journalisées"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {auditActions.map((action, i) => {
            const Icon = action.icon;
            return (
              <div
                key={i}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center flex-shrink-0 border border-gray-200">
                  <Icon className="text-gray-600" size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {action.label}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {action.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Structure prévue */}
      <Card>
        <CardHeader
          title="Structure prévue"
          description="Ce que chaque entrée d'audit contiendra"
        />

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Clock className="text-primary" size={16} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Horodatage</p>
              <p className="text-xs text-gray-600">
                Date et heure exacte de l'action
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Shield className="text-primary" size={16} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Acteur</p>
              <p className="text-xs text-gray-600">
                Qui a effectué l'action (admin)
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <FileText className="text-primary" size={16} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Détails</p>
              <p className="text-xs text-gray-600">
                Action, cible, valeurs avant/après
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Database className="text-primary" size={16} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Immuabilité</p>
              <p className="text-xs text-gray-600">
                Les entrées d'audit ne peuvent pas être modifiées ni supprimées
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}