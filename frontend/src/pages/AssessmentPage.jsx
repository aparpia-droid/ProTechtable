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

function getBreachSeverity(dataClasses) {
  const list = Array.isArray(dataClasses) ? dataClasses : [];
  const critical = ["Passwords", "Credit cards", "Bank account numbers", "Social security numbers"];
  const high = ["Phone numbers", "Physical addresses", "IP addresses"];
  if (list.some((d) => critical.includes(d))) return { level: "critical", color: "text-red-700" };
  if (list.some((d) => high.includes(d))) return { level: "high", color: "text-orange-700" };
  if (list.some((d) => ["Email addresses", "Usernames", "Names"].includes(d))) {
    return { level: "medium", color: "text-yellow-800" };
  }
  return { level: "low", color: "text-gray-600" };
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
            for (let i = 0; i < 90; i++) {
              if (isCancelled()) return;
              await new Promise((r) => setTimeout(r, 2000));
              const res = await getAssessment(d.id);
              const row = res.data?.data;
              if (!row) continue;
              if (row.status === "completed") {
                setResult(mapGetToResult(row));
                setStep(3);
                return;
              }
              if (row.status === "failed") {
                showToast("Assessment failed. Please try again.", "error");
                return;
              }
            }
            if (!isCancelled()) showToast("Timed out waiting for results.", "error");
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
        for (let i = 0; i < 90; i++) {
          await new Promise((r) => setTimeout(r, 2000));
          const { data } = await getAssessment(payload.assessmentId);
          const row = data?.data;
          if (!row) continue;
          if (row.status === "completed") {
            const mapped = mapGetToResult(row);
            setResult(mapped);
            setFinalizing(false);
            setStep(3);
            await maybeShowCelebration(mapped.score);
            return;
          }
          if (row.status === "failed") {
            showToast("Assessment failed. Please try again.", "error");
            setStep(1);
            setFinalizing(false);
            return;
          }
        }
        showToast("Timed out waiting for results.", "error");
        setStep(1);
        setFinalizing(false);
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

  if (loadingResume) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const breakdown = result?.assessmentData?.scoreBreakdown;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-navy">Exposure assessment</h1>

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
        <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-navy">
              Email to assess
            </label>
            <input
              id="email"
              type="email"
              className="mt-1 w-full rounded border border-navy/20 px-3 py-2"
              {...register("email", { required: true })}
              aria-describedby="email-help"
            />
            <p id="email-help" className="mt-1 text-xs text-brandgray">
              Only your verified account email (or verified family emails on Premium) can be scanned.
            </p>
          </div>
          <button type="submit" className="rounded bg-brandyellow px-6 py-3 font-semibold text-navy">
            Start assessment
          </button>
        </form>
      )}

      {step === 2 && (
        <div className="mt-8" role="status" aria-live="polite">
          <p className="text-lg font-semibold text-navy">Analyzing exposure…</p>
          <ol className="mt-6 space-y-3">
            {STEPS.map((s, i) => (
              <li
                key={s.label}
                className={`flex items-center gap-2 text-sm ${
                  i < loadingStep
                    ? "text-green-700"
                    : i === loadingStep
                      ? "font-medium text-navy"
                      : "text-brandgray"
                }`}
              >
                <span aria-hidden>{i < loadingStep ? "✓" : i === loadingStep ? "…" : "○"}</span>
                {s.label}
              </li>
            ))}
          </ol>
          {finalizing && <p className="mt-4 text-sm font-medium text-navy">Finalizing results…</p>}
        </div>
      )}

      {step === 3 && result && (
        <div className="mt-8 space-y-8">
          {result.partialResults && (
            <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <p className="font-medium text-yellow-800">Some data sources were temporarily unavailable</p>
              <ul className="mt-1 list-inside list-disc text-sm text-yellow-700">
                {(result.apiWarnings || []).map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
              <p className="mt-2 text-sm text-yellow-700">
                Your score may be lower than actual. Try again later for a complete scan.
              </p>
            </div>
          )}

          <div className="flex flex-col items-center gap-4 md:flex-row md:items-start">
            <ScoreGauge score={result.score} />
            <div>
              <RiskBadge level={result.riskLevel} />
              <p className="mt-2 text-sm text-brandgray">
                Breaches: {result.breachesFound} · Brokers (est.): {result.dataBrokersFound}{" "}
                <span className="text-xs text-brandgray">(estimated)</span> · Public profiles:{" "}
                {result.publicProfiles}
              </p>
              <p className="mt-1 text-xs text-brandgray">
                Broker exposure is estimated from breach history. Premium unlocks full broker playbooks.
              </p>
            </div>
          </div>

          {breakdown && (
            <div className="mt-6 rounded-lg bg-white p-6 shadow">
              <h3 className="mb-4 text-lg font-semibold text-navy">Score breakdown</h3>
              <div className="space-y-3">
                <ScoreBar label="Data breaches" score={breakdown.breachScore} max={40} color="red" />
                <ScoreBar label="Public profiles" score={breakdown.profileScore} max={30} color="orange" />
                <ScoreBar label="Data broker exposure" score={breakdown.brokerScore} max={20} color="yellow" />
                <ScoreBar label="Email risk" score={breakdown.emailRiskScore} max={10} color="blue" />
              </div>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            {[
              ["Breaches found", result.breachesFound],
              ["Data brokers (est.)", result.dataBrokersFound],
              ["Public profiles", result.publicProfiles],
            ].map(([label, val]) => (
              <div key={label} className="rounded border border-navy/10 p-4 text-center">
                <p className="text-2xl font-bold text-navy">{val}</p>
                <p className="text-xs text-brandgray">{label}</p>
              </div>
            ))}
          </div>

          {Array.isArray(result.breaches) && result.breaches.length > 0 && (
            <div>
              <h2 className="font-semibold text-navy">Breach details</h2>
              <ul className="mt-2 divide-y divide-navy/10 rounded border border-navy/10">
                {result.breaches.map((b) => {
                  const sev = getBreachSeverity(b.dataTypes);
                  return (
                    <li key={b.name} className="px-3 py-2 text-sm">
                      <span className={`font-medium ${sev.color}`}>{b.name}</span>
                      <span className="ml-2 rounded bg-navy/5 px-2 text-xs capitalize text-navy">
                        {sev.level}
                      </span>
                      {b.breachDate && <span className="text-brandgray"> — {b.breachDate}</span>}
                      {b.dataTypes?.length ? (
                        <p className="text-xs text-brandgray">{b.dataTypes.join(", ")}</p>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={openWizard}
              className="rounded border border-navy px-5 py-2 font-semibold text-navy"
            >
              Start Guided Remediation
            </button>
            <Link
              to={`/remediation/${result.assessmentId}`}
              className="rounded bg-navy px-5 py-2 font-semibold text-white"
            >
              View remediation steps
            </Link>
            {user?.subscriptionTier !== "premium" && (
              <Link to="/pricing" className="rounded border border-navy px-5 py-2 font-semibold text-navy">
                Upgrade to Premium
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
