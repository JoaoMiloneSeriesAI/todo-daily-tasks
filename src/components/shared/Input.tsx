import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <input
          ref={ref}
          className={`
            w-full px-4 py-2
            bg-[var(--color-input-bg)] border border-[var(--color-input-border)] rounded-lg
            text-[var(--color-text-primary)] text-sm
            focus:bg-[var(--color-input-focus-bg)] focus:border-primary-main focus:ring-2 focus:ring-primary-main focus:ring-opacity-20
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            ${className}
          `}
          {...props}
        />

        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}

        {helperText && !error && (
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
