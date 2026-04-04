import { useState } from "react";
import { Link } from "react-router-dom";
import { createCheckout } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const faqs = [
  {
    q: "What data brokers do you remove me from?",
    a: "We currently track and remove your data from 50+ brokers including Spokeo, BeenVerified, Whitepages, and more. We add new brokers regularly.",
  },
  {
    q: "How long does removal take?",
    a: "Most brokers process removals within 3–14 days. Some take up to 30 days. We track every request and follow up automatically.",
  },
  {
    q: "What happens if a broker re-lists me?",
    a: "With Premium, we continuously monitor and automatically re-submit removal requests if your data reappears.",
  },
  {
    q: "Is my data safe with ProTechtable?",
    a: "We use AES-256 encryption for all sensitive data. We never store your passwords or sell your information.",
  },
];

export default function PricingPage() {
  const [period, setPeriod] = useState("monthly");
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState(-1);

  async function checkoutPremium() {
    if (!isAuthenticated) {
      window.location.href = "/signup";
      return;
    }
    setLoading(true);
    try {
      const plan = period === "annual" ? "annual" : "monthly";
      const { data } = await createCheckout({ plan, student: false });
      if (data.sessionUrl) window.location.href = data.sessionUrl;
    } catch (e) {
      showToast(e.response?.data?.message || "Checkout unavailable", "error");
    } finally {
      setLoading(false);
    }
  }

  async function checkoutStudent() {
    if (!isAuthenticated) {
      window.location.href = "/signup";
      return;
    }
    if (!user?.isStudent) {
      showToast("Sign up with a .edu email to unlock student pricing.", "error");
      return;
    }
    setLoading(true);
    try {
      const plan = period === "annual" ? "annual" : "monthly";
      const { data } = await createCheckout({ plan, student: true });
      if (data.sessionUrl) window.location.href = data.sessionUrl;
    } catch (e) {
      showToast(e.response?.data?.message || "Checkout unavailable", "error");
    } finally {
      setLoading(false);
    }
  }

  const premPrice = period === "annual" ? "$79/yr" : "$7.99/mo";
  const stuPrice = period === "annual" ? "$39/yr" : "$3.99/mo";

  return (
    <div className="min-h-screen bg-[#0a0a0f] px-4 py-12">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-center text-3xl font-bold text-white md:text-4xl">Pricing</h1>
        <p className="mx-auto mt-3 max-w-2xl text-center text-gray-400">
          Remove your data from 50+ brokers. Start free, upgrade when you&apos;re ready.
        </p>

        <div className="mt-10 flex justify-center gap-2">
          <button
            type="button"
            className={`rounded-full px-5 py-2 text-sm font-semibold ${
              period === "monthly" ? "bg-brandyellow text-gray-900" : "border border-white/20 text-gray-300 hover:bg-white/5"
            }`}
            onClick={() => setPeriod("monthly")}
          >
            Monthly
          </button>
          <button
            type="button"
            className={`rounded-full px-5 py-2 text-sm font-semibold ${
              period === "annual" ? "bg-brandyellow text-gray-900" : "border border-white/20 text-gray-300 hover:bg-white/5"
            }`}
            onClick={() => setPeriod("annual")}
          >
            Annual (save 17%)
          </button>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          <section className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
            <h2 className="text-xl font-bold text-white">Free</h2>
            <p className="mt-1 text-sm text-gray-400">See your exposure</p>
            <p className="mt-6 text-4xl font-extrabold text-white">$0</p>
            <ul className="mt-8 flex-1 space-y-3 text-sm text-gray-300">
              <li className="flex gap-2">
                <span className="text-emerald-400">✓</span> Unlimited breach scans
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-400">✓</span> Risk score &amp; report
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-400">✓</span> See which brokers have your data
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-400">✓</span> First 3 remediation steps
              </li>
              <li className="flex items-start gap-2 text-gray-500">
                <span className="mt-0.5" aria-hidden>
                  🔒
                </span>
                <span>Automated broker removal</span>
              </li>
              <li className="flex items-start gap-2 text-gray-500">
                <span className="mt-0.5" aria-hidden>
                  🔒
                </span>
                <span>Continuous monitoring</span>
              </li>
              <li className="flex items-start gap-2 text-gray-500">
                <span className="mt-0.5" aria-hidden>
                  🔒
                </span>
                <span>Priority support</span>
              </li>
            </ul>
            <Link
              to="/scan"
              className="mt-8 block rounded-xl border border-white/20 py-3 text-center font-bold text-white hover:bg-white/5"
            >
              Start Free Scan
            </Link>
          </section>

          <section className="relative flex flex-col rounded-2xl border-2 border-brandyellow bg-white/5 p-8 shadow-xl shadow-brandyellow/10 backdrop-blur-xl">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brandyellow px-3 py-1 text-xs font-bold text-gray-900">
              MOST POPULAR
            </span>
            <h2 className="text-xl font-bold text-white">Premium</h2>
            <p className="mt-1 text-sm text-gray-400">Full protection + removal</p>
            <p className="mt-6 text-3xl font-extrabold text-brandyellow">{premPrice}</p>
            <ul className="mt-8 flex-1 space-y-3 text-sm text-gray-200">
              {[
                "Everything in Free",
                "Automated broker removal (50+ sites)",
                "Continuous breach monitoring",
                "Weekly re-scan & alerts",
                "Broker re-listing protection",
                "Score history & trends",
                "Priority email support",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="text-brandyellow">✓</span> {item}
                </li>
              ))}
            </ul>
            <button
              type="button"
              disabled={loading}
              onClick={checkoutPremium}
              className="mt-8 w-full rounded-xl bg-brandyellow py-3.5 font-bold text-gray-900 hover:bg-yellow-300 disabled:opacity-60"
            >
              {loading ? "Redirecting…" : "Start 7-Day Free Trial"}
            </button>
          </section>

          <section className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">Student</h2>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-300">
                .edu
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-400">Full protection, student budget</p>
            <p className="mt-6 text-3xl font-extrabold text-white">{stuPrice}</p>
            <ul className="mt-8 flex-1 space-y-3 text-sm text-gray-300">
              <li className="flex gap-2">
                <span className="text-emerald-400">✓</span> Everything in Premium
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-400">✓</span> Auto-applied with .edu email
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-400">✓</span> Campus-specific breach alerts
              </li>
            </ul>
            <Link
              to="/signup"
              className="mt-8 block rounded-xl border border-brandyellow/50 py-3 text-center font-bold text-brandyellow hover:bg-brandyellow/10"
            >
              Get Student Pricing
            </Link>
            {isAuthenticated && user?.isStudent && (
              <button
                type="button"
                disabled={loading}
                onClick={checkoutStudent}
                className="mt-3 w-full rounded-xl bg-brandyellow py-3 font-bold text-gray-900 hover:bg-yellow-300 disabled:opacity-60"
              >
                {loading ? "Redirecting…" : "Checkout student plan"}
              </button>
            )}
          </section>
        </div>

        <section className="mt-20">
          <h2 className="text-center text-2xl font-bold text-white">FAQ</h2>
          <div className="mx-auto mt-8 max-w-3xl space-y-2">
            {faqs.map((f, i) => (
              <div key={f.q} className="rounded-xl border border-white/10 bg-white/5">
                <button
                  type="button"
                  className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-semibold text-white"
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                >
                  {f.q}
                  <span className="text-gray-500">{openFaq === i ? "−" : "+"}</span>
                </button>
                {openFaq === i && (
                  <div className="border-t border-white/10 px-5 pb-4 pt-0">
                    <p className="text-sm text-gray-400">{f.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
