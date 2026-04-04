export default function Skeleton({ className = "", lines = 1 }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 rounded-lg bg-gradient-to-r from-surface-raised via-surface-overlay to-surface-raised bg-[length:200%_100%] animate-shimmer"
          style={{ width: i === lines - 1 && lines > 1 ? "60%" : "100%" }}
        />
      ))}
    </div>
  );
}
