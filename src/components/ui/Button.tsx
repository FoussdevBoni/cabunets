// src/components/ui/Button.tsx

import { ButtonHTMLAttributes, forwardRef, ReactNode } from "react";
import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-white hover:bg-primary/90 focus:ring-primary/20 disabled:bg-primary/50",
  secondary:
    "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-300 disabled:bg-gray-100/50",
  outline:
    "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-200 disabled:opacity-50",
  ghost:
    "text-gray-700 hover:bg-gray-100 focus:ring-gray-200 disabled:opacity-50",
  danger:
    "bg-red-600 text-white hover:bg-red-700 focus:ring-red-200 disabled:bg-red-600/50",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      icon,
      className = "",
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`
          inline-flex items-center justify-center gap-2
          rounded-lg font-medium
          transition-colors
          focus:outline-none focus:ring-2
          disabled:cursor-not-allowed
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${fullWidth ? "w-full" : ""}
          ${className}
        `}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          icon && <span>{icon}</span>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";