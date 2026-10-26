// src/components/ui/Input.tsx

import { InputHTMLAttributes, forwardRef, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, helper, leftIcon, rightIcon, className = "", id, ...props },
    ref
  ) => {
    const inputId = id || props.name;

    return (
      <div>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full py-3
              border rounded-lg
              text-sm
              focus:outline-none focus:ring-2
              transition
              ${leftIcon ? "pl-10" : "pl-4"}
              ${rightIcon ? "pr-10" : "pr-4"}
              ${
                error
                  ? "border-red-300 focus:ring-red-200 focus:border-red-500"
                  : "border-gray-300 focus:ring-primary/20 focus:border-primary"
              }
              disabled:bg-gray-50 disabled:cursor-not-allowed
              ${className}
            `}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
        {helper && !error && (
          <p className="mt-1.5 text-xs text-gray-500">{helper}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";