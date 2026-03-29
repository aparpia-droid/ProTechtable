/**
 * Circular score gauge using SVG stroke-dasharray.
 * @param {{ score: number, size?: number, label?: string }} props
 */
export default function ScoreGauge({ score, size = 200, label = "Score" }) {
  const s = Math.min(100, Math.max(0, Number(score) || 0));
  const stroke =
    s <= 25 ? "#22C55E" : s <= 50 ? "#EAB308" : s <= 75 ? "#F97316" : "#EF4444";
  const r = 45;
  const c = 2 * Math.PI * r;
  const offset = c - (s / 100) * c;

  return (
    <div
      className="relative flex flex-col items-center"
      role="img"
      aria-label={`${label}: ${s} out of 100`}
    >
      <svg width={size} height={size} viewBox="0 0 100 100" className="-rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#E5E7EB" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={stroke}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-300"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-navy">{Math.round(s)}</span>
        <span className="text-xs text-brandgray">/ 100</span>
      </div>
    </div>
  );
}
