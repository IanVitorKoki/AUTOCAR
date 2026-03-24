import { LoaderCircle } from 'lucide-react';

const baseStyles =
  'inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-60';

const variantStyles = {
  primary: 'bg-brand-600 text-white shadow-soft hover:bg-brand-700',
  secondary: 'border border-slate-200 bg-white text-slate-700 hover:border-brand-200 hover:text-brand-700',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  danger: 'bg-red-600 text-white shadow-soft hover:bg-red-700',
};

const sizeStyles = {
  sm: 'h-10 px-4 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-base',
};

export function buttonStyles({ variant = 'primary', size = 'md', fullWidth = false, className = '' } = {}) {
  return `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${fullWidth ? 'w-full' : ''} ${className}`;
}

function Button({
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  fullWidth = false,
  isLoading = false,
  disabled = false,
  children,
  ...props
}) {
  return (
    <button
      type={type}
      className={buttonStyles({ variant, size, fullWidth, className })}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
}

export default Button;

