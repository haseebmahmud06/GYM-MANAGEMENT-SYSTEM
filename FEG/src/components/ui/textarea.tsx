/**
 * Textarea component with theme-aware styling.
 * Matches the Input component's visual language.
 */
import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => (
    <div>
      <textarea
        ref={ref}
        className={cn(
          'flex min-h-[80px] w-full rounded-lg border border-charcoal-300 bg-white px-3 py-2 text-sm ring-offset-white transition-colors placeholder:text-charcoal-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-charcoal-700 dark:bg-charcoal-900 dark:text-charcoal-100 dark:placeholder:text-charcoal-500 dark:ring-offset-charcoal-950',
          error && 'border-red-500 focus-visible:ring-red-500',
          className
        )}
        aria-invalid={!!error}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
);
Textarea.displayName = 'Textarea';

export { Textarea };
