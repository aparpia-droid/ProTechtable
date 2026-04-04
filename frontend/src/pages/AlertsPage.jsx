import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { getAlerts, markAlertRead, markAllAlertsRead, toggleMonitoring } from "../lib/api";

export default function AlertsPage() {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  const isPremium = user?.subscriptionTier === "premium";
  const monitoringOn = Boolean(user?.monitoringEnabled);

  async function load() {
    try {
      setLoading(true);
      const res = await getAlerts();
      setAlerts(res.data?.data || []);
    } catch (e) {
      showToast(e?.response?.data?.message || "Could not load alerts", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleMarkRead(id) {
    try {
      await markAlertRead(id);
      await load();
    } catch (e) {
      showToast(e?.response?.data?.message || "Could not update alert", "error");
    }
  }

  async function handleMarkAll() {
    try {
      await markAllAlertsRead();
      showToast("All alerts marked read", "success");
      await load();
    } catch (e) {
      showToast(e?.response?.data?.message || "Could not update alerts", "error");
    }
  }

  async function handleMonitoringChange(next) {
    if (!isPremium && next) {
      showToast("Continuous monitoring is a Premium feature.", "error");
      return;
    }
    try {
      setToggling(true);
      await toggleMonitoring(next);
      showToast(next ? "Monitoring enabled" : "Monitoring disabled", "success");
      await refreshUser();
    } catch (e) {
      showToast(e?.response?.data?.message || "Could not update monitoring", "error");
    } finally {
      setToggling(false);
    }
  }

  return (
    <div className="animate-fade-in min-h-screen bg-[#0a1628] px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <section className="rounded-2xl border border-white/10 bg-navy px-6 py-10 text-center backdrop-blur">
          <h1 className="text-3xl font-bold text-white md:text-4xl">Security alerts</h1>
          <p className="mt-2 text-white/60">Breach notifications and monitoring updates</p>
        </section>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Enable continuous monitoring</p>
              <p className="mt-1 text-sm text-white/50">
                We&apos;ll email you when new breaches appear vs. your last scan.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {!isPremium && (
                <span className="rounded-full border border-brandyellow/40 bg-brandyellow/10 px-3 py-1 text-xs font-semibold text-brandyellow">
                  Premium
                </span>
              )}
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={monitoringOn}
                  disabled={toggling || (!isPremium && !monitoringOn)}
                  onChange={(e) => handleMonitoringChange(e.target.checked)}
                  aria-label="Enable continuous monitoring"
                />
                <div className="peer h-7 w-12 rounded-full bg-white/10 after:absolute after:left-0.5 after:top-0.5 after:h-6 after:w-6 after:rounded-full after:bg-white/30 after:transition-all peer-checked:bg-brandyellow/40 peer-checked:after:translate-x-5 peer-checked:after:bg-brandyellow" />
              </label>
            </div>
          </div>
          {!isPremium && (
            <p className="mt-4 text-sm text-white/50">
              <Link to="/pricing" className="font-semibold text-brandyellow hover:brightness-110">
                Upgrade to Premium
              </Link>{" "}
              to enable monitoring.
            </p>
          )}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-white">Recent alerts</h2>
          {alerts.length > 0 && (
            <button
              type="button"
              onClick={handleMarkAll}
              className="rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/10"
            >
              Mark all read
            </button>
          )}
        </div>

        {loading ? (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-white/60">
            Loading alerts…
          </div>
        ) : alerts.length === 0 ? (
          <div className="mt-6 flex flex-col items-center rounded-2xl border border-white/10 bg-white/5 px-8 py-12 text-center">
            <svg
              className="h-16 w-16 text-gray-500"
              fill="none"
              stroke="currentColor"
              strokeWidth={1}
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
              />
            </svg>
            <p className="mt-4 text-body text-gray-400">
              No alerts yet. Enable monitoring to get notified of new breaches.
            </p>
            <Link
              to="/account"
              className="mt-6 inline-flex rounded-full bg-brandyellow px-6 py-3 text-sm font-semibold text-navy transition hover:brightness-110 active:scale-[0.98]"
            >
              Notification settings
            </Link>
          </div>
        ) : (
          <ul className="mt-6 space-y-4">
            {alerts.map((a) => (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => {
                    if (!a.read) handleMarkRead(a.id);
                  }}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 p-5 text-left backdrop-blur transition-all duration-300 hover:border-white/20 hover:bg-white/[0.08]"
                >
                  <div className="flex gap-3">
                    <div className="flex shrink-0 flex-col items-center pt-1">
                      {!a.read && <span className="h-2 w-2 rounded-full bg-brandyellow" aria-hidden />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-2">
                        <span className="text-brandyellow" aria-hidden>
                          {a.type === "new_breach" ? "🔔" : "🛡️"}
                        </span>
                        <p className="font-bold text-white">{a.title}</p>
                      </div>
                      <p className="mt-2 text-sm text-white/60">{a.description}</p>
                      <p className="mt-3 text-xs text-white/40">
                        {new Date(a.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
