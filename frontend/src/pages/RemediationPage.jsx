import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getBrokers, getRemediation, markActionComplete } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner";
import RemediationWizard from "../components/RemediationWizard";
import { useToast } from "../context/ToastContext";

export default function RemediationPage() {
  const { assessmentId } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [plan, setPlan] = useState(null);
  const [brokers, setBrokers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wizardActions, setWizardActions] = useState(null);

  async function refresh() {
    const [r, b] = await Promise.all([getRemediation(assessmentId), getBrokers()]);
    setPlan(r.data.remediationPlan);
    setBrokers(b.data.data || []);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await refresh();
      } catch {
        showToast("Could not load remediation", "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [assessmentId, showToast]);

  async function markDone(id) {
    try {
      await markActionComplete(id);
      await refresh();
      showToast("Marked complete", "success");
    } catch {
      showToast("Could not update action", "error");
    }
  }

  const quickWins = useMemo(() => {
    const actions = plan?.actions || [];
    return actions
      .filter((a) => a.status !== "completed")
      .filter((a) => a.difficulty === "Easy" || a.priority === "High")
      .slice(0, 3);
  }, [plan]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-[#0a1628]">
        <LoadingSpinner />
      </div>
    );
  }

  const progress = plan?.progress || { total: 0, completed: 0, percentage: 0 };
  const isFree = user?.subscriptionTier !== "premium";

  const priorityDot = (p) =>
    p === "High"
      ? "bg-red-400"
      : p === "Medium"
        ? "bg-yellow-400"
        : "bg-green-400";

  return (
    <div className="min-h-screen bg-[#0a1628] px-4 py-12">
      {wizardActions && (
        <RemediationWizard
          actions={wizardActions}
          onComplete={() => refresh()}
          onClose={() => setWizardActions(null)}
        />
      )}

      <section className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-navy/50 px-6 py-10 backdrop-blur">
        <h1 className="text-3xl font-bold text-white">Your security action plan</h1>
        <p className="mt-1 text-sm text-white/50">Assessment {assessmentId}</p>

        <div className="mt-8">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/60">Progress</span>
            <span className="font-medium text-white">
              {progress.completed} of {progress.total} ({progress.percentage}%)
            </span>
          </div>
          <div
            className="mt-2 h-3 w-full rounded-full bg-white/10"
            role="progressbar"
            aria-valuenow={progress.percentage}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-3 rounded-full bg-gradient-to-r from-brandyellow to-yellow-300 transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>
      </section>

      {isFree && (
        <div className="mx-auto mt-6 max-w-4xl rounded-2xl border border-brandyellow/30 bg-brandyellow/10 px-4 py-3 text-sm text-brandyellow">
          Unlock all data broker removal links with{" "}
          <Link to="/pricing" className="font-semibold underline transition-colors hover:text-white">
            Premium
          </Link>
          .
        </div>
      )}

      {quickWins.length > 0 && (
        <div className="mx-auto mt-10 max-w-4xl">
          <h2 className="text-lg font-semibold text-white">Quick wins — start here</h2>
          <p className="mt-1 text-sm text-white/50">
            These actions are easy and have the biggest impact on your security.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {quickWins.map((a) => (
              <div
                key={a.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition-all duration-300 hover:border-white/20"
              >
                <div className="flex items-start gap-2">
                  <svg className="mt-0.5 h-5 w-5 shrink-0 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <h3 className="font-bold text-white">{a.title}</h3>
                    <p className="mt-2 text-sm text-white/60">{a.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <section className="mx-auto mt-12 max-w-4xl">
        <h2 className="text-lg font-semibold text-white">Priority actions</h2>
        <ul className="mt-6 space-y-4">
          {(plan?.actions || []).map((a) => (
            <li key={a.id} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur transition-all duration-300 hover:bg-white/[0.08]">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${priorityDot(a.priority)}`} aria-hidden />
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/90">
                      {a.priority}
                    </span>
                    {a.difficulty && (
                      <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs text-orange-300">
                        {a.difficulty}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-3 font-semibold text-white">{a.title}</h3>
                  <p className="mt-2 text-sm text-white/60">{a.description}</p>
                  <p className="mt-2 text-xs text-white/40">
                    Est. {a.timeEstimate}
                  </p>
                </div>
                <div className="flex flex-col items-stretch gap-2 sm:items-end">
                  {a.removalUrl && (
                    <a
                      href={a.removalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-white/20 px-4 py-2 text-center text-sm font-semibold text-white transition-all duration-300 hover:bg-white/10"
                    >
                      Open link
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => setWizardActions([a])}
                    className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/10"
                  >
                    Walk me through it
                  </button>
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-white/80">
                    <input
                      type="checkbox"
                      checked={a.status === "completed"}
                      onChange={() => {
                        if (a.status !== "completed") markDone(a.id);
                      }}
                      className="rounded border-white/30 bg-white/10 text-brandyellow focus:ring-brandyellow"
                      aria-label={`Mark complete: ${a.title}`}
                    />
                    Mark complete
                  </label>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto mt-12 max-w-4xl">
        <h2 className="text-lg font-semibold text-white">Data broker removal</h2>
        <ul className="mt-6 space-y-3">
          {brokers.map((b) => (
            <li
              key={b.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur transition-all duration-300 hover:bg-white/10"
            >
              <div>
                <p className="font-medium text-white">{b.name}</p>
                <p className="text-xs text-white/50">
                  {b.removalMethod} · {b.difficulty}
                </p>
              </div>
              {b.locked ? (
                <Link
                  to="/pricing"
                  className="rounded-full border border-brandyellow/50 px-4 py-2 text-sm font-semibold text-brandyellow transition-all duration-300 hover:bg-brandyellow/10"
                >
                  Upgrade to Premium
                </Link>
              ) : (
                <a
                  href={b.removalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/10"
                >
                  Request removal
                </a>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
