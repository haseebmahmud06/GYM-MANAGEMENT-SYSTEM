/**
 * Button component with variants, sizes, and loading state.
 * Built on Radix UI Slot for polymorphic rendering.
 */
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

// ============================================================
// Button Variants
// ============================================================

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-charcoal-950 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]',
  {
    variants: {
      variant: {
        default:
          'bg-charcoal-950 text-white hover:bg-charcoal-800 shadow-sm dark:bg-white dark:text-charcoal-950 dark:hover:bg-charcoal-100',
        destructive:
          'bg-red-600 text-white hover:bg-red-500 shadow-sm',
        outline:
          'border border-charcoal-300 bg-transparent text-charcoal-900 hover:bg-charcoal-50 dark:border-charcoal-700 dark:text-charcoal-100 dark:hover:bg-charcoal-800/50',
        secondary:
          'bg-charcoal-100 text-charcoal-900 hover:bg-charcoal-200 dark:bg-charcoal-800 dark:text-charcoal-100 dark:hover:bg-charcoal-700',
        ghost:
          'text-charcoal-700 hover:bg-charcoal-50 hover:text-charcoal-900 dark:text-charcoal-300 dark:hover:bg-charcoal-800 dark:hover:text-charcoal-100',
        link:
          'text-primary-600 underline-offset-4 hover:underline dark:text-primary-400',
        premium:
          'bg-primary-600 text-white hover:bg-primary-500 shadow-sm',
      },
      size: {
        default: 'h-10 px-4 py-2 text-sm',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-11 rounded-md px-6 text-base',
        xl: 'h-12 rounded-md px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

// ============================================================
// Button Props
// ============================================================

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Render as a different element using Radix Slot */
  asChild?: boolean;
  /** Show loading spinner */
  isLoading?: boolean;
}

// ============================================================
// Button Component
// ============================================================

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading, children, disabled, ...props }, ref) => {
    if (asChild) {
      // Radix Slot forwards every prop to the child element, including
      // `disabled`. To satisfy TypeScript (Slot's props omit the button-only
      // `disabled` attribute) we spread `disabled` back through `props` before
      // passing the object to Slot.
      const slotProps: Record<string, unknown> = { ...props, disabled: disabled || isLoading };
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...(slotProps as React.ComponentProps<'button'>)}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };