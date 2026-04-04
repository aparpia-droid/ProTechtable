import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import html2canvas from "html2canvas";
import { publicScan } from "../lib/api";
import ScoreGauge from "../components/ScoreGauge";
import ShareCard from "../components/ShareCard";

const STEPS = [
  "Checking breach databases...",
  "Estimating broker exposure...",
  "Analyzing your digital footprint...",
  "Generating your safety score...",
];

function formatBrokerSites(estimate) {
  if (!estimate || estimate === 0) return "0";
  if (estimate >= 30) return "30+";
  if (estimate >= 20) return "15–25";
  if (estimate >= 8) return "5–10";
  return `${estimate}+`;
}

export default function ScanPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [scanStep, setScanStep] = useState(0);
  const [apiPayload, setApiPayload] = useState(null);
  const stepTimersRef = useRef([]);
  const shareRef = useRef(null);
  const [showShareCard, setShowShareCard] = useState(false);

  const scanBaseUrl =
    typeof window !== "undefined" ? `${window.location.origin}/scan` : "https://protechtable.com/scan";

  useEffect(() => {
    return () => {
      stepTimersRef.current.forEach((id) => clearTimeout(id));
    };
  }, []);

  useEffect(() => {
    if (!loading) return;
    if (scanStep < 3) return;
    if (!apiPayload) return;

    const finish = setTimeout(() => {
      stepTimersRef.current.forEach((id) => clearTimeout(id));
      stepTimersRef.current = [];
      if (apiPayload.ok) {
        setResult(apiPayload.data);
        setError("");
      } else {
        setError(apiPayload.error || "Scan failed");
        setResult(null);
      }
      setLoading(false);
      setApiPayload(null);
    }, 1000);

    return () => clearTimeout(finish);
  }, [loading, scanStep, apiPayload]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setResult(null);
    setApiPayload(null);
    setScanStep(0);
    stepTimersRef.current.forEach((id) => clearTimeout(id));
    stepTimersRef.current = [];

    setLoading(true);

    stepTimersRef.current = [
      setTimeout(() => setScanStep(1), 2000),
      setTimeout(() => setScanStep(2), 4000),
      setTimeout(() => setScanStep(3), 6000),
    ];

    try {
      const { data } = await publicScan({ email: email.trim() });
      if (data.success) {
        setApiPayload({ ok: true, data: data.data });
      } else {
        setApiPayload({ ok: false, error: data.message || "Scan failed" });
      }
    } catch (err) {
      setApiPayload({
        ok: false,
        error: err.response?.data?.message || "Scan failed",
      });
    }
  }

  async function handleShare() {
    if (!result) return;
    setShowShareCard(true);
    await new Promise((r) => setTimeout(r, 150));
    if (!shareRef.current) return;

    try {
      const canvas = await html2canvas(shareRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      });

      await new Promise((resolve, reject) => {
        canvas.toBlob(
          async (blob) => {
            if (!blob) {
              reject(new Error("No image"));
              return;
            }

            if (navigator.share && navigator.canShare) {
              try {
                const file = new File([blob], "my-digital-safety-score.png", { type: "image/png" });
                if (navigator.canShare({ files: [file] })) {
                  await navigator.share({
                    title: "My Digital Safety Score",
                    text: `I scored ${result.riskScore}/100 on my Digital Safety Score. How safe are you? Check yours at ${scanBaseUrl}`,
                    files: [file],
                  });
                  resolve();
                  return;
                }
              } catch {
                /* fall through */
              }
            }

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.download = "my-digital-safety-score.png";
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
            resolve();
          },
          "image/png",
          0.95
        );
      });
    } catch (err) {
      console.error("Share card generation failed", err);
    }
  }

  const breachTotal = result ? result.totalBreaches ?? result.breachCount ?? 0 : 0;
  const moreBreaches = Math.max(0, breachTotal - 3);
  const score = result?.riskScore ?? 0;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0f] px-4 py-16">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-brandyellow/10 blur-3xl" />
        <div className="absolute -right-24 bottom-20 h-96 w-96 rounded-full bg-blue-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-2xl">
        <h1 className="text-center text-3xl font-bold text-white md:text-4xl">
          What do employers see when they Google you?
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-center text-gray-400">
          In 10 seconds, see your breach exposure, which brokers are selling your data, and what accounts are linked
          to your email — before a recruiter does.
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
            {loading ? "Checking…" : "Check My Exposure"}
          </button>
          {error && !loading && <p className="mt-4 text-center text-sm text-red-400">{error}</p>}
        </form>

        <div className="mt-8 flex flex-wrap justify-center gap-6 text-xs text-gray-500 md:gap-10">
          <span className="flex items-center gap-2">
            <svg className="h-5 w-5 text-brandyellow" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              />
            </svg>
            100% free scan
          </span>
          <span className="flex items-center gap-2">
            <svg className="h-5 w-5 text-brandyellow" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
            We never store your email
          </span>
          <span className="flex items-center gap-2">
            <svg className="h-5 w-5 text-brandyellow" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Results in 10 seconds
          </span>
        </div>

        {loading && (
          <div className="mt-12 rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
            <p className="text-center text-sm font-medium text-gray-400">Scanning your digital footprint</p>
            <ol className="mt-8 space-y-4">
              {STEPS.map((label, i) => {
                const done = i < scanStep;
                const current = i === scanStep;
                return (
                  <li key={label} className={`flex gap-4 ${i > scanStep ? "opacity-40" : ""}`}>
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${
                        done
                          ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
                          : current
                            ? "border-brandyellow bg-brandyellow/10 text-brandyellow"
                            : "border-white/20 text-gray-500"
                      }`}
                    >
                      {done ? (
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : current ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-brandyellow border-t-transparent" />
                      ) : (
                        <span className="text-sm font-semibold">{i + 1}</span>
                      )}
                    </div>
                    <div className="pt-1.5">
                      <p className={`text-sm font-medium ${current ? "text-white" : "text-gray-400"}`}>{label}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        )}

        {result && !loading && (
          <div className="mt-10 space-y-8">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
              <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-500">
                Your Digital Safety Score
              </p>
              <div className="mt-4 flex justify-center">
                <ScoreGauge score={score} size={200} label="Digital Safety Score" showRiskLabel />
              </div>

              <div className="mt-8 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] py-4">
                  <p className="text-2xl font-bold text-white">{breachTotal}</p>
                  <p className="mt-1 text-xs text-gray-400">Breaches Found</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] py-4">
                  <p className="text-2xl font-bold text-white">{formatBrokerSites(result.brokerEstimate)}</p>
                  <p className="mt-1 text-xs text-gray-400">Broker Sites</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] py-4">
                  <p className="text-2xl font-bold text-white">{result.exposedAccounts ?? breachTotal}</p>
                  <p className="mt-1 text-xs text-gray-400">Exposed Accounts</p>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-brandyellow/30 bg-brandyellow/10 px-8 py-3 font-bold text-brandyellow transition hover:bg-brandyellow/20"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                  Share My Score
                </button>
                <Link
                  to={`/signup?score=${encodeURIComponent(String(result.riskScore))}`}
                  className="inline-flex items-center justify-center rounded-xl bg-brandyellow px-8 py-3 font-bold text-gray-900 hover:bg-yellow-300"
                >
                  Remove My Data →
                </Link>
              </div>

              <div className="mt-4 flex justify-center gap-3 text-sm">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    `I scored ${result.riskScore}/100 on my Digital Safety Score. How safe are you? 🔒\n\nCheck yours free: ${scanBaseUrl}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 transition hover:text-white"
                >
                  Share on X
                </a>
                <span className="text-gray-600">•</span>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(scanBaseUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 transition hover:text-white"
                >
                  Share on LinkedIn
                </a>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
              <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                <span aria-hidden>👔</span> What employers can find about you
              </h2>
              <ul className="mt-4 space-y-3 text-sm text-gray-300">
                {breachTotal > 0 && (
                  <li className="flex gap-2">
                    <span className="text-amber-400" aria-hidden>
                      ⚠️
                    </span>
                    Your email appears in {breachTotal} known data breach{breachTotal === 1 ? "" : "es"}
                  </li>
                )}
                {(result.brokerEstimate ?? 0) > 0 && (
                  <li className="flex gap-2">
                    <span className="text-amber-400" aria-hidden>
                      ⚠️
                    </span>
                    Your personal info is on {formatBrokerSites(result.brokerEstimate)} broker sites
                  </li>
                )}
                {breachTotal > 0 && (
                  <li className="flex gap-2">
                    <span className="text-amber-400" aria-hidden>
                      ⚠️
                    </span>
                    {breachTotal} account{breachTotal === 1 ? "" : "s"} linked to this email were found
                  </li>
                )}
                {result.passwordsLeaked && (
                  <li className="flex gap-2">
                    <span className="text-amber-400" aria-hidden>
                      ⚠️
                    </span>
                    Passwords associated with this email leaked
                  </li>
                )}
                {breachTotal === 0 && (result.brokerEstimate ?? 0) === 0 && (
                  <li className="text-gray-400">No public breach matches were found for this email.</li>
                )}
              </ul>
              {(result.brokerEstimate ?? 0) > 0 && (
                <div className="mt-4 rounded-xl border border-brandyellow/20 bg-brandyellow/5 p-4 text-center">
                  <p className="text-sm font-medium text-brandyellow">
                    Want to know exactly which brokers have your data?
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Premium members get real broker detection — we actually scan broker sites for your name.
                  </p>
                  <Link
                    to="/signup"
                    className="mt-3 inline-block rounded-lg bg-brandyellow px-6 py-2 text-sm font-bold text-gray-900 hover:bg-yellow-300"
                  >
                    Get Real Detection →
                  </Link>
                </div>
              )}
              <p className="mt-4 text-sm text-gray-500">A background check would reveal this data.</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
              <h2 className="text-lg font-bold text-white">
                <span className="mr-2" aria-hidden>
                  📋
                </span>
                Exposed accounts (preview)
              </h2>
              {result.breaches?.length > 0 ? (
                <ul className="mt-4 space-y-3">
                  {result.breaches.map((b) => (
                    <li
                      key={b.name}
                      className="flex flex-col gap-1 rounded-lg border border-white/5 bg-white/[0.03] px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
                    >
                      <span className="font-medium text-white">{b.name}</span>
                      <span className="text-gray-400">
                        {(b.dataClasses || []).slice(0, 5).join(", ") || "—"} leaked
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-gray-500">No breached accounts found for this email.</p>
              )}

              {moreBreaches > 0 && (
                <div className="relative mt-6 overflow-hidden rounded-xl border border-white/10 bg-navy/40 p-4">
                  <div className="pointer-events-none blur-sm">
                    <p className="text-sm text-gray-500">+{moreBreaches} more sources…</p>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0f]/75 backdrop-blur-sm">
                    <p className="text-center text-sm font-medium text-white">
                      🔒 +{moreBreaches} more accounts —{" "}
                      <Link to="/signup" className="text-brandyellow underline">
                        Sign up
                      </Link>{" "}
                      to see all
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
              <h2 className="text-lg font-bold text-white">
                <span className="mr-2" aria-hidden>
                  ⚡
                </span>
                Top 3 actions to take now
              </h2>
              <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-gray-300">
                <li>Change your passwords on leaked accounts</li>
                <li>Enable 2FA on all accounts listed above</li>
                <li>Remove your data from broker sites</li>
              </ol>
              <p className="mt-4 text-sm text-gray-500">
                🔒{" "}
                <Link to="/signup" className="font-semibold text-brandyellow hover:brightness-110">
                  Get full action plan — Sign up free
                </Link>
              </p>
            </div>

            <p className="text-center text-sm text-gray-500">
              <Link to="/login" className="text-brandyellow hover:brightness-110">
                Already have an account? Log in
              </Link>
            </p>
          </div>
        )}
      </div>

      {showShareCard && result && (
        <div className="pointer-events-none fixed left-[-9999px] top-0 z-[-1]">
          <ShareCard
            ref={shareRef}
            score={result.riskScore}
            breachCount={result.breachCount ?? result.totalBreaches ?? 0}
            brokerEstimate={result.brokerEstimate ?? 0}
            exposedAccounts={result.exposedAccounts ?? result.breachCount ?? 0}
            scanUrl={scanBaseUrl}
          />
        </div>
      )}
    </div>
  );
}
