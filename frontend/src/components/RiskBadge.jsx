const map = {
  low: { bg: "bg-green-100", text: "text-green-800", label: "Low" },
  medium: { bg: "bg-yellow-100", text: "text-yellow-900", label: "Medium" },
  high: { bg: "bg-orange-100", text: "text-orange-900", label: "High" },
  critical: { bg: "bg-red-100", text: "text-red-900", label: "Critical" },
};

export default function RiskBadge({ level }) {
  const key = (level || "").toLowerCase();
  const cfg = map[key] || map.medium;
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${cfg.bg} ${cfg.text}`}
    >
      {cfg.label} risk
    </span>
  );
}
