/**
 * Horizontal bar for score breakdown category.
 */
export default function ScoreBar({ label, score, max, color }) {
  const pct = max > 0 ? Math.min(100, (score / max) * 100) : 0;
  const colorMap = {
    red: "bg-red-500",
    orange: "bg-orange-500",
    yellow: "bg-yellow-500",
    blue: "bg-blue-500",
  };
  const bar = colorMap[color] || "bg-brandyellow";

  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-white/90">{label}</span>
        <span className="text-white/50">
          {score} / {max}
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
        <div className={`h-full rounded-full ${bar} transition-all duration-300`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
