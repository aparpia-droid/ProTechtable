import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { createAssessment, getAssessment } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import ScoreGauge from "../components/ScoreGauge";
import RiskBadge from "../components/RiskBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import { useToast } from "../context/ToastContext";

const STEPS = [
  { label: "Checking breach databases...", ms: 2000 },
  { label: "Scanning public profiles...", ms: 2000 },
  { label: "Analyzing data broker exposure...", ms: 2000 },
  { label: "Calculating vulnerability score...", ms: 1000 },
];

export default function AssessmentPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [params] = useSearchParams();
  const resumeId = params.get("resume");
  const { register, handleSubmit } = useForm();
  const [step, setStep] = useState(1);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState(null);
  const [loadingResume, setLoadingResume] = useState(Boolean(resumeId));

  useEffect(() => {
    if (!resumeId) return;
    let cancelled = false;
    (async () => {
      try {
        const { data } = await getAssessment(resumeId);
        if (!cancelled && data?.data) {
          const d = data.data;
          setResult({
            assessmentId: d.id,
            score: d.score,
            riskLevel: d.riskLevel,
            breachesFound: d.breachesFound,
            dataBrokersFound: d.dataBrokersFound,
            publicProfiles: d.publicProfiles,
            breaches: d.breaches || [],
            emailRisk: d.assessmentData?.hunter,
          });
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

  async function runLoadingSimulation() {
    let elapsed = 0;
    for (let i = 0; i < STEPS.length; i++) {
      setLoadingStep(i);
      await new Promise((r) => setTimeout(r, STEPS[i].ms));
      elapsed += STEPS[i].ms;
    }
    return elapsed;
  }

  async function onSubmit(values) {
    setStep(2);
    setLoadingStep(0);
    try {
      const [, res] = await Promise.all([
        runLoadingSimulation(),
        createAssessment({ email: values.email }),
      ]);
      setResult(res.data.data);
      setStep(3);
    } catch (e) {
      showToast(e.response?.data?.message || "Assessment failed", "error");
      setStep(1);
    }
  }

  if (loadingResume) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-navy">Exposure assessment</h1>

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
              We scan public breach indexes and related signals—not your inbox.
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
                  i < loadingStep ? "text-green-700" : i === loadingStep ? "text-navy font-medium" : "text-brandgray"
                }`}
              >
                <span aria-hidden>{i < loadingStep ? "✓" : i === loadingStep ? "…" : "○"}</span>
                {s.label}
              </li>
            ))}
          </ol>
        </div>
      )}

      {step === 3 && result && (
        <div className="mt-8 space-y-8">
          <div className="flex flex-col items-center gap-4 md:flex-row md:items-start">
            <ScoreGauge score={result.score} />
            <div>
              <RiskBadge level={result.riskLevel} />
              <p className="mt-2 text-sm text-brandgray">
                Breaches: {result.breachesFound} · Brokers (est.): {result.dataBrokersFound} · Public
                profiles: {result.publicProfiles}
              </p>
            </div>
          </div>

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
                {result.breaches.map((b) => (
                  <li key={b.name} className="px-3 py-2 text-sm">
                    <span className="font-medium text-navy">{b.name}</span>
                    {b.breachDate && (
                      <span className="text-brandgray"> — {b.breachDate}</span>
                    )}
                    {b.dataTypes?.length ? (
                      <p className="text-xs text-brandgray">{b.dataTypes.join(", ")}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
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
