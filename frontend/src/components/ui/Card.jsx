import { Link } from "react-router-dom";

export default function Card({
  children,
  className = "",
  hover = false,
  glow = false,
  to,
  ...props
}) {
  const innerClass = `rounded-card border border-surface-border bg-surface-raised p-card-pad backdrop-blur-xl
        ${hover ? "transition-all duration-300 hover:border-brandyellow/20 hover:bg-surface-overlay hover:shadow-card hover:-translate-y-0.5" : ""}
        ${glow ? "shadow-glow" : ""}
        ${className}`;

  if (to) {
    return (
      <Link to={to} className={`block no-underline ${innerClass}`} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <div className={innerClass} {...props}>
      {children}
    </div>
  );
}
