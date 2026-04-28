import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';
    
    const variants = {
      primary: 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-0.5 hover:brightness-105 border-none',
      secondary: 'bg-orange-100 text-orange-900 hover:bg-orange-200 hover:-translate-y-0.5 dark:bg-orange-900/40 dark:text-orange-100 shadow-sm',
      outline: 'border-2 border-orange-500 text-orange-600 hover:bg-orange-50 hover:-translate-y-0.5 dark:text-orange-400 dark:hover:bg-orange-950/30',
      ghost: 'text-orange-600 hover:bg-orange-50 hover:-translate-y-0.5 dark:text-orange-400 dark:hover:bg-orange-950/30'
    };
    
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg'
    };
    
    return (
      <button 
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
