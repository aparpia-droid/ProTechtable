import { Link } from "react-router-dom";
import { useState } from "react";

const faqs = [
  {
    q: "What is a vulnerability score?",
    a: "It summarizes breach exposure, public footprint, and email risk into a single 0–100 score with clear next steps.",
  },
  {
    q: "Do you store my passwords?",
    a: "No. We never ask for passwords for third-party services during assessments.",
  },
  {
    q: "Is the free tier enough to start?",
    a: "Yes. You can run one full assessment on the free plan and upgrade for unlimited scans and broker links.",
  },
  {
    q: "How accurate is broker exposure?",
    a: "Broker counts use a transparent MVP heuristic from breach signals; Premium unlocks full broker playbooks.",
  },
  {
    q: "Can I delete my data?",
    a: "Yes. You can delete your account from the Account page at any time.",
  },
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div>
      <section className="bg-navy px-4 py-16 text-white md:py-24" id="about">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-bold leading-tight md:text-5xl">
            Know Your Digital Exposure in 60 Seconds
          </h1>
          <p className="mt-4 text-lg text-white/85">
            ProTechtable checks breaches, public footprint, and email risk—then gives you a clear score and
            remediation plan.
          </p>
          <Link
            to="/signup"
            className="mt-8 inline-block rounded bg-brandyellow px-8 py-3 font-semibold text-navy focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Get started free
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-center text-2xl font-bold text-navy">How it works</h2>
        <ol className="mt-10 grid gap-8 md:grid-cols-3">
          <li className="rounded-lg border border-navy/10 p-6 text-center">
            <span className="text-3xl font-bold text-brandyellow" aria-hidden>
              1
            </span>
            <h3 className="mt-2 font-semibold text-navy">Submit email</h3>
            <p className="mt-2 text-sm text-brandgray">Create an account and run a secure assessment.</p>
          </li>
          <li className="rounded-lg border border-navy/10 p-6 text-center">
            <span className="text-3xl font-bold text-brandyellow" aria-hidden>
              2
            </span>
            <h3 className="mt-2 font-semibold text-navy">Get score</h3>
            <p className="mt-2 text-sm text-brandgray">See breaches, brokers, and public profile signals.</p>
          </li>
          <li className="rounded-lg border border-navy/10 p-6 text-center">
            <span className="text-3xl font-bold text-brandyellow" aria-hidden>
              3
            </span>
            <h3 className="mt-2 font-semibold text-navy">Take action</h3>
            <p className="mt-2 text-sm text-brandgray">Follow prioritized remediation and broker removals.</p>
          </li>
        </ol>
      </section>

      <section className="bg-navy/5 px-4 py-16">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            ["Breach Detection", "See known breaches tied to your email."],
            ["Data Broker Scanning", "Estimate broker-style exposure and opt-out paths."],
            ["Remediation Guidance", "Step-by-step actions with progress tracking."],
            ["Premium Protection", "Unlimited assessments and full broker links."],
          ].map(([title, desc]) => (
            <article key={title} className="rounded-lg border border-navy/10 bg-white p-6 shadow-sm">
              <h3 className="font-semibold text-navy">{title}</h3>
              <p className="mt-2 text-sm text-brandgray">{desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16">
        <h2 className="text-center text-2xl font-bold text-navy">Pricing</h2>
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[320px] border-collapse text-left text-sm">
            <caption className="sr-only">Free versus Premium comparison</caption>
            <thead>
              <tr className="border-b border-navy/20">
                <th scope="col" className="py-3 pr-4 font-semibold text-navy">
                  Feature
                </th>
                <th scope="col" className="py-3 pr-4 font-semibold text-navy">
                  Free
                </th>
                <th scope="col" className="py-3 font-semibold text-navy">
                  Premium
                </th>
              </tr>
            </thead>
            <tbody className="text-brandgray">
              <tr className="border-b border-navy/10">
                <td className="py-3">Assessments</td>
                <td className="py-3">1 total</td>
                <td className="py-3">Unlimited</td>
              </tr>
              <tr className="border-b border-navy/10">
                <td className="py-3">Breach &amp; risk score</td>
                <td className="py-3">Yes</td>
                <td className="py-3">Yes</td>
              </tr>
              <tr className="border-b border-navy/10">
                <td className="py-3">Broker removal links</td>
                <td className="py-3">First 3</td>
                <td className="py-3">All</td>
              </tr>
              <tr>
                <td className="py-3">Remediation tracking</td>
                <td className="py-3">Yes</td>
                <td className="py-3">Yes</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-6 text-center">
          <Link to="/pricing" className="font-semibold text-navy underline">
            View full pricing
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 pb-16">
        <h2 className="text-2xl font-bold text-navy">FAQ</h2>
        <div className="mt-6 space-y-2">
          {faqs.map((f, i) => (
            <div key={f.q} className="rounded border border-navy/10">
              <button
                type="button"
                className="flex w-full items-center justify-between px-4 py-3 text-left font-medium text-navy"
                aria-expanded={openFaq === i}
                onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
              >
                {f.q}
                <span aria-hidden>{openFaq === i ? "−" : "+"}</span>
              </button>
              {openFaq === i && (
                <p className="border-t border-navy/10 px-4 py-3 text-sm text-brandgray">{f.a}</p>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
