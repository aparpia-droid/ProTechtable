import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  getProfile,
  getBrokers,
  getBrokerDetectionResults,
  getBrokerFootprint,
  runBrokerDetection,
  requestBrokerRemoval,
} from "../lib/api";

function FingerprintIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.864 4.243A7.5 7.5 0 0119.5 9.5c0 2.038-.67 3.94-1.79 5.47M7.864 4.243A4.5 4.5 0 0012 2.25a4.5 4.5 0 014.5 4.5v.75m-9.06 1.122A8.25 8.25 0 0112 4.5m0 0v15m0-15a8.25 8.25 0 018.206 7.366M12 19.5v-15m0 15a8.25 8.25 0 01-8.206-7.366M12 19.5c-2.485 0-4.5-2.015-4.5-4.5s2.015-4.5 4.5-4.5m0 9c2.485 0 4.5-2.015 4.5-4.5s-2.015-4.5-4.5-4.5"
      />
    </svg>
  );
}

export default function BrokerDetectionPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const isPremium = user?.subscriptionTier === "premium";

  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [state, setState] = useState("");
  const [footprint, setFootprint] = useState(null);
  const [results, setResults] = useState(null);
  const [allBrokers, setAllBrokers] = useState([]);

  async function loadData() {
    try {
      const [fpRes, detRes, brRes, profRes] = await Promise.all([
        getBrokerFootprint().catch(() => ({ data: { data: null } })),
        getBrokerDetectionResults().catch(() => ({ data: { data: null } })),
        getBrokers().catch(() => ({ data: { data: [] } })),
        getProfile().catch(() => ({ data: { user: null } })),
      ]);
      setFootprint(fpRes.data?.data ?? null);
      setResults(detRes.data?.data ?? null);
      setAllBrokers(brRes.data?.data || []);
      const u = profRes.data?.user;
      if (u) {
        setFirstName(u.firstName || "");
        setLastName(u.lastName || "");
      }
    } catch (e) {
      showToast(e?.response?.data?.message || "Could not load footprint data", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const unscannable = allBrokers.filter((b) => b.detectable === false);

  async function handleScan(e) {
    e.preventDefault();
    if (!isPremium) return;
    if (!firstName.trim() || !lastName.trim()) {
      showToast("First and last name are required.", "error");
      return;
    }
    setScanning(true);
    try {
      const { data } = await runBrokerDetection({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        state: state.trim(),
      });
      if (data.success) {
        showToast("Broker scan completed.", "success");
        await loadData();
      } else {
        showToast(data.message || "Scan failed", "error");
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Scan failed", "error");
    } finally {
      setScanning(false);
    }
  }

  async function handleRemoval(brokerId) {
    try {
      await requestBrokerRemoval(brokerId);
      showToast("Removal requested", "success");
    } catch (err) {
      showToast(err.response?.data?.message || "Could not request removal", "error");
    }
  }

  const reduction = footprint?.reduction;

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-[#0a1628]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1628] px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10">
          <h1 className="flex items-center gap-3 text-3xl font-bold text-white">
            <FingerprintIcon className="h-8 w-8 text-brandyellow" />
            Your Digital Footprint
          </h1>
          <p className="mt-2 text-white/60">
            We scan data broker sites to find where your personal information appears.
          </p>
        </div>

        {!isPremium && (
          <div className="mb-8 rounded-2xl border border-brandyellow/30 bg-brandyellow/5 p-6 backdrop-blur">
            <p className="text-lg font-semibold text-brandyellow">Premium feature</p>
            <p className="mt-2 text-sm text-white/70">
              Real broker detection scans live sites for your name. Upgrade to run scans and track exposure over time.
            </p>
            <Link
              to="/pricing"
              className="mt-4 inline-block rounded-xl bg-brandyellow px-6 py-3 text-sm font-bold text-gray-900 hover:bg-yellow-300"
            >
              Upgrade to Premium
            </Link>
          </div>
        )}

        {reduction && (
          <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-white/50">Footprint reduction</h2>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-center">
              <div>
                <p className="text-3xl font-bold text-red-400">{reduction.initialExposure}</p>
                <p className="text-xs text-white/45">First scan</p>
              </div>
              <span className="text-white/40">→</span>
              <div>
                <p className="text-3xl font-bold text-white">{reduction.currentExposure}</p>
                <p className="text-xs text-white/45">Current</p>
              </div>
              <span className="text-white/40">=</span>
              <div>
                <p className="text-3xl font-bold text-emerald-400">{reduction.removed}</p>
                <p className="text-xs text-white/45">Change</p>
              </div>
            </div>
            <div className="mt-4 h-2 w-full rounded-full bg-white/10">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-300 transition-all"
                style={{ width: `${Math.min(100, Math.max(0, reduction.reductionPercent))}%` }}
              />
            </div>
            <p className="mt-2 text-center text-sm text-white/45">
              {reduction.reductionPercent}% reduction in detected listings since your first footprint snapshot
            </p>
          </div>
        )}

        <form
          onSubmit={handleScan}
          className="mb-10 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
        >
          <h2 className="text-lg font-semibold text-white">Run broker scan</h2>
          <p className="mt-1 text-sm text-white/50">
            Uses your name to check sites that support automated detection (about one minute).
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <label className="block">
              <span className="text-xs text-white/50">First name</span>
              <input
                className="mt-1 w-full rounded-lg border border-white/10 bg-navy/60 px-3 py-2 text-white placeholder:text-white/30"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={!isPremium || scanning}
              />
            </label>
            <label className="block">
              <span className="text-xs text-white/50">Last name</span>
              <input
                className="mt-1 w-full rounded-lg border border-white/10 bg-navy/60 px-3 py-2 text-white placeholder:text-white/30"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={!isPremium || scanning}
              />
            </label>
            <label className="block">
              <span className="text-xs text-white/50">State (optional)</span>
              <input
                className="mt-1 w-full rounded-lg border border-white/10 bg-navy/60 px-3 py-2 text-white placeholder:text-white/30"
                placeholder="e.g. CA"
                value={state}
                onChange={(e) => setState(e.target.value)}
                disabled={!isPremium || scanning}
                maxLength={2}
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={!isPremium || scanning}
            className="mt-6 w-full rounded-xl bg-brandyellow py-3 text-sm font-bold text-gray-900 transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-10"
          >
            {scanning ? "Scanning broker sites…" : "Run broker scan"}
          </button>
          {scanning && (
            <p className="mt-3 text-sm text-white/50">
              Checking each detectable broker with a short delay to avoid rate limits. Please wait.
            </p>
          )}
        </form>

        {results && results.totalScanned > 0 && (
          <>
            {results.detected?.length > 0 && (
              <div className="mb-8 rounded-2xl border border-red-500/20 bg-red-500/5 p-6 backdrop-blur-xl">
                <h2 className="text-lg font-semibold text-red-400">Found on these sites</h2>
                <ul className="mt-4 space-y-4">
                  {results.detected.map((d) => (
                    <li
                      key={d.brokerId}
                      className="rounded-xl border border-red-500/10 bg-red-500/[0.03] p-4"
                    >
                      <p className="font-semibold text-white">{d.brokerName}</p>
                      <p className="mt-1 text-sm text-white/60">
                        Found: {(d.dataFound || []).join(", ") || "—"}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {d.profileUrl && (
                          <a
                            href={d.profileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg border border-white/20 px-3 py-1.5 text-sm font-medium text-brandyellow hover:border-brandyellow/50"
                          >
                            View profile
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoval(d.brokerId)}
                          className="rounded-lg bg-brandyellow px-3 py-1.5 text-sm font-bold text-gray-900 hover:bg-yellow-300"
                        >
                          Request removal
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {results.clean?.length > 0 && (
              <div className="mb-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 backdrop-blur-xl">
                <h2 className="text-lg font-semibold text-emerald-400">Clean — not found on these sites</h2>
                <ul className="mt-4 space-y-2">
                  {results.clean.map((c) => (
                    <li key={c.brokerId} className="flex items-center gap-2 text-sm text-white/80">
                      <span className="text-emerald-400">✓</span> {c.brokerName}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        {results && results.totalScanned === 0 && isPremium && (
          <p className="mb-8 text-sm text-white/50">No scans yet. Run a broker scan to populate results.</p>
        )}

        {unscannable.length > 0 && (
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-xl">
            <h2 className="text-lg font-semibold text-white/50">Not yet scannable</h2>
            <p className="mt-1 text-sm text-white/40">
              These brokers require manual checking or unsupported automation:
            </p>
            <ul className="mt-4 space-y-3">
              {unscannable.map((b) => (
                <li
                  key={b.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/5 px-3 py-2"
                >
                  <span className="text-sm text-white/70">{b.name}</span>
                  {b.removalUrl ? (
                    <a
                      href={b.removalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-brandyellow hover:brightness-110"
                    >
                      Visit site
                    </a>
                  ) : (
                    <Link to="/pricing" className="text-xs font-semibold text-brandyellow hover:brightness-110">
                      Unlock with Premium
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
