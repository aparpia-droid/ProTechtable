import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  confirmBrokerRemoval,
  getBrokerRemovals,
  requestAllBrokerRemovals,
  requestBrokerRemoval,
} from "../lib/api";

function statusBadge(status) {
  const normalized = (status || "").toLowerCase();
  if (normalized === "confirmed") {
    return { label: "Removed", cls: "bg-green-500/10 text-green-400" };
  }
  if (normalized === "submitted") {
    return { label: "Email sent", cls: "bg-blue-500/10 text-blue-400" };
  }
  if (normalized === "requested") {
    return { label: "Requested", cls: "bg-yellow-500/10 text-yellow-400" };
  }
  if (normalized === "failed") {
    return { label: "Failed", cls: "bg-red-500/10 text-red-400" };
  }
  return { label: "Not removed", cls: "bg-white/10 text-white/50" };
}

function difficultyDot(difficulty) {
  const d = (difficulty || "").toLowerCase();
  if (d === "easy") return "bg-green-400";
  if (d === "medium") return "bg-yellow-400";
  if (d === "hard") return "bg-red-400";
  return "bg-white/40";
}

export default function BrokerRemovalPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [brokers, setBrokers] = useState([]);
  const [stats, setStats] = useState(null);

  const isPremium = user?.subscriptionTier === "premium";

  async function refresh() {
    try {
      setLoading(true);
      const res = await getBrokerRemovals();
      setBrokers(res.data?.data || []);
      setStats(res.data?.stats || null);
    } catch (e) {
      showToast(e?.response?.data?.message || "Could not load broker removals", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refresh on mount only
  }, []);

  const progressPct = useMemo(() => {
    if (!stats || stats.total <= 0) return 0;
    const done = (stats.confirmed || 0) + (stats.submitted || 0);
    return Math.max(0, Math.min(100, Math.round((done / stats.total) * 100)));
  }, [stats]);

  async function handleRemoveMe(brokerId) {
    try {
      await requestBrokerRemoval(brokerId);
      showToast("Removal requested", "success");
      await refresh();
    } catch (e) {
      showToast(e?.response?.data?.message || "Could not request removal", "error");
    }
  }

  async function handleConfirmRemoval(brokerId) {
    try {
      await confirmBrokerRemoval(brokerId);
      showToast("Marked as confirmed", "success");
      await refresh();
    } catch (e) {
      showToast(e?.response?.data?.message || "Could not confirm removal", "error");
    }
  }

  async function handleRemoveAll() {
    try {
      await requestAllBrokerRemovals();
      showToast("Removal initiated for all brokers", "success");
      await refresh();
    } catch (e) {
      showToast(e?.response?.data?.message || "Could not request all removals", "error");
    }
  }

  return (
    <div className="min-h-screen bg-[#0a1628] px-4 py-12">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-2xl border border-white/10 bg-navy px-6 py-12 text-center backdrop-blur">
          <h1 className="text-3xl font-bold text-white md:text-4xl">Data Broker Removal</h1>
          <p className="mt-3 text-white/60">
            We found your data on {stats?.total ?? 0} broker sites. Let&apos;s remove it.
          </p>
          {isPremium ? (
            <button
              type="button"
              onClick={handleRemoveAll}
              disabled={loading}
              className="mt-8 inline-flex items-center justify-center rounded-full bg-brandyellow px-8 py-4 text-sm font-bold text-navy shadow-lg shadow-yellow-500/25 transition-all duration-300 hover:brightness-110 disabled:opacity-60"
            >
              Remove Me From All
            </button>
          ) : (
            <div className="mt-8 rounded-2xl border border-brandyellow/30 bg-brandyellow/10 px-5 py-4 text-sm text-brandyellow">
              Upgrade to Premium to automatically remove your data from all {stats?.total ?? 0} brokers.
              <div className="mt-3">
                <Link
                  to="/pricing"
                  className="font-semibold underline transition-colors hover:text-white"
                >
                  Upgrade to Premium
                </Link>
              </div>
            </div>
          )}
        </section>

        <section className="mt-8">
          <div className="grid gap-6 md:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <p className="text-sm text-white/60">Total brokers</p>
              <p className="mt-2 text-3xl font-extrabold text-white">{loading ? "—" : stats?.total ?? 0}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <p className="text-sm text-white/60">Removal requested</p>
              <p className="mt-2 text-3xl font-extrabold text-white">
                {loading ? "—" : stats?.requested ?? 0}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <p className="text-sm text-white/60">Pending</p>
              <p className="mt-2 text-3xl font-extrabold text-white">
                {loading ? "—" : stats?.submitted ?? 0}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <p className="text-sm text-white/60">Confirmed</p>
              <p className="mt-2 text-3xl font-extrabold text-white">
                {loading ? "—" : stats?.confirmed ?? 0}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-white/60">Removal progress</span>
              <span className="text-sm font-semibold text-white">{progressPct}%</span>
            </div>
            <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-brandyellow to-yellow-300 transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-white">Your brokers</h2>

          {loading ? (
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-white/60">
              Loading broker removals…
            </div>
          ) : brokers.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-white/60">
              No brokers found.
            </div>
          ) : (
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {brokers.map((b) => {
                const status = b.removal?.status || "not_started";
                const sb = statusBadge(status);

                const showRemoveMe = status === "not_started" || status === "failed";
                const showVisit =
                  status === "requested" && (b.removalMethod || "").toLowerCase() === "form";
                const showConfirm = status === "submitted";

                return (
                  <div
                    key={b.id}
                    className="relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition-all duration-300 hover:border-white/20 hover:bg-white/[0.08]"
                  >
                    {!isPremium && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-navy/60 backdrop-blur-sm">
                        <div className="text-center">
                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brandyellow/15 text-brandyellow">
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 17v-2m0-4V9m6 2a6 6 0 11-12 0 6 6 0 0112 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 13V8a3 3 0 016 0v5" />
                            </svg>
                          </div>
                          <p className="mt-3 text-sm font-semibold text-white">Upgrade to Premium</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="truncate text-lg font-bold text-white">{b.name}</h3>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/70">
                            {b.category}
                          </span>
                          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium text-white/70 border border-white/10`}>
                            <span className={`h-2 w-2 rounded-full ${difficultyDot(b.difficulty)}`} aria-hidden />
                            {b.difficulty}
                          </span>
                        </div>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${sb.cls} text-center`}>
                        {sb.label}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {(b.dataTypes || []).slice(0, 6).map((dt) => (
                        <span key={dt} className="bg-red-500/10 text-red-400 rounded-full px-2 py-0.5 text-xs">
                          {dt}
                        </span>
                      ))}
                    </div>

                    <p className="mt-3 text-xs text-white/40">
                      ~{b.estimatedDays ?? 14} days
                    </p>

                    {isPremium && (
                      <div className="mt-5 flex flex-col gap-3">
                        {showRemoveMe && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMe(b.id)}
                            className="rounded-full bg-brandyellow px-5 py-2 text-sm font-bold text-navy shadow-lg shadow-yellow-500/20 transition-all duration-300 hover:brightness-110"
                          >
                            Remove Me
                          </button>
                        )}

                        {showVisit && (
                          <button
                            type="button"
                            onClick={() => {
                              if (!b.removalUrl) {
                                showToast("Removal URL unavailable", "error");
                                return;
                              }
                              window.open(b.removalUrl, "_blank", "noopener,noreferrer");
                            }}
                            className="rounded-full border border-white/20 bg-white/0 px-5 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/10"
                          >
                            Visit Opt-Out Page
                          </button>
                        )}

                        {showConfirm && (
                          <button
                            type="button"
                            onClick={() => handleConfirmRemoval(b.id)}
                            className="rounded-full border border-white/20 bg-white/0 px-5 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/10"
                          >
                            I Confirmed Removal
                          </button>
                        )}

                        {status === "confirmed" && (
                          <div className="flex items-center gap-2 text-sm font-semibold text-green-400">
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Removed
                          </div>
                        )}

                        {status === "requested" && b.removalMethod?.toLowerCase() !== "form" && (
                          <div className="text-sm text-white/60">Request received. We&apos;ll email you next steps.</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

