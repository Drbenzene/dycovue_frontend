import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          {
            // Primary variant - gradient background
            'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30':
              variant === 'primary',
            'hover:shadow-xl hover:shadow-emerald-500/40 hover:scale-105':
              variant === 'primary' && !props.disabled,
            
            // Secondary variant - outline
            'border-2 border-slate-300 text-slate-700 hover:bg-slate-50':
              variant === 'secondary',
            
            // Ghost variant - minimal
            'text-slate-600 hover:bg-slate-100': variant === 'ghost',
            
            // Danger variant
            'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/30':
              variant === 'danger',
            'hover:shadow-xl hover:shadow-red-500/40 hover:scale-105':
              variant === 'danger' && !props.disabled,
            
            // Sizes
            'px-3 py-1.5 text-sm': size === 'sm',
            'px-4 py-2 text-base': size === 'md',
            'px-6 py-3 text-lg': size === 'lg',
          },
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export default Button;
