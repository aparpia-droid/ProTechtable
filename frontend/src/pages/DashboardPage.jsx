import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getSubscription, getUserAssessments } from "../lib/api";
import ScoreGauge from "../components/ScoreGauge";
import RiskBadge from "../components/RiskBadge";
import LoadingSpinner from "../components/LoadingSpinner";

export default function DashboardPage() {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState([]);
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [a, s] = await Promise.all([getUserAssessments(), getSubscription()]);
        if (!cancelled) {
          setAssessments(a.data.data || []);
          setSub(s.data.data);
        }
      } catch {
        if (!cancelled) setAssessments([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const latest = assessments[0];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold text-navy">
        Welcome{user?.firstName ? `, ${user.firstName}` : ""}
      </h1>
      <p className="mt-1 text-brandgray">Your exposure dashboard</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section className="rounded-lg border border-navy/10 p-6">
          <h2 className="text-lg font-semibold text-navy">Latest score</h2>
          {loading ? (
            <LoadingSpinner />
          ) : latest ? (
            <div className="mt-4 flex flex-col items-center gap-4 md:flex-row md:items-start">
              <ScoreGauge score={latest.score} size={160} />
              <div>
                <RiskBadge level={latest.riskLevel} />
                <p className="mt-2 text-sm text-brandgray">
                  {latest.emailSearched} — {new Date(latest.createdAt).toLocaleDateString()}
                </p>
                <Link
                  to={`/assessment?resume=${latest.id}`}
                  className="mt-3 inline-block text-sm font-semibold text-navy underline"
                >
                  View details
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <p className="text-brandgray">Run your first assessment to see your score.</p>
              <Link
                to="/assessment"
                className="mt-4 inline-block rounded bg-brandyellow px-5 py-2 font-semibold text-navy"
              >
                Run assessment
              </Link>
            </div>
          )}
        </section>

        <section className="rounded-lg border border-navy/10 p-6">
          <h2 className="text-lg font-semibold text-navy">Subscription</h2>
          <p className="mt-2 capitalize text-brandgray">
            {sub?.tier === "premium" ? "Premium" : "Free"}
          </p>
          {sub?.tier === "premium" && sub?.currentPeriodEnd && (
            <p className="mt-1 text-xs text-brandgray">
              Renews {new Date(sub.currentPeriodEnd).toLocaleDateString()}
            </p>
          )}
          <Link
            to="/pricing"
            className="mt-4 inline-block text-sm font-semibold text-navy underline"
          >
            {sub?.tier === "premium" ? "Manage billing" : "Upgrade to Premium"}
          </Link>
        </section>
      </div>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-navy">Past assessments</h2>
          <Link
            to="/assessment"
            className="rounded bg-navy px-4 py-2 text-sm font-semibold text-white"
          >
            Run new assessment
          </Link>
        </div>
        <ul className="mt-4 divide-y divide-navy/10 rounded border border-navy/10">
          {assessments.map((row) => (
            <li key={row.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
              <div>
                <p className="font-medium text-navy">{row.emailSearched}</p>
                <p className="text-xs text-brandgray">{new Date(row.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-navy">{row.score}</span>
                <RiskBadge level={row.riskLevel} />
                <Link to={`/remediation/${row.id}`} className="text-sm font-semibold text-navy underline">
                  Remediation
                </Link>
              </div>
            </li>
          ))}
          {!assessments.length && !loading && (
            <li className="px-4 py-6 text-center text-brandgray">No assessments yet.</li>
          )}
        </ul>
      </section>
    </div>
  );
}
