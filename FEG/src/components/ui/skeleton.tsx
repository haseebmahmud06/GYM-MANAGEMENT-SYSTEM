/**
 * Skeleton loading component for loading states.
 * Provides shimmer animation for a premium loading experience.
 */
import * as React from 'react';
import { cn } from '@/lib/utils';

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-charcoal-200 dark:bg-charcoal-800',
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };