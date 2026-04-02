import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getSubscription, getUserAssessments } from "../lib/api";
import ScoreGauge from "../components/ScoreGauge";
import RiskBadge from "../components/RiskBadge";
import LoadingSpinner from "../components/LoadingSpinner";

function ScoreChart({ assessments }) {
  if (assessments.length < 2) return null;

  const data = [...assessments].reverse().slice(-10);
  const maxScore = 100;
  const width = 500;
  const height = 200;
  const padding = 40;
  const plotW = width - padding * 2;
  const plotH = height - padding * 2;

  const points = data.map((a, i) => ({
    x: padding + (i / Math.max(1, data.length - 1)) * plotW,
    y: padding + plotH - (a.score / maxScore) * plotH,
    score: a.score,
    date: new Date(a.createdAt).toLocaleDateString(),
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding + plotH} L ${points[0].x} ${padding + plotH} Z`;

  const riskColor = (score) =>
    score >= 76 ? "#EF4444" : score >= 51 ? "#F97316" : score >= 26 ? "#EAB308" : "#22C55E";

  return (
    <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur">
      <h2 className="mb-6 text-lg font-semibold text-white">Score history</h2>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full max-w-lg"
        role="img"
        aria-label="Score history chart"
      >
        <defs>
          <linearGradient id="scoreLineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFD700" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FFD700" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="scoreAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFD700" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 25, 50, 75, 100].map((v) => {
          const y = padding + plotH - (v / maxScore) * plotH;
          return (
            <g key={v}>
              <line
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="1"
              />
              <text x={padding - 8} y={y + 4} textAnchor="end" fontSize="11" fill="rgba(255,255,255,0.4)">
                {v}
              </text>
            </g>
          );
        })}
        <path d={areaPath} fill="url(#scoreAreaGrad)" />
        <path
          d={linePath}
          fill="none"
          stroke="url(#scoreLineGrad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="5" fill={riskColor(p.score)} stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
            <title>{`${p.date}: ${p.score}/100`}</title>
          </g>
        ))}
        <text x={points[0].x} y={height - 8} textAnchor="start" fontSize="10" fill="rgba(255,255,255,0.4)">
          {points[0].date}
        </text>
        <text
          x={points[points.length - 1].x}
          y={height - 8}
          textAnchor="end"
          fontSize="10"
          fill="rgba(255,255,255,0.4)"
        >
          {points[points.length - 1].date}
        </text>
      </svg>
      {data.length >= 2 && (
        <p className="mt-4 text-sm text-white/50">
          {data[data.length - 1].score < data[0].score
            ? `Your score improved by ${data[0].score - data[data.length - 1].score} points since your first scan.`
            : data[data.length - 1].score > data[0].score
              ? `Your exposure increased by ${data[data.length - 1].score - data[0].score} points. Check your remediation steps.`
              : "Your score is stable."}
        </p>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState([]);
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [a, s] = await Promise.all([getUserAssessments(), getSubscription()]);
        if (!cancelled) {
          setAssessments(a.data.data || []);
          setSub(s.data.data);
        }
      } catch {
        if (!cancelled) setAssessments([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const latest = assessments[0];
  const firstName = user?.firstName || "";

  return (
    <div className="min-h-screen bg-[#0a1628]">
      <section className="bg-navy px-4 py-12">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Welcome back{firstName ? `, ${firstName}` : ""}
            </h1>
            <p className="mt-1 text-white/60">Here&apos;s your security overview</p>
          </div>
          <Link
            to="/assessment"
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-brandyellow px-8 py-4 text-sm font-semibold text-navy shadow-lg shadow-yellow-500/25 transition-all duration-300 hover:brightness-110"
          >
            Run new assessment
          </Link>
        </div>

        <div className="mx-auto mt-10 grid max-w-6xl gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition-all duration-300 hover:border-white/20">
            <p className="text-sm text-white/60">Latest score</p>
            {loading ? (
              <div className="mt-4 flex justify-center">
                <LoadingSpinner />
              </div>
            ) : latest ? (
              <div className="mt-2 flex items-center gap-4">
                <div className="scale-90">
                  <ScoreGauge score={latest.score} size={120} showRiskLabel={false} />
                </div>
                <div>
                  <RiskBadge level={latest.riskLevel} />
                  <p className="mt-2 text-xs text-white/50">
                    {latest.emailSearched} — {new Date(latest.createdAt).toLocaleDateString()}
                  </p>
                  <Link
                    to={`/assessment?resume=${latest.id}`}
                    className="mt-2 inline-block text-sm font-semibold text-brandyellow transition-all duration-300 hover:brightness-110"
                  >
                    View details
                  </Link>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-white/50">No scans yet</p>
            )}
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition-all duration-300 hover:border-white/20">
            <p className="text-sm text-white/60">Total assessments</p>
            <p className="mt-2 text-4xl font-extrabold text-white">{loading ? "—" : assessments.length}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition-all duration-300 hover:border-white/20">
            <p className="text-sm text-white/60">Risk level</p>
            <p className="mt-2 text-2xl font-bold capitalize text-white">
              {loading ? "—" : latest?.riskLevel || "—"}
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12">
        {!loading && (
          <div className="mb-10 rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur">
            <h2 className="text-lg font-semibold text-white">Subscription</h2>
            <p className="mt-2 capitalize text-white/70">
              {sub?.tier === "premium" ? "Premium" : "Free"}
            </p>
            {sub?.tier === "premium" && sub?.currentPeriodEnd && (
              <p className="mt-1 text-xs text-white/50">
                Renews {new Date(sub.currentPeriodEnd).toLocaleDateString()}
              </p>
            )}
            <Link
              to="/pricing"
              className="mt-6 inline-block rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-navy/90"
            >
              {sub?.tier === "premium" ? "Manage billing" : "Upgrade to Premium"}
            </Link>
          </div>
        )}

        {!loading && !latest && (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur">
            <p className="text-white/70">Run your first assessment to see your score.</p>
            <Link
              to="/assessment"
              className="mt-6 inline-block rounded-full bg-brandyellow px-8 py-4 text-sm font-semibold text-navy shadow-lg shadow-yellow-500/25 transition-all duration-300 hover:brightness-110"
            >
              Run assessment
            </Link>
          </div>
        )}

        {!loading && assessments.length >= 2 && <ScoreChart assessments={assessments} />}

        <section className="mt-12">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-white">Past assessments</h2>
            <Link
              to="/assessment"
              className="rounded-full bg-brandyellow px-6 py-3 text-sm font-semibold text-navy shadow-lg shadow-yellow-500/25 transition-all duration-300 hover:brightness-110"
            >
              Run new assessment
            </Link>
          </div>
          <ul className="mt-6 space-y-3">
            {assessments.map((row) => (
              <li
                key={row.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur transition-all duration-300 hover:bg-white/10"
              >
                <div>
                  <p className="font-medium text-white">{row.emailSearched}</p>
                  <p className="text-xs text-white/50">{new Date(row.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`font-semibold ${
                      row.score >= 76
                        ? "text-red-400"
                        : row.score >= 51
                          ? "text-orange-400"
                          : row.score >= 26
                            ? "text-yellow-400"
                            : "text-green-400"
                    }`}
                  >
                    {row.score}
                  </span>
                  <RiskBadge level={row.riskLevel} />
                  <Link
                    to={`/remediation/${row.id}`}
                    className="text-sm font-semibold text-brandyellow transition-all duration-300 hover:brightness-110"
                  >
                    View details
                  </Link>
                </div>
              </li>
            ))}
            {!assessments.length && !loading && (
              <li className="rounded-2xl border border-white/10 px-6 py-8 text-center text-white/50">
                No assessments yet.
              </li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
