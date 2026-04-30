import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
  sparkle?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', glow = false, sparkle = false, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] relative overflow-hidden group';

    const variants = {
      primary: 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:-translate-y-0.5 hover:brightness-105 border-none',
      secondary: 'bg-orange-100 text-orange-900 hover:bg-orange-200 hover:-translate-y-0.5 dark:bg-orange-900/40 dark:text-orange-100 shadow-sm',
      outline: 'border-2 border-orange-500 text-orange-600 hover:bg-orange-50 hover:-translate-y-0.5 dark:text-orange-400 dark:hover:bg-orange-950/30',
      ghost: 'text-orange-600 hover:bg-orange-50 hover:-translate-y-0.5 dark:text-orange-400 dark:hover:bg-orange-950/30',
      gradient: 'bg-gradient-to-r from-orange-400 via-red-500 to-pink-600 text-white shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/60 hover:-translate-y-1 hover:brightness-110 border-none animate-gradient-shift'
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg'
    };

    const glowClass = glow ? 'animate-pulse-glow' : '';
    const sparkleClass = sparkle ? 'hover:animate-shimmer-border' : '';

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${glowClass} ${sparkleClass} ${className}`}
        {...props}
      >
        {/* Ripple effect */}
        <span className="absolute inset-0 bg-white/20 rounded-lg scale-0 group-active:scale-100 transition-transform duration-200 ease-out"></span>

        {/* Sparkle particles on hover */}
        {sparkle && (
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute top-1 right-2 w-1 h-1 bg-white rounded-full animate-sparkle delay-100"></div>
            <div className="absolute top-2 left-3 w-0.5 h-0.5 bg-white rounded-full animate-sparkle delay-300"></div>
            <div className="absolute bottom-1 right-4 w-0.5 h-0.5 bg-white rounded-full animate-sparkle delay-500"></div>
          </div>
        )}

        <span className="relative z-10">{props.children}</span>
      </button>
    );
  }
);
Button.displayName = 'Button';
