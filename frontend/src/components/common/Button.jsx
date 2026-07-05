import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-ink text-white hover:bg-black',
  secondary: 'bg-transparent text-ink border border-ink/25 hover:border-ink hover:bg-ink/[0.03]',
  accent: 'bg-accent text-white hover:bg-[#6f5a2f]',
  danger: 'bg-danger text-white hover:bg-danger/90',
  ghost: 'bg-transparent text-ink-soft hover:bg-ink/5',
};

const sizes = {
  sm: 'px-3.5 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3 text-base',
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
      className={`inline-flex items-center justify-center gap-2 rounded-sm font-sans font-medium tracking-tight transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-40 ${
        variants[variant] || variants.primary
      } ${sizes[size] || sizes.md} ${className}`}
      {...props}
    >
      {loading && <Loader2 size={15} className="animate-spin" />}
      {children}
    </button>
  );
}
