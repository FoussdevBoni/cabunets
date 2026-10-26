// src/components/ui/Card.tsx

import { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg";
}

const paddingClasses = {
  none: "",
  sm: "p-3",
  md: "p-4 sm:p-6",
  lg: "p-6 sm:p-8",
};

export function Card({
  padding = "md",
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`
        bg-white rounded-xl border border-gray-200
        ${paddingClasses[padding]}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function CardHeader({ title, description, action }: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-gray-600">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// Carte de statistique (pour les dashboards)
interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "primary";
}

const statVariantClasses = {
  default: "bg-gray-50 text-gray-700",
  success: "bg-green-50 text-green-700",
  warning: "bg-orange-50 text-orange-700",
  danger: "bg-red-50 text-red-700",
  primary: "bg-primary/10 text-primary",
};

export function StatCard({
  label,
  value,
  hint,
  icon,
  variant = "primary",
}: StatCardProps) {
  return (
    <Card padding="md">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold text-gray-900 truncate">
            {value}
          </p>
          {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
        </div>
        {icon && (
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${statVariantClasses[variant]}`}
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}