import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { createAssessment, getAssessment, getRemediation, getUserAssessments } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import ScoreGauge from "../components/ScoreGauge";
import ScoreBar from "../components/ScoreBar";
import RiskBadge from "../components/RiskBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import UpgradeModal from "../components/UpgradeModal";
import CelebrationModal from "../components/CelebrationModal";
import RemediationWizard from "../components/RemediationWizard";
import { useToast } from "../context/ToastContext";

const STEPS = [
  { label: "Checking breach databases...", ms: 1500 },
  { label: "Scanning public profiles...", ms: 1500 },
  { label: "Analyzing data broker exposure...", ms: 1500 },
  { label: "Calculating vulnerability score...", ms: 1500 },
];

const inputDark =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 transition-all duration-300 focus:border-brandyellow/50 focus:outline-none focus:ring-1 focus:ring-brandyellow/25";

function getBreachSeverity(dataClasses) {
  const list = Array.isArray(dataClasses) ? dataClasses : [];
  const critical = ["Passwords", "Credit cards", "Bank account numbers", "Social security numbers"];
  const high = ["Phone numbers", "Physical addresses", "IP addresses"];
  if (list.some((d) => critical.includes(d))) return { level: "critical", color: "text-red-400" };
  if (list.some((d) => high.includes(d))) return { level: "high", color: "text-orange-400" };
  if (list.some((d) => ["Email addresses", "Usernames", "Names"].includes(d))) {
    return { level: "medium", color: "text-yellow-400" };
  }
  return { level: "low", color: "text-white/60" };
}

function mapGetToResult(d) {
  return {
    assessmentId: d.id,
    score: d.score,
    riskLevel: d.riskLevel,
    breachesFound: d.breachesFound,
    dataBrokersFound: d.dataBrokersFound,
    publicProfiles: d.publicProfiles,
    breaches: d.breaches || [],
    emailRisk: d.assessmentData?.emailRisk,
    partialResults: d.partialResults,
    apiWarnings: d.apiWarnings || [],
    assessmentData: d.assessmentData,
  };
}

async function pollForCompletion(assessmentId, isCancelled, showToast) {
  for (let i = 0; i < 90; i++) {
    if (isCancelled()) return null;
    await new Promise((r) => setTimeout(r, 2000));
    try {
      const { data } = await getAssessment(assessmentId);
      const row = data?.data;
      if (!row) continue;
      if (row.status === "completed") return mapGetToResult(row);
      if (row.status === "failed") {
        showToast("Assessment failed. Please try again.", "error");
        return null;
      }
    } catch {
      continue;
    }
  }
  showToast("Timed out waiting for results.", "error");
  return null;
}

export default function AssessmentPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [params] = useSearchParams();
  const resumeId = params.get("resume");
  const { register, handleSubmit, reset } = useForm({
    defaultValues: { email: user?.email || "" },
  });
  const [step, setStep] = useState(1);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState(null);
  const [loadingResume, setLoadingResume] = useState(Boolean(resumeId));
  const [finalizing, setFinalizing] = useState(false);
  const apiDoneRef = useRef(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [lastAssessment, setLastAssessment] = useState(null);
  const [celebration, setCelebration] = useState(null);
  const [wizardActions, setWizardActions] = useState(null);

  useEffect(() => {
    if (user?.email) {
      reset({ email: user.email });
    }
  }, [user?.email, reset]);

  useEffect(() => {
    if (!resumeId) return;
    let cancelled = false;
    const isCancelled = () => cancelled;

    (async () => {
      try {
        const { data } = await getAssessment(resumeId);
        if (!cancelled && data?.data) {
          const d = data.data;
          if (d.status === "processing") {
            const mapped = await pollForCompletion(d.id, isCancelled, showToast);
            if (mapped && !isCancelled()) {
              setResult(mapped);
              setStep(3);
            }
            return;
          }
          setResult(mapGetToResult(d));
          setStep(3);
        }
      } catch {
        showToast("Could not load assessment", "error");
      } finally {
        if (!cancelled) setLoadingResume(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [resumeId, showToast]);

  async function maybeShowCelebration(newScore) {
    try {
      const { data } = await getUserAssessments();
      const list = data?.data || [];
      const sorted = [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      if (sorted.length >= 2 && newScore < sorted[1].score) {
        setCelebration({ oldScore: sorted[1].score, newScore });
      }
    } catch {
      /* ignore */
    }
  }

  async function onSubmit(values) {
    setStep(2);
    setLoadingStep(0);
    setFinalizing(false);
    apiDoneRef.current = false;
    const p = createAssessment({ email: values.email }).then((r) => {
      apiDoneRef.current = true;
      return r;
    });

    try {
      for (let i = 0; i < STEPS.length; i++) {
        setLoadingStep(i);
        const ms = apiDoneRef.current ? 400 : 1500;
        await Promise.race([new Promise((r) => setTimeout(r, ms)), p.catch(() => {})]);
      }
      setFinalizing(true);
      const res = await p;
      const payload = res.data.data;

      if (payload.status === "processing" && payload.assessmentId) {
        setFinalizing(false);
        const mapped = await pollForCompletion(payload.assessmentId, () => false, showToast);
        if (mapped) {
          setResult(mapped);
          setFinalizing(false);
          setStep(3);
          await maybeShowCelebration(mapped.score);
        } else {
          setStep(1);
          setFinalizing(false);
        }
        return;
      }

      setResult(payload);
      setFinalizing(false);
      setStep(3);
      await maybeShowCelebration(payload.score);
    } catch (e) {
      if (e.response?.status === 403) {
        try {
          const { data } = await getUserAssessments();
          const last = data.data?.[0];
          setLastAssessment(last || null);
        } catch {
          setLastAssessment(null);
        }
        setShowUpgrade(true);
        setStep(1);
        setFinalizing(false);
        return;
      }
      showToast(e.response?.data?.message || "Assessment failed", "error");
      setStep(1);
      setFinalizing(false);
    }
  }

  async function openWizard() {
    if (!result?.assessmentId) return;
    try {
      const { data } = await getRemediation(result.assessmentId);
      const actions = (data.remediationPlan?.actions || [])
        .filter((a) => a.status !== "completed")
        .slice(0, 3);
      if (!actions.length) {
        showToast("No open actions to walk through.", "info");
        return;
      }
      setWizardActions(actions);
    } catch {
      showToast("Could not load remediation actions", "error");
    }
  }

  function runAnotherScan() {
    setStep(1);
    setResult(null);
    reset({ email: user?.email || "" });
  }

  if (loadingResume) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-[#0a1628]">
        <LoadingSpinner />
      </div>
    );
  }

  const breakdown = result?.assessmentData?.scoreBreakdown;
  const progressPct = finalizing
    ? 100
    : Math.min(100, Math.round(((loadingStep + 1) / STEPS.length) * 100));

  return (
    <div className="min-h-screen bg-[#0a1628]">
      {showUpgrade && (
        <UpgradeModal
          onClose={() => setShowUpgrade(false)}
          lastScore={lastAssessment?.score}
          lastDate={
            lastAssessment ? new Date(lastAssessment.createdAt).toLocaleDateString() : null
          }
        />
      )}

      {celebration && (
        <CelebrationModal
          oldScore={celebration.oldScore}
          newScore={celebration.newScore}
          onClose={() => setCelebration(null)}
        />
      )}

      {wizardActions && (
        <RemediationWizard
          actions={wizardActions}
          onComplete={() => {}}
          onClose={() => setWizardActions(null)}
        />
      )}

      {step === 1 && (
        <section className="relative overflow-hidden bg-navy px-4 py-16">
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <div className="absolute -left-20 top-10 h-64 w-64 rounded-full bg-brandyellow/15 blur-3xl" />
            <div className="absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-lg">
            <h1 className="text-center text-3xl font-bold text-white md:text-4xl">
              Scan your digital footprint
            </h1>
            <p className="mt-3 text-center text-white/60">
              Enter your email to discover your exposure
            </p>
            <form
              className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
            >
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-white/70">
                  Email to assess
                </label>
                <input
                  id="email"
                  type="email"
                  className={inputDark}
                  {...register("email", { required: true })}
                  aria-describedby="email-help"
                />
                <p id="email-help" className="mt-2 text-sm text-white/40">
                  Only your verified account email (or verified family emails on Premium) can be scanned.
                </p>
              </div>
              <button
                type="submit"
                className="mt-6 w-full rounded-full bg-brandyellow py-4 text-sm font-semibold text-navy shadow-lg shadow-yellow-500/25 transition-all duration-300 hover:brightness-110"
              >
                Start assessment
              </button>
            </form>
          </div>
        </section>
      )}

      {step === 2 && (
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16" role="status" aria-live="polite">
          <div className="mb-10 flex h-24 w-24 animate-pulse items-center justify-center rounded-full bg-brandyellow/15 text-brandyellow">
            <svg className="h-12 w-12" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              />
            </svg>
          </div>
          <p className="text-lg font-semibold text-white">Analyzing exposure…</p>
          <p className="mt-2 text-sm text-white/50">{progressPct}%</p>
          <ol className="mt-10 w-full max-w-md space-y-3">
            {STEPS.map((s, i) => (
              <li
                key={s.label}
                className={`flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm backdrop-blur transition-all duration-300 ${
                  i < loadingStep
                    ? "text-green-400"
                    : i === loadingStep
                      ? "border-brandyellow/40 font-medium text-brandyellow animate-pulse"
                      : "text-white/40"
                }`}
              >
                <span aria-hidden className="text-lg">
                  {i < loadingStep ? "✓" : i === loadingStep ? "…" : "○"}
                </span>
                {s.label}
              </li>
            ))}
          </ol>
          {finalizing && (
            <p className="mt-6 text-sm font-medium text-brandyellow">Finalizing results…</p>
          )}
        </div>
      )}

      {step === 3 && result && (
        <div className="px-4 py-12">
          <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-navy/80 px-4 py-12 backdrop-blur">
            <div className="pointer-events-none absolute inset-0" aria-hidden>
              <div className="absolute right-10 top-10 h-48 w-48 rounded-full bg-brandyellow/10 blur-3xl" />
            </div>
            <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-8 md:flex-row md:justify-center">
              <ScoreGauge score={result.score} />
              <div className="text-center md:text-left">
                <RiskBadge level={result.riskLevel} />
                <p className="mt-3 text-sm text-white/70">
                  Breaches: {result.breachesFound} · Brokers (est.): {result.dataBrokersFound}{" "}
                  <span className="text-xs text-white/50">(estimated)</span> · Public profiles:{" "}
                  {result.publicProfiles}
                </p>
                <p className="mt-2 text-xs text-white/50">
                  Broker exposure is estimated from breach history. Premium unlocks full broker playbooks.
                </p>
              </div>
            </div>
          </section>

          <div className="mx-auto mt-10 max-w-3xl space-y-8">
            {result.partialResults && (
              <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-4">
                <p className="font-medium text-yellow-200">Some data sources were temporarily unavailable</p>
                <ul className="mt-1 list-inside list-disc text-sm text-yellow-100/90">
                  {(result.apiWarnings || []).map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
                <p className="mt-2 text-sm text-yellow-100/80">
                  Your score may be lower than actual. Try again later for a complete scan.
                </p>
              </div>
            )}

            {breakdown && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur">
                <h3 className="mb-6 text-lg font-semibold text-white">Score breakdown</h3>
                <div className="space-y-4">
                  <ScoreBar label="Data breaches" score={breakdown.breachScore} max={40} color="red" />
                  <ScoreBar label="Public profiles" score={breakdown.profileScore} max={30} color="orange" />
                  <ScoreBar label="Data broker exposure" score={breakdown.brokerScore} max={20} color="yellow" />
                  <ScoreBar label="Email risk" score={breakdown.emailRiskScore} max={10} color="blue" />
                </div>
              </div>
            )}

            {result.emailRisk != null &&
              (typeof result.emailRisk !== "object" ||
                (result.emailRisk && Object.keys(result.emailRisk).length > 0)) && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                  <h3 className="text-lg font-semibold text-white">Email risk</h3>
                  <p className="mt-2 text-sm text-white/70">
                    {typeof result.emailRisk === "object"
                      ? JSON.stringify(result.emailRisk, null, 2)
                      : String(result.emailRisk)}
                  </p>
                </div>
              )}

            <div className="grid gap-4 md:grid-cols-3">
              {[
                ["Breaches found", result.breachesFound],
                ["Data brokers (est.)", result.dataBrokersFound],
                ["Public profiles", result.publicProfiles],
              ].map(([label, val]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur">
                  <p className="text-2xl font-bold text-white">{val}</p>
                  <p className="text-xs text-white/50">{label}</p>
                </div>
              ))}
            </div>

            {Array.isArray(result.breaches) && result.breaches.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <h2 className="text-lg font-semibold text-white">Breach details</h2>
                <ul className="mt-4 space-y-3">
                  {result.breaches.map((b) => {
                    const sev = getBreachSeverity(b.dataTypes);
                    return (
                      <li key={b.name} className="rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 text-sm">
                        <span className={`font-medium ${sev.color}`}>{b.name}</span>
                        <span
                          className={`ml-2 rounded-full px-3 py-1 text-xs capitalize ${
                            sev.level === "critical"
                              ? "bg-red-500/10 text-red-400"
                              : sev.level === "high"
                                ? "bg-orange-500/10 text-orange-400"
                                : sev.level === "medium"
                                  ? "bg-yellow-500/10 text-yellow-400"
                                  : "bg-green-500/10 text-green-400"
                          }`}
                        >
                          {sev.level}
                        </span>
                        {b.breachDate && <span className="text-white/50"> — {b.breachDate}</span>}
                        {b.dataTypes?.length ? (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {b.dataTypes.map((dt) => (
                              <span
                                key={dt}
                                className="rounded-full bg-red-500/10 px-3 py-1 text-xs text-red-400"
                              >
                                {dt}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            <div className="flex flex-wrap gap-4">
              <Link
                to={`/remediation/${result.assessmentId}`}
                className="rounded-full bg-brandyellow px-8 py-3 text-sm font-semibold text-navy shadow-lg shadow-yellow-500/25 transition-all duration-300 hover:brightness-110"
              >
                View remediation steps
              </Link>
              <button
                type="button"
                onClick={runAnotherScan}
                className="rounded-full border border-white/20 px-8 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/10"
              >
                Run another scan
              </button>
              <button
                type="button"
                onClick={openWizard}
                className="rounded-full border border-white/20 px-8 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/10"
              >
                Start guided remediation
              </button>
              {user?.subscriptionTier !== "premium" && (
                <Link
                  to="/pricing"
                  className="rounded-full border border-brandyellow/50 px-8 py-3 text-sm font-semibold text-brandyellow transition-all duration-300 hover:bg-brandyellow/10"
                >
                  Upgrade to Premium
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
