// src/pages/admin/RulesPage.tsx

import { useState } from "react";
import { Settings, Plus, Edit2, Power } from "lucide-react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { EmptyState } from "../../components/ui/EmptyState";
import BaseModal from "../../components/ui/Modal";
import {
  useRewardRules,
  useRewardRuleActions,
} from "../../hooks/reward-rules/useRewardRules";
import {
  CreateRewardRulePayload,
  RewardMode,
  RewardRule,
} from "../../types/RewardRule";
import { ProgramType } from "../../types/Commission";

const programOptions = [
  { value: "affiliation_client", label: "Affiliation client" },
  { value: "affiliation_vendeur", label: "Affiliation vendeur" },
  { value: "parrainage_client", label: "Parrainage client existant" },
];

const modeOptions = [
  { value: "fixe", label: "Montant fixe" },
  { value: "pourcentage", label: "Pourcentage" },
  { value: "hybride", label: "Hybride (fixe + %)" },
];

const programLabels: Record<ProgramType, string> = {
  affiliation_client: "Affiliation client",
  affiliation_vendeur: "Affiliation vendeur",
  parrainage_client: "Parrainage client",
};

const modeLabels: Record<RewardMode, string> = {
  fixe: "Fixe",
  pourcentage: "Pourcentage",
  hybride: "Hybride",
};

interface FormState {
  name: string;
  description: string;
  program: ProgramType;
  mode: RewardMode;
  fixedAmount: string;
  percentage: string;
  cap: string;
  currency: string;
  availabilityDelayDays: string;
  active: boolean;
}

const emptyForm: FormState = {
  name: "",
  description: "",
  program: "affiliation_client",
  mode: "fixe",
  fixedAmount: "",
  percentage: "",
  cap: "",
  currency: "CDF",
  availabilityDelayDays: "7",
  active: true,
};

export default function RulesPage() {
  const { rules, loading, refetch } = useRewardRules();
  const {
    create,
    update,
    toggleActive,
    loading: actionLoading,
  } = useRewardRuleActions();

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<RewardRule | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState("");

  const resetForm = () => {
    setForm(emptyForm);
    setEditing(null);
    setFormError("");
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (rule: RewardRule) => {
    setEditing(rule);
    setForm({
      name: rule.name,
      description: rule.description ?? "",
      program: rule.program,
      mode: rule.mode,
      fixedAmount: rule.fixedAmount?.toString() ?? "",
      percentage: rule.percentage?.toString() ?? "",
      cap: rule.cap?.toString() ?? "",
      currency: rule.currency,
      availabilityDelayDays: rule.availabilityDelayDays.toString(),
      active: rule.active,
    });
    setFormError("");
    setShowModal(true);
  };

  const validateForm = (): string | null => {
    if (!form.name.trim()) return "Le nom est requis";
    if (form.mode === "fixe" && !form.fixedAmount) {
      return "Le montant fixe est requis pour ce mode";
    }
    if (form.mode === "pourcentage" && !form.percentage) {
      return "Le pourcentage est requis pour ce mode";
    }
    if (form.mode === "hybride" && (!form.fixedAmount || !form.percentage)) {
      return "Montant fixe et pourcentage requis pour le mode hybride";
    }
    if (!form.availabilityDelayDays) {
      return "Le délai de disponibilité est requis";
    }
    return null;
  };

  const buildPayload = (): CreateRewardRulePayload => {
    return {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      program: form.program,
      mode: form.mode,
      fixedAmount: form.fixedAmount ? Number(form.fixedAmount) : undefined,
      percentage: form.percentage ? Number(form.percentage) : undefined,
      cap: form.cap ? Number(form.cap) : undefined,
      currency: form.currency || "CDF",
      availabilityDelayDays: Number(form.availabilityDelayDays),
      active: form.active,
    };
  };

  const handleSubmit = async () => {
    const err = validateForm();
    if (err) {
      setFormError(err);
      return;
    }

    try {
      const payload = buildPayload();
      if (editing && editing._id) {
        await update(editing._id, payload);
      } else {
        await create(payload);
      }
      setShowModal(false);
      resetForm();
      refetch();
    } catch (err: any) {
      setFormError(err?.message ?? "Erreur lors de l'enregistrement");
    }
  };

  const handleToggleActive = async (rule: RewardRule) => {
    if (!rule._id) return;
    try {
      await toggleActive(rule._id, !rule.active);
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Règles de récompense</h1>
          <p className="text-sm text-gray-600 mt-1">
            {rules.length} règle{rules.length > 1 ? "s" : ""} configurée
            {rules.length > 1 ? "s" : ""}
          </p>
        </div>

        <Button onClick={openCreateModal} icon={<Plus size={18} />}>
          Nouvelle règle
        </Button>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <div className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </Card>
          ))}
        </div>
      ) : rules.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Settings className="h-8 w-8 text-gray-400" />}
            title="Aucune règle"
            description="Créez une règle pour commencer à calculer des commissions"
            action={
              <Button onClick={openCreateModal} size="sm">
                Créer une règle
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => {
            const id = rule._id;
            if (!id) return null;

            return (
              <Card key={id}>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900 truncate">
                        {rule.name}
                      </p>
                      <Badge variant={rule.active ? "success" : "default"}>
                        {rule.active ? "Active" : "Inactive"}
                      </Badge>
                    </div>

                    {rule.description && (
                      <p className="text-xs text-gray-500 mt-1">
                        {rule.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge variant="primary">
                        {programLabels[rule.program]}
                      </Badge>
                      <Badge variant="info">{modeLabels[rule.mode]}</Badge>
                    </div>

                    <div className="mt-2 text-xs text-gray-600 space-y-0.5">
                      {rule.mode === "fixe" && rule.fixedAmount !== undefined && (
                        <p>
                          Montant :{" "}
                          <span className="font-semibold">
                            {rule.fixedAmount} {rule.currency}
                          </span>
                        </p>
                      )}
                      {(rule.mode === "pourcentage" || rule.mode === "hybride") &&
                        rule.percentage !== undefined && (
                          <p>
                            Pourcentage :{" "}
                            <span className="font-semibold">
                              {rule.percentage}%
                            </span>
                          </p>
                        )}
                      {rule.mode === "hybride" && rule.fixedAmount !== undefined && (
                        <p>
                          Montant fixe :{" "}
                          <span className="font-semibold">
                            {rule.fixedAmount} {rule.currency}
                          </span>
                        </p>
                      )}
                      {rule.cap !== undefined && (
                        <p>
                          Plafond :{" "}
                          <span className="font-semibold">
                            {rule.cap} {rule.currency}
                          </span>
                        </p>
                      )}
                      <p>
                        Délai de disponibilité :{" "}
                        <span className="font-semibold">
                          {rule.availabilityDelayDays} jour
                          {rule.availabilityDelayDays > 1 ? "s" : ""}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditModal(rule)}
                      disabled={actionLoading}
                      icon={<Edit2 size={16} />}
                    >
                      Modifier
                    </Button>
                    <Button
                      size="sm"
                      variant={rule.active ? "outline" : "primary"}
                      onClick={() => handleToggleActive(rule)}
                      disabled={actionLoading}
                      icon={<Power size={16} />}
                    >
                      {rule.active ? "Désactiver" : "Activer"}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal création / édition */}
      <BaseModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={editing ? "Modifier la règle" : "Nouvelle règle"}
        subtitle="Configuration de la récompense"
        icon={<Settings className="w-5 h-5 text-white" />}
        size="md"
      >
        <div className="space-y-4">
          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {formError}
            </div>
          )}

          <Input
            label="Nom de la règle"
            placeholder="Ex: Affiliation client - défaut"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <Input
            label="Description (optionnel)"
            placeholder="Description de la règle"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <Select
            label="Programme"
            options={programOptions}
            value={form.program}
            onChange={(e) =>
              setForm({ ...form, program: e.target.value as ProgramType })
            }
          />

          <Select
            label="Mode de récompense"
            options={modeOptions}
            value={form.mode}
            onChange={(e) =>
              setForm({ ...form, mode: e.target.value as RewardMode })
            }
          />

          {(form.mode === "fixe" || form.mode === "hybride") && (
            <Input
              label="Montant fixe (CDF)"
              type="number"
              placeholder="500"
              value={form.fixedAmount}
              onChange={(e) => setForm({ ...form, fixedAmount: e.target.value })}
            />
          )}

          {(form.mode === "pourcentage" || form.mode === "hybride") && (
            <Input
              label="Pourcentage (%)"
              type="number"
              placeholder="5"
              value={form.percentage}
              onChange={(e) => setForm({ ...form, percentage: e.target.value })}
            />
          )}

          <Input
            label="Plafond (CDF, optionnel)"
            type="number"
            placeholder="Ex: 10000"
            value={form.cap}
            onChange={(e) => setForm({ ...form, cap: e.target.value })}
          />

          <Input
            label="Délai de disponibilité (jours)"
            type="number"
            placeholder="7"
            value={form.availabilityDelayDays}
            onChange={(e) =>
              setForm({ ...form, availabilityDelayDays: e.target.value })
            }
            helper="Délai après lequel la commission devient disponible"
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="rule-active"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <label
              htmlFor="rule-active"
              className="text-sm text-gray-700 cursor-pointer"
            >
              Règle active
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
              fullWidth
            >
              Annuler
            </Button>
            <Button onClick={handleSubmit} loading={actionLoading} fullWidth>
              {editing ? "Enregistrer" : "Créer"}
            </Button>
          </div>
        </div>
      </BaseModal>
    </div>
  );
}