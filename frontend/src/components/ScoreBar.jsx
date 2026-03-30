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
  const bar = colorMap[color] || "bg-navy";

  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-navy">{label}</span>
        <span className="text-brandgray">
          {score} / {max}
        </span>
      </div>
      <div className="h-2 w-full rounded bg-navy/10">
        <div className={`h-2 rounded ${bar}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
