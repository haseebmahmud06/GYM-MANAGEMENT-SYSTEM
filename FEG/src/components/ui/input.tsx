/**
 * Input component with label, error state, and icon support.
 * Accessible and styled for the enterprise dashboard.
 */
import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Error message to display */
  error?: string;
  /** Icon to display on the left */
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, icon, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400 dark:text-charcoal-500">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            'flex h-10 w-full rounded-md border bg-transparent px-3 py-2 text-sm ring-offset-white transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-charcoal-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/60 focus-visible:border-primary-500 disabled:cursor-not-allowed disabled:opacity-50 dark:ring-offset-charcoal-950 dark:border-charcoal-700 dark:placeholder:text-charcoal-500',
            'border-charcoal-300 text-charcoal-900 dark:text-charcoal-100',
            error && 'border-red-500 focus-visible:ring-red-500/60 focus-visible:border-red-500',
            icon && 'pl-10',
            className
          )}
          ref={ref}
          aria-invalid={!!error}
          aria-describedby={error ? `${props.id}-error` : undefined}
          {...props}
        />
        {error && (
          <p id={`${props.id}-error`} className="mt-1 text-xs text-red-500" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };