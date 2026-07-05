import { forwardRef } from 'react';

const Input = forwardRef(function Input({ label, error, className = '', id, ...props }, ref) {
  const inputId = id || props.name;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-ink-soft">
          {label}
        </label>
      )}
      <input
        id={inputId}
        ref={ref}
        className={`w-full rounded-md border bg-paper-raised px-3.5 py-2.5 font-sans text-ink outline-none transition-colors placeholder:text-ink-soft/50 focus:ring-2 focus:ring-brand/25 ${
          error ? 'border-danger' : 'border-line focus:border-brand'
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
    </div>
  );
});

export default Input;
