import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import type { AmbulanceStatus } from '@/types';

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'available' | 'busy' | 'offline' | 'emergency' | 'default' | 'en_route';
  status?: AmbulanceStatus;
}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', status, children, ...props }, ref) => {
    const effectiveVariant = status || variant;

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-all',
          {
            // Available - green
            'bg-emerald-100 text-emerald-700 border border-emerald-300':
              effectiveVariant === 'available',

            // Busy - amber
            'bg-amber-100 text-amber-700 border border-amber-300':
              effectiveVariant === 'busy',

            // Offline - gray
            'bg-slate-100 text-slate-600 border border-slate-300':
              effectiveVariant === 'offline',

            // Emergency - red with pulse
            'bg-red-100 text-red-700 border border-red-300 animate-pulse':
              effectiveVariant === 'emergency',

            // Default
            'bg-blue-100 text-blue-700 border border-blue-300':
              effectiveVariant === 'default',
          },
          className
        )}
        {...props}
      >
        <span
          className={cn('w-2 h-2 rounded-full mr-2', {
            'bg-emerald-500': effectiveVariant === 'available',
            'bg-amber-500': effectiveVariant === 'busy',
            'bg-slate-400': effectiveVariant === 'offline',
            'bg-red-500': effectiveVariant === 'emergency',
            'bg-blue-500': effectiveVariant === 'default',
          })}
        />
        {children}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;
