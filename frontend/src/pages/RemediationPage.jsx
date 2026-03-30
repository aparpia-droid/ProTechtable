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
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const progress = plan?.progress || { total: 0, completed: 0, percentage: 0 };
  const isFree = user?.subscriptionTier !== "premium";

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {wizardActions && (
        <RemediationWizard
          actions={wizardActions}
          onComplete={() => refresh()}
          onClose={() => setWizardActions(null)}
        />
      )}
      <h1 className="text-2xl font-bold text-navy">Remediation plan</h1>
      <p className="mt-1 text-brandgray">Assessment {assessmentId}</p>

      {isFree && (
        <div className="mt-6 rounded border border-brandyellow bg-brandyellow/10 px-4 py-3 text-sm text-navy">
          Unlock all data broker removal links with{" "}
          <Link to="/pricing" className="font-semibold underline">
            Premium
          </Link>
          .
        </div>
      )}

      {quickWins.length > 0 && (
        <div className="mt-8 rounded-lg border border-green-200 bg-green-50 p-6">
          <h3 className="text-lg font-semibold text-green-800">Quick wins — start here</h3>
          <p className="mt-1 text-sm text-green-700">
            These actions are easy and have the biggest impact on your security.
          </p>
          <ul className="mt-4 list-inside list-disc space-y-1 text-sm text-green-900">
            {quickWins.map((a) => (
              <li key={a.id}>{a.title}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-brandgray">Progress</span>
          <span className="font-medium text-navy">
            {progress.completed} of {progress.total} ({progress.percentage}%)
          </span>
        </div>
        <div
          className="mt-2 h-3 w-full rounded-full bg-navy/10"
          role="progressbar"
          aria-valuenow={progress.percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-3 rounded-full bg-brandyellow"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-navy">Priority actions</h2>
        <ul className="mt-4 space-y-4">
          {(plan?.actions || []).map((a) => (
            <li key={a.id} className="rounded border border-navy/10 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <span className="rounded bg-navy/5 px-2 py-0.5 text-xs font-semibold text-navy">
                    {a.priority}
                  </span>
                  <h3 className="mt-2 font-semibold text-navy">{a.title}</h3>
                  <p className="mt-1 text-sm text-brandgray">{a.description}</p>
                  <p className="mt-2 text-xs text-brandgray">
                    Difficulty: {a.difficulty} · Est. {a.timeEstimate}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {a.removalUrl && (
                    <a
                      href={a.removalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-semibold text-navy underline"
                    >
                      Open link
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => setWizardActions([a])}
                    className="text-sm font-semibold text-navy underline"
                  >
                    Walk me through it
                  </button>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={a.status === "completed"}
                      onChange={() => {
                        if (a.status !== "completed") markDone(a.id);
                      }}
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

      <section className="mt-12">
        <h2 className="text-lg font-semibold text-navy">Data broker removal</h2>
        <ul className="mt-4 divide-y divide-navy/10 rounded border border-navy/10">
          {brokers.map((b) => (
            <li key={b.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
              <div>
                <p className="font-medium text-navy">{b.name}</p>
                <p className="text-xs text-brandgray">
                  {b.removalMethod} · {b.difficulty}
                </p>
              </div>
              {b.locked ? (
                <Link to="/pricing" className="text-sm font-semibold text-navy underline">
                  Upgrade to Premium
                </Link>
              ) : (
                <a
                  href={b.removalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded bg-brandyellow px-3 py-1 text-sm font-semibold text-navy"
                >
                  Remove me
                </a>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
