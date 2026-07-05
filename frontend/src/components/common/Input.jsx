import { forwardRef } from 'react';

const Input = forwardRef(function Input({ label, error, className = '', id, ...props }, ref) {
  const inputId = id || props.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-faint">
          {label}
        </label>
      )}
      <input
        id={inputId}
        ref={ref}
        className={`w-full rounded-sm border bg-paper-raised px-3.5 py-2.5 font-sans text-ink outline-none transition-colors placeholder:text-ink-faint/70 focus:ring-1 focus:ring-accent/40 ${
          error ? 'border-danger' : 'border-line focus:border-accent'
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
    </div>
  );
});

export default Input;
