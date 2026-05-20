import { cn } from '../../utils/classNames.js';
import { motion } from 'framer-motion';

const base =
  'inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none';

const variants = {
  primary: [
    'text-white shadow-md',
    'hover:shadow-lg hover:-translate-y-0.5 hover:shadow-cyan-500/30',
    'active:translate-y-0',
    'disabled:shadow-none'
  ].join(' '),
  outline: [
    'border-2 bg-transparent',
    'hover:-translate-y-0.5',
  ].join(' '),
  ghost: [
    'bg-transparent',
    'hover:-translate-y-0.5',
  ].join(' ')
};

const sizes = {
  sm: 'h-9 px-3 text-xs',
  md: 'h-10 px-4',
  lg: 'h-12 px-6 text-base',
  icon: 'h-10 w-10 p-0'
};

function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  as,
  ...props
}) {
  const Component = as || motion.button;
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-cyan-500 to-cyan-400 text-white shadow-cyan-500/25 hover:from-cyan-600 hover:to-cyan-500 focus-visible:ring-cyan-500 dark:from-cyan-400 dark:to-cyan-300 dark:text-slate-900 dark:shadow-cyan-400/30',
    outline: 'border-cyan-500 text-cyan-500 hover:bg-cyan-500/10 focus-visible:ring-cyan-500 dark:border-cyan-400 dark:text-cyan-400 dark:hover:bg-cyan-400/10',
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-500 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
  };

  return (
    <Component
      className={cn(base, sizes[size], variantClasses[variant], className)}
      whileHover={!props.disabled ? { scale: 1.02 } : undefined}
      whileTap={!props.disabled ? { scale: 0.98 } : undefined}
      {...props}
    >
      {children}
    </Component>
  );
}

export default Button;
