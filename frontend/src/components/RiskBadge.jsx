const map = {
  low: { className: "bg-green-500/10 text-green-400 border-green-500/20", label: "Low" },
  medium: { className: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20", label: "Medium" },
  high: { className: "bg-orange-500/10 text-orange-400 border-orange-500/20", label: "High" },
  critical: { className: "bg-red-500/10 text-red-400 border-red-500/20", label: "Critical" },
};

export default function RiskBadge({ level }) {
  const key = (level || "").toLowerCase();
  const cfg = map[key] || map.medium;
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-sm font-medium ${cfg.className}`}
    >
      {cfg.label} risk
    </span>
  );
}
