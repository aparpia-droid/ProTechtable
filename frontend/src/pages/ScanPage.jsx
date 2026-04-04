import { useState } from "react";
import { Link } from "react-router-dom";
import { publicScan } from "../lib/api";
import LoadingSpinner from "../components/LoadingSpinner";

function formatBrokerSites(estimate) {
  if (!estimate || estimate === 0) return "0";
  if (estimate >= 30) return "30+";
  if (estimate >= 20) return "15–25";
  if (estimate >= 8) return "5–10";
  return `${estimate}+`;
}

function riskColor(score) {
  if (score >= 76) return "text-red-400";
  if (score >= 51) return "text-yellow-400";
  if (score >= 26) return "text-amber-300";
  return "text-emerald-400";
}

export default function ScanPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const { data } = await publicScan({ email: email.trim() });
      if (data.success) setResult(data.data);
      else setError(data.message || "Scan failed");
    } catch (err) {
      setError(err.response?.data?.message || "Scan failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0f] px-4 py-16">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-brandyellow/10 blur-3xl" />
        <div className="absolute -right-24 bottom-20 h-96 w-96 rounded-full bg-blue-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-2xl">
        <h1 className="text-center text-3xl font-bold text-white md:text-4xl">How exposed is your data?</h1>
        <p className="mx-auto mt-3 max-w-lg text-center text-gray-400">
          Enter your email to see your breach exposure and estimated broker risk — free, no signup required.
        </p>

        <form
          onSubmit={onSubmit}
          className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl"
        >
          <label htmlFor="scan-email" className="mb-2 block text-sm font-medium text-gray-300">
            Email address
          </label>
          <input
            id="scan-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brandyellow"
          />
          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-brandyellow py-3.5 font-bold text-gray-900 transition hover:bg-yellow-300 disabled:opacity-60"
          >
            {loading ? "Scanning…" : "Scan Now"}
          </button>
          {error && <p className="mt-4 text-center text-sm text-red-400">{error}</p>}
        </form>

        {loading && (
          <div className="mt-10 flex flex-col items-center gap-4 text-gray-400">
            <LoadingSpinner />
            <p className="text-sm">Scanning breach databases…</p>
          </div>
        )}

        {result && !loading && (
          <div className="mt-10 space-y-8 rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
            <div className="text-center">
              <p className="text-sm text-gray-400">Risk score</p>
              <p className={`mt-2 text-6xl font-black tabular-nums ${riskColor(result.riskScore)}`}>
                {result.riskScore}
              </p>
              <p className="text-sm text-gray-500">out of 100</p>
            </div>
            <div className="grid gap-4 border-t border-white/10 pt-6 text-center sm:grid-cols-2">
              <div>
                <p className="text-2xl font-bold text-white">{result.breachCount ?? result.totalBreaches ?? 0}</p>
                <p className="text-sm text-gray-400">Found in known breaches</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{formatBrokerSites(result.brokerEstimate)}</p>
                <p className="text-sm text-gray-400">Est. broker sites</p>
              </div>
            </div>
            <p className="text-center text-sm text-gray-400">
              Your data is estimated to appear on{" "}
              <span className="font-semibold text-white">{formatBrokerSites(result.brokerEstimate)}</span> data broker
              sites.
            </p>

            {result.breaches?.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-300">Recent breaches (preview)</p>
                <ul className="mt-3 space-y-2">
                  {result.breaches.map((b) => (
                    <li
                      key={b.name}
                      className="flex justify-between gap-2 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2 text-sm"
                    >
                      <span className="font-medium text-white">{b.name}</span>
                      <span className="text-gray-500">{b.date ? String(b.date).slice(0, 10) : ""}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="relative overflow-hidden rounded-xl border border-white/10 bg-navy/40 p-6">
              <div className="pointer-events-none select-none blur-sm filter">
                <p className="text-sm text-gray-400">Full breach list, remediation steps, and removal links</p>
                <div className="mt-2 h-16 rounded bg-white/5" />
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#0a0a0f]/70 backdrop-blur-sm">
                <svg className="h-8 w-8 text-brandyellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <p className="text-center text-sm font-medium text-white">See all breaches &amp; start removal →</p>
                <Link
                  to="/signup"
                  className="mt-1 text-xs font-semibold text-brandyellow hover:brightness-110"
                >
                  Create free account
                </Link>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-center">
              <Link
                to="/signup"
                className="inline-flex justify-center rounded-xl bg-brandyellow px-8 py-3 font-bold text-gray-900 hover:bg-yellow-300"
              >
                Remove My Data →
              </Link>
              <Link
                to="/login"
                className="inline-flex justify-center rounded-xl border border-white/20 px-8 py-3 font-semibold text-gray-300 hover:bg-white/5"
              >
                Already have an account? Log in
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
