import { useState } from "react";
import { Link } from "react-router-dom";
import { createCheckout } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function PricingPage() {
  const [billing, setBilling] = useState("monthly");
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  async function checkout() {
    if (!isAuthenticated) {
      window.location.href = "/signup";
      return;
    }
    setLoading(true);
    try {
      const plan = billing === "annual" ? "annual" : "monthly";
      const { data } = await createCheckout({ plan });
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
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-center text-3xl font-bold text-navy">Pricing</h1>
      <p className="mx-auto mt-2 max-w-2xl text-center text-brandgray">
        Compare Free and Premium. Upgrade when you need unlimited scans and full broker removal links.
      </p>

      <div className="mt-8 flex justify-center gap-2">
        <button
          type="button"
          className={`rounded px-4 py-2 text-sm font-semibold ${
            billing === "monthly" ? "bg-navy text-white" : "bg-navy/5 text-navy"
          }`}
          onClick={() => setBilling("monthly")}
          aria-pressed={billing === "monthly"}
        >
          Monthly ($9.99/mo)
        </button>
        <button
          type="button"
          className={`rounded px-4 py-2 text-sm font-semibold ${
            billing === "annual" ? "bg-navy text-white" : "bg-navy/5 text-navy"
          }`}
          onClick={() => setBilling("annual")}
          aria-pressed={billing === "annual"}
        >
          Annual ($99/yr — save 17%)
        </button>
      </div>

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
            {billing === "monthly" ? "$9.99/mo" : "$99/yr"}
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
  );
}
