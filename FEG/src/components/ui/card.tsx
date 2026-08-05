/**
 * Card component with glassmorphism effects for the premium dashboard.
 * Supports hover effects, padding variants, and interactive states.
 */
import * as React from 'react';
import { cn } from '@/lib/utils';

// ============================================================
// Card Container
// ============================================================

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    /** Enable frosted glass effect */
    glass?: boolean;
    /** Enable hover lift effect */
    hover?: boolean;
    /** Remove padding */
    noPadding?: boolean;
  }
>(({ className, glass, hover, noPadding, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-xl border bg-white text-charcoal-900 shadow-[var(--shadow-sm)] dark:bg-charcoal-900 dark:text-charcoal-100 dark:border-charcoal-800',
      glass && 'bg-white/80 backdrop-blur-xl dark:bg-charcoal-900/80',
      hover && 'transition-all duration-200 hover:border-charcoal-300 hover:shadow-[var(--shadow-md)] dark:hover:border-charcoal-700',
      !noPadding && 'p-5',
      className
    )}
    {...props}
  />
));
Card.displayName = 'Card';

// ============================================================
// Card Header
// ============================================================

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 pb-4', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

// ============================================================
// Card Title
// ============================================================

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-[15px] font-semibold leading-snug tracking-tight text-charcoal-900 dark:text-white',
      className
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

// ============================================================
// Card Description
// ============================================================

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-charcoal-500 dark:text-charcoal-400', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

// ============================================================
// Card Content
// ============================================================

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('', className)} {...props} />
));
CardContent.displayName = 'CardContent';

// ============================================================
// Card Footer
// ============================================================

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center pt-4', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };