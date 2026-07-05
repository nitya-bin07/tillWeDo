import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-brand text-white hover:bg-brand-dark',
  forest: 'bg-forest text-white hover:bg-forest/90',
  secondary: 'bg-transparent text-ink border border-ink/20 hover:bg-ink/5',
  danger: 'bg-danger text-white hover:bg-danger/90',
  ghost: 'bg-transparent text-ink-soft hover:bg-ink/5',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5',
  lg: 'px-7 py-3.5 text-lg',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  children,
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-md font-sans font-semibold tracking-tight transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:cursor-not-allowed disabled:opacity-50 ${
        variants[variant] || variants.primary
      } ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  );
}
