import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createCheckout } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function PricingPage() {
  const [billing, setBilling] = useState("monthly");
  const [pricingTier, setPricingTier] = useState("regular");
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.isStudent) setPricingTier("student");
  }, [user?.isStudent]);

  const isStudentTier = pricingTier === "student";
  const monthlyDisplay = isStudentTier ? "$4.99/mo" : "$9.99/mo";
  const annualDisplay = isStudentTier ? "$29/yr" : "$99/yr";
  const annualNote = isStudentTier ? "save vs monthly" : "save 17%";

  async function checkout() {
    if (!isAuthenticated) {
      window.location.href = "/signup";
      return;
    }
    if (isStudentTier && !user?.isStudent) {
      showToast("Sign up with a .edu email to unlock student pricing.", "error");
      return;
    }
    setLoading(true);
    try {
      const plan = billing === "annual" ? "annual" : "monthly";
      const { data } = await createCheckout({ plan, student: isStudentTier });
      if (data.sessionUrl) {
        window.location.href = data.sessionUrl;
      }
    } catch (e) {
      showToast(e.response?.data?.message || "Checkout unavailable", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-73px)] bg-white">
      <div className="mx-auto max-w-5xl px-4 py-12">
        <h1 className="text-center text-3xl font-bold text-navy">Pricing</h1>
        <p className="mx-auto mt-2 max-w-2xl text-center text-brandgray">
          Compare Free and Premium. Students save 50% when they sign up with a .edu email.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            className={`rounded px-4 py-2 text-sm font-semibold ${
              pricingTier === "regular" ? "bg-navy text-white" : "bg-navy/5 text-navy"
            }`}
            onClick={() => setPricingTier("regular")}
            aria-pressed={pricingTier === "regular"}
          >
            Regular
          </button>
          <button
            type="button"
            className={`relative rounded px-4 py-2 text-sm font-semibold ${
              pricingTier === "student" ? "bg-navy text-white" : "bg-navy/5 text-navy"
            }`}
            onClick={() => setPricingTier("student")}
            aria-pressed={pricingTier === "student"}
          >
            Student
            <span className="ml-2 rounded bg-brandyellow/90 px-1.5 py-0.5 text-[10px] font-bold text-navy">
              50% off
            </span>
          </button>
        </div>

        <div className="mt-4 flex justify-center gap-2">
          <button
            type="button"
            className={`rounded px-4 py-2 text-sm font-semibold ${
              billing === "monthly" ? "bg-navy text-white" : "bg-navy/5 text-navy"
            }`}
            onClick={() => setBilling("monthly")}
            aria-pressed={billing === "monthly"}
          >
            Monthly ({monthlyDisplay})
          </button>
          <button
            type="button"
            className={`rounded px-4 py-2 text-sm font-semibold ${
              billing === "annual" ? "bg-navy text-white" : "bg-navy/5 text-navy"
            }`}
            onClick={() => setBilling("annual")}
            aria-pressed={billing === "annual"}
          >
            Annual ({annualDisplay} — {annualNote})
          </button>
        </div>

        {isStudentTier && (
          <p className="mx-auto mt-4 max-w-xl text-center text-sm text-brandgray">
            Student pricing applies automatically when you create an account with a university email ending in{" "}
            <span className="font-mono text-navy">.edu</span>.
          </p>
        )}

        <div className="mt-10 grid gap-8 md:grid-cols-2">
          <section className="rounded-lg border border-navy/10 p-8">
            <h2 className="text-xl font-bold text-navy">Free</h2>
            <p className="mt-2 text-3xl font-bold text-navy">$0</p>
            <ul className="mt-6 space-y-2 text-sm text-brandgray">
              <li>✓ One vulnerability assessment</li>
              <li>✓ Breach and risk score</li>
              <li>✓ Remediation checklist</li>
              <li>✓ First 3 broker links</li>
            </ul>
            <Link
              to="/signup"
              className="mt-8 inline-block w-full rounded border border-navy py-3 text-center font-semibold text-navy"
            >
              Get started
            </Link>
          </section>
          <section className="rounded-lg border-2 border-brandyellow bg-navy/5 p-8">
            <h2 className="text-xl font-bold text-navy">Premium</h2>
            <p className="mt-2 text-3xl font-bold text-navy">
              {billing === "monthly" ? monthlyDisplay : annualDisplay}
            </p>
            <ul className="mt-6 space-y-2 text-sm text-brandgray">
              <li>✓ Unlimited assessments</li>
              <li>✓ Full data broker removal links</li>
              <li>✓ Priority remediation tracking</li>
              <li>✓ Email support</li>
            </ul>
            <button
              type="button"
              disabled={loading}
              onClick={checkout}
              className="mt-8 w-full rounded bg-brandyellow py-3 font-semibold text-navy disabled:opacity-60"
            >
              {loading ? "Redirecting…" : "Upgrade now"}
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
