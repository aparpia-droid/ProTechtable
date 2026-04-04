import { Link } from "react-router-dom";

const variants = {
  primary:
    "bg-brandyellow text-gray-900 font-bold shadow-glow hover:bg-yellow-300 hover:shadow-glow-lg active:scale-[0.98] transition-all duration-200",
  secondary:
    "border border-surface-border text-gray-300 hover:bg-surface-overlay hover:text-white active:scale-[0.98] transition-all duration-200",
  danger:
    "bg-danger-soft text-danger border border-danger-muted hover:bg-danger-muted active:scale-[0.98] transition-all duration-200",
  success:
    "bg-success-soft text-success border border-success-muted hover:bg-success-muted active:scale-[0.98] transition-all duration-200",
  ghost:
    "text-gray-400 hover:text-white hover:bg-surface-raised active:scale-[0.98] transition-all duration-200",
};

const sizes = {
  sm: "px-3 py-1.5 text-caption rounded-button",
  md: "px-5 py-2.5 text-body rounded-button",
  lg: "px-8 py-3.5 text-body rounded-button",
};

export default function Button({
  variant = "primary",
  size = "md",
  to,
  href,
  disabled,
  loading,
  children,
  className = "",
  ...props
}) {
  const classes = `inline-flex items-center justify-center gap-2 font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-brandyellow focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0f] disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`;

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" disabled={disabled || loading} className={classes} {...props}>
      {loading && (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray="32"
            strokeLinecap="round"
            className="opacity-25"
          />
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray="32"
            strokeDashoffset="24"
            strokeLinecap="round"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
