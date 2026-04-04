import { forwardRef } from "react";

const Input = forwardRef(function Input({ label, error, hint, className = "", ...props }, ref) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-caption text-gray-300" htmlFor={props.id}>
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`w-full rounded-input border bg-surface-raised px-4 py-3 text-body text-white placeholder-white/30
          focus:outline-none focus:ring-2 focus:ring-brandyellow focus:border-transparent focus:shadow-[0_0_0_3px_rgba(255,215,0,0.1)]
          ${error ? "border-danger" : "border-surface-border"}
          transition-all duration-200
          ${className}`}
        {...props}
      />
      {error && <p className="text-micro text-danger">{error}</p>}
      {hint && !error && <p className="text-micro text-gray-500">{hint}</p>}
    </div>
  );
});

export default Input;
