import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  getSubscription,
  getUserAssessments,
  getBrokerRemovals,
  getAlerts,
  getProfile,
  getCampusReport,
  toggleMonitoring,
  getBrokerFootprint,
} from "../lib/api";
import { useToast } from "../context/ToastContext";
import ScoreGauge from "../components/ScoreGauge";
import RiskBadge from "../components/RiskBadge";
import Badge from "../components/ui/Badge";
import Card from "../components/ui/Card";
import Skeleton from "../components/ui/Skeleton";

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
          <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFD700" stopOpacity="0.3" />
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
        <path d={areaPath} fill="url(#scoreGradient)" />
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
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [assessments, setAssessments] = useState([]);
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [brokerStats, setBrokerStats] = useState(null);
  const [unreadAlerts, setUnreadAlerts] = useState(0);
  const [monitoringEnabled, setMonitoringEnabled] = useState(false);
  const [monitoringBusy, setMonitoringBusy] = useState(false);
  const [campusReport, setCampusReport] = useState(null);
  const [footprint, setFootprint] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [a, s, br, al, p, fp] = await Promise.all([
          getUserAssessments().catch(() => ({ data: { data: [] } })),
          getSubscription().catch(() => ({ data: { data: null } })),
          getBrokerRemovals().catch(() => ({ data: { stats: null } })),
          getAlerts().catch(() => ({ data: { unreadCount: 0 } })),
          getProfile().catch(() => ({ data: { user: null } })),
          getBrokerFootprint().catch(() => ({ data: { data: null } })),
        ]);
        if (!cancelled) {
          setAssessments(a.data.data || []);
          setSub(s.data.data);
          setBrokerStats(br.data.stats || null);
          setUnreadAlerts(al.data.unreadCount ?? 0);
          setMonitoringEnabled(Boolean(p.data.user?.monitoringEnabled));
          setFootprint(fp.data?.data ?? null);
          if (p.data.user?.isStudent) {
            try {
              const cr = await getCampusReport();
              if (!cancelled && cr.data?.data) setCampusReport(cr.data.data);
            } catch {
              if (!cancelled) setCampusReport(null);
            }
          } else {
            setCampusReport(null);
          }
        }
      } catch {
        if (!cancelled) {
          setAssessments([]);
          setBrokerStats(null);
          setUnreadAlerts(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleMonitoringToggle() {
    if (sub?.tier !== "premium") return;
    const next = !monitoringEnabled;
    setMonitoringBusy(true);
    try {
      await toggleMonitoring(next);
      setMonitoringEnabled(next);
      await refreshUser();
    } catch (e) {
      showToast(e.response?.data?.message || "Could not update monitoring", "error");
    } finally {
      setMonitoringBusy(false);
    }
  }

  const latest = assessments[0];
  const firstName = user?.firstName || "";
  const isPremium = sub?.tier === "premium";
  const brokerTotal = brokerStats?.total ?? 0;
  const brokerConfirmed = brokerStats?.confirmed ?? 0;
  const brokerPct = brokerTotal > 0 ? Math.round((brokerConfirmed / brokerTotal) * 100) : 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const protectionLevel = useMemo(() => {
    let s = 0;
    if (latest) s += Math.max(0, 100 - latest.score) * 0.4;
    if (brokerStats) s += (brokerStats.confirmed / Math.max(1, brokerStats.total)) * 30;
    if (monitoringEnabled) s += 15;
    if (user?.emailVerified) s += 15;
    return Math.round(Math.min(100, s));
  }, [latest, brokerStats, monitoringEnabled, user?.emailVerified]);

  return (
    <div className="animate-fade-in min-h-screen bg-[#0a1628]">
      <section className="bg-navy px-4 py-12">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-heading text-white">
                {greeting}
                {firstName ? `, ${firstName}` : ", there"} 👋
              </h1>
              {user?.isStudent ? (
                <span className="rounded-full border border-emerald-400/40 bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-200">
                  Student
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-body text-gray-400">
              {latest
                ? `Your safety score is ${latest.score}/100. ${latest.score > 50 ? "Let's improve it." : "Looking good!"}`
                : "Run your first scan to see your digital safety score."}
            </p>
          </div>
          <Link
            to="/assessment"
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-brandyellow px-8 py-4 text-sm font-semibold text-navy shadow-lg shadow-yellow-500/25 transition-all duration-300 hover:brightness-110 active:scale-[0.98]"
          >
            Run new assessment
          </Link>
        </div>

        {!loading && (
          <div className="mx-auto mt-8 max-w-6xl">
            <div className="rounded-card border border-surface-border bg-surface-raised p-card-pad">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-caption text-gray-400">Overall Protection</p>
                  <p className="text-subheading text-white">{protectionLevel}%</p>
                </div>
                <Badge variant={protectionLevel > 70 ? "success" : protectionLevel > 40 ? "warning" : "danger"}>
                  {protectionLevel > 70 ? "Good" : protectionLevel > 40 ? "Needs Work" : "At Risk"}
                </Badge>
              </div>
              <div className="mt-3 h-2 w-full rounded-full bg-surface-overlay">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-danger via-warning to-success transition-all duration-1000"
                  style={{ width: `${protectionLevel}%` }}
                />
              </div>
              <p className="mt-2 text-micro text-gray-500">
                Based on your scan results, broker removals, and monitoring status.
              </p>
            </div>
          </div>
        )}

        <div className="mx-auto mt-8 max-w-6xl">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((k) => (
                <div
                  key={k}
                  className="rounded-card border border-surface-border bg-surface-raised p-card-pad backdrop-blur-xl"
                >
                  <Skeleton lines={3} />
                </div>
              ))}
            </div>
          ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card hover to="/assessment" className="group">
              <div className="flex h-10 w-10 items-center justify-center rounded-card bg-brandyellow/10 text-brandyellow transition-colors group-hover:bg-brandyellow/20">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
              </div>
              <p className="mt-3 text-caption font-semibold text-white">New Scan</p>
              <p className="mt-1 text-micro text-gray-500">Check your exposure</p>
            </Card>
            <Card hover to="/detection" className="group">
              <div className="flex h-10 w-10 items-center justify-center rounded-card bg-info-soft text-info transition-colors group-hover:bg-info-muted">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7.864 4.243A7.5 7.5 0 0119.5 9.5c0 2.038-.67 3.94-1.79 5.47M7.864 4.243A4.5 4.5 0 0012 2.25a4.5 4.5 0 014.5 4.5v.75m-9.06 1.122A8.25 8.25 0 0112 4.5m0 0v15"
                  />
                </svg>
              </div>
              <p className="mt-3 text-caption font-semibold text-white">Broker Scan</p>
              <p className="mt-1 text-micro text-gray-500">Find your data</p>
            </Card>
            <Card hover to="/broker-removal" className="group">
              <div className="flex h-10 w-10 items-center justify-center rounded-card bg-danger-soft text-danger transition-colors group-hover:bg-danger-muted">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                  />
                </svg>
              </div>
              <p className="mt-3 text-caption font-semibold text-white">Remove Data</p>
              <p className="mt-1 text-micro text-gray-500">{brokerConfirmed || 0} removed</p>
            </Card>
            <Card hover to="/alerts" className="group">
              <div className="flex h-10 w-10 items-center justify-center rounded-card bg-warning-soft text-warning transition-colors group-hover:bg-warning-muted">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                  />
                </svg>
              </div>
              <p className="mt-3 text-caption font-semibold text-white">Alerts</p>
              <p className="mt-1 text-micro text-gray-500">{unreadAlerts || 0} unread</p>
            </Card>
          </div>
          )}
        </div>

        <div className="mx-auto mt-10 max-w-6xl">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
              <svg
                className="h-5 w-5 text-brandyellow"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7.864 4.243A7.5 7.5 0 0119.5 9.5c0 2.038-.67 3.94-1.79 5.47M7.864 4.243A4.5 4.5 0 0012 2.25a4.5 4.5 0 014.5 4.5v.75m-9.06 1.122A8.25 8.25 0 0112 4.5m0 0v15m0-15a8.25 8.25 0 018.206 7.366M12 19.5v-15m0 15a8.25 8.25 0 01-8.206-7.366M12 19.5c-2.485 0-4.5-2.015-4.5-4.5s2.015-4.5 4.5-4.5m0 9c2.485 0 4.5-2.015 4.5-4.5s-2.015-4.5-4.5-4.5"
                />
              </svg>
              Digital footprint
            </h3>
            {footprint?.reduction ? (
              <div className="mt-4 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4 text-center">
                  <div>
                    <p className="text-3xl font-bold text-red-400">{footprint.reduction.initialExposure}</p>
                    <p className="text-xs text-white/45">First scan</p>
                  </div>
                  <span className="text-white/40">→</span>
                  <div>
                    <p className="text-3xl font-bold text-white">{footprint.reduction.currentExposure}</p>
                    <p className="text-xs text-white/45">Current</p>
                  </div>
                  <span className="text-white/40">=</span>
                  <div>
                    <p className="text-3xl font-bold text-emerald-400">{footprint.reduction.removed}</p>
                    <p className="text-xs text-white/45">Removed</p>
                  </div>
                </div>
                <div className="h-2 w-full rounded-full bg-white/10">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300 transition-all"
                    style={{
                      width: `${Math.min(100, Math.max(0, footprint.reduction.reductionPercent))}%`,
                    }}
                  />
                </div>
                <p className="text-center text-sm text-white/45">
                  {footprint.reduction.reductionPercent}% of your initially detected listings reduced
                </p>
                <Link
                  to="/detection"
                  className="block w-full rounded-xl bg-brandyellow py-2.5 text-center text-sm font-bold text-gray-900 hover:bg-yellow-300"
                >
                  Run new scan
                </Link>
              </div>
            ) : (
              <div className="mt-4">
                <p className="text-sm text-white/50">
                  Scan broker sites to see where your personal data appears.
                </p>
                <Link
                  to="/detection"
                  className="mt-3 block w-full rounded-xl bg-brandyellow py-2.5 text-center text-sm font-bold text-gray-900 hover:bg-yellow-300"
                >
                  Scan broker sites
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="mx-auto mt-10 grid max-w-6xl gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition-all duration-300 hover:border-white/20">
            <p className="text-sm text-white/60">Latest score</p>
            {loading ? (
              <div className="mt-4">
                <Skeleton lines={3} />
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
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20">
            <p className="text-sm text-white/60">Total assessments</p>
            <p className="mt-2 text-4xl font-extrabold text-white">{loading ? "—" : assessments.length}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20">
            <p className="text-sm text-white/60">Risk level</p>
            <p className="mt-2 text-2xl font-bold capitalize text-white">
              {loading ? "—" : latest?.riskLevel || "—"}
            </p>
          </div>
        </div>

        {!loading && (
          <div className="mx-auto mt-6 grid max-w-6xl gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition-all duration-300 hover:border-white/20">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-white/60">Data broker removal</p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {brokerTotal > 0 ? (
                      <>
                        {brokerConfirmed} of {brokerTotal} removed
                      </>
                    ) : (
                      "—"
                    )}
                  </p>
                </div>
                <Link
                  to="/broker-removal"
                  className="shrink-0 rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-brandyellow transition-all duration-300 hover:border-brandyellow/50 hover:brightness-110"
                >
                  Manage removals
                </Link>
              </div>
              {brokerTotal > 0 && (
                <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brandyellow to-yellow-300 transition-[width] duration-500"
                    style={{ width: `${brokerPct}%` }}
                  />
                </div>
              )}
              {!isPremium && (
                <p className="mt-3 text-xs text-white/45">
                  Upgrade to Premium to track removals across all brokers.
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition-all duration-300 hover:border-white/20">
              <p className="text-sm font-medium text-white/60">Continuous monitoring</p>
              <div className="mt-3 flex flex-wrap items-center gap-4">
                <label className="relative inline-flex cursor-pointer items-center has-[:disabled]:opacity-50">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={monitoringEnabled}
                    onChange={handleMonitoringToggle}
                    disabled={!isPremium || monitoringBusy}
                  />
                  <span className="relative h-7 w-12 shrink-0 rounded-full bg-white/20 transition after:absolute after:left-0.5 after:top-0.5 after:h-6 after:w-6 after:rounded-full after:bg-white after:transition after:content-[''] peer-checked:bg-brandyellow peer-checked:after:translate-x-[1.25rem] peer-checked:after:bg-navy peer-focus-visible:outline peer-focus-visible:ring-2 peer-focus-visible:ring-brandyellow/40" />
                </label>
                <span className="text-sm text-white/80">
                  {isPremium ? (monitoringEnabled ? "On" : "Off") : "Premium only"}
                </span>
              </div>
              {monitoringEnabled && latest && (
                <p className="mt-3 text-xs text-white/45">
                  Baseline from last assessment: {new Date(latest.createdAt).toLocaleString()}
                </p>
              )}
              {monitoringEnabled && !latest && (
                <p className="mt-3 text-xs text-amber-200/80">Run an assessment so we can compare future breach checks.</p>
              )}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                {unreadAlerts > 0 ? (
                  <Link
                    to="/alerts"
                    className="text-sm font-semibold text-brandyellow transition-all duration-300 hover:brightness-110"
                  >
                    {unreadAlerts} unread alert{unreadAlerts === 1 ? "" : "s"}
                  </Link>
                ) : (
                  <span className="text-sm text-white/40">No unread alerts</span>
                )}
                <Link
                  to="/alerts"
                  className="text-sm font-medium text-white/60 underline-offset-2 transition hover:text-white"
                >
                  View all
                </Link>
              </div>
              {!isPremium && (
                <Link
                  to="/pricing"
                  className="mt-3 inline-block text-xs font-semibold text-brandyellow hover:brightness-110"
                >
                  Upgrade for breach alerts
                </Link>
              )}
            </div>
          </div>
        )}

        {!loading && user?.isStudent && (
          <div className="mx-auto mt-6 max-w-6xl rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold text-white">
              <svg className="h-5 w-5 text-brandyellow" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658.813A48.626 48.626 0 0 1 12 3.493a48.626 48.626 0 0 1 8.88 15.427 50.64 50.64 0 0 0-2.658-.813m0 0a50.64 50.64 0 0 1 2.658-.813 48.626 48.626 0 0 0 8.88-15.427m-11.538 0a48.626 48.626 0 0 0-8.88 15.427 50.64 50.64 0 0 1 2.658.813"
                />
              </svg>
              Campus Security Report
            </h3>
            <p className="mb-4 text-sm text-gray-400">Anonymized security overview for your university</p>
            {campusReport ? (
              <div className="space-y-3">
                <p className="font-medium text-white">{campusReport.university}</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Students scanned</span>
                  <span className="text-white">{campusReport.totalStudents}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">With breach exposure</span>
                  <span className="text-red-400">{campusReport.breachPercentage}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Avg risk score</span>
                  <span className="text-white">{campusReport.avgRiskScore}/100</span>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Share this report with your university IT department to help protect the campus.
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Run a scan to contribute to your campus report.</p>
            )}
          </div>
        )}
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
