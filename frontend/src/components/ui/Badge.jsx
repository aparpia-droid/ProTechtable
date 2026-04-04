const badgeVariants = {
  danger: "bg-danger-soft text-danger border-danger-muted",
  success: "bg-success-soft text-success border-success-muted",
  warning: "bg-warning-soft text-warning border-warning-muted",
  info: "bg-info-soft text-info border-info-muted",
  neutral: "bg-surface-overlay text-gray-400 border-surface-border",
  brand: "bg-brandyellow/15 text-brandyellow border-brandyellow/20",
};

export default function Badge({ variant = "neutral", children, className = "", ...props }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-badge border px-2.5 py-0.5 text-micro font-semibold ${badgeVariants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
