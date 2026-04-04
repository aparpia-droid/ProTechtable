import { useEffect, useState } from "react";

export default function ProgressRing({ value = 0, size = 180, strokeWidth = 8, label, showGrade = false }) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const r = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * r;

  const color = value <= 25 ? "#22C55E" : value <= 50 ? "#EAB308" : value <= 75 ? "#F97316" : "#EF4444";
  const riskLabel = value <= 25 ? "Low Risk" : value <= 50 ? "Medium Risk" : value <= 75 ? "High Risk" : "Critical";
  const grade = value <= 20 ? "A" : value <= 40 ? "B" : value <= 60 ? "C" : value <= 80 ? "D" : "F";

  useEffect(() => {
    if (value === 0) { setAnimatedValue(0); return; }
    let cancelled = false;
    const duration = 1200;
    const start = performance.now();
    function tick(now) {
      if (cancelled) return;
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedValue(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
    return () => { cancelled = true; };
  }, [value]);

  const offset = circumference - (animatedValue / 100) * circumference;

  return (
    <div
      className="relative flex flex-col items-center"
      role="img"
      aria-label={`${label || "Score"}: ${value} out of 100`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            filter: `drop-shadow(0 0 12px ${color}50)`,
            transition: "stroke-dashoffset 0.1s ease-out",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showGrade ? (
          <>
            <span className="text-5xl font-extrabold text-white">{grade}</span>
            <span className="text-caption text-white/40">{animatedValue}/100</span>
          </>
        ) : (
          <>
            <span className="text-5xl font-extrabold text-white tabular-nums">{animatedValue}</span>
            <span className="text-caption text-white/40">/ 100</span>
          </>
        )}
      </div>
      <p className="mt-3 text-caption font-semibold" style={{ color }}>
        {riskLabel}
      </p>
    </div>
  );
}
