// src/components/ui/Badge.tsx

import { HTMLAttributes, ReactNode } from "react";

type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "primary";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  icon?: ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-gray-700",
  success: "bg-green-100 text-green-700",
  warning: "bg-orange-100 text-orange-700",
  danger: "bg-red-100 text-red-700",
  info: "bg-blue-100 text-blue-700",
  primary: "bg-primary/10 text-primary",
};

export function Badge({
  variant = "default",
  icon,
  className = "",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1
        px-2.5 py-0.5
        rounded-full
        text-xs font-medium
        ${variantClasses[variant]}
        ${className}
      `}
      {...props}
    >
      {icon}
      {children}
    </span>
  );
}

// Mapping statuts → variantes de badge
export type StatusVariantMap = Record<string, BadgeVariant>;

// Badge spécialisé pour les statuts métier
interface StatusBadgeProps {
  status: string;
  labels?: Record<string, string>;
  variants?: StatusVariantMap;
}

const defaultVariants: StatusVariantMap = {
  // Commissions
  detectee: "info",
  en_attente: "warning",
  disponible: "success",
  reservee: "warning",
  payee: "success",
  rejetee: "danger",
  annulee: "danger",

  // Retraits
  approuvee: "info",

  // Affiliés
  actif: "success",
  suspendu: "danger",

  // Génériques
  en_cours: "info",
  termine: "success",
};

const defaultLabels: Record<string, string> = {
  detectee: "Détectée",
  en_attente: "En attente",
  disponible: "Disponible",
  reservee: "Réservée",
  payee: "Payée",
  rejetee: "Rejetée",
  annulee: "Annulée",
  approuvee: "Approuvée",
  actif: "Actif",
  suspendu: "Suspendu",
};

export function StatusBadge({
  status,
  labels = defaultLabels,
  variants = defaultVariants,
}: StatusBadgeProps) {
  return (
    <Badge variant={variants[status] ?? "default"}>
      {labels[status] ?? status}
    </Badge>
  );
}