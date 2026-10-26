// src/components/ui/Select.tsx

import { SelectHTMLAttributes, forwardRef } from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helper?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { label, error, helper, options, placeholder, className = "", id, ...props },
    ref
  ) => {
    const selectId = id || props.name;

    return (
      <div>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`
            w-full px-4 py-3
            border rounded-lg
            text-sm bg-white
            focus:outline-none focus:ring-2
            transition
            ${
              error
                ? "border-red-300 focus:ring-red-200 focus:border-red-500"
                : "border-gray-300 focus:ring-primary/20 focus:border-primary"
            }
            disabled:bg-gray-50 disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
        {helper && !error && (
          <p className="mt-1.5 text-xs text-gray-500">{helper}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";