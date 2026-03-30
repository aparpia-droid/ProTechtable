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
            ProTechtable checks breaches, public footprint, and email risk&mdash;then gives you a clear score
            and remediation plan. Results guaranteed in under a minute.
          </p>
          <Link
            to="/signup"
            className="mt-8 inline-block rounded bg-brandyellow px-8 py-3 font-semibold text-navy focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Get started free
          </Link>

          <div className="mt-12 mx-auto max-w-sm rounded-xl bg-white/10 p-6 text-left backdrop-blur">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/70">Sample Result</span>
              <span className="rounded-full bg-orange-500/20 px-3 py-1 text-xs font-semibold text-orange-300">
                HIGH RISK
              </span>
            </div>
            <div className="mt-4 text-center">
              <span className="text-5xl font-bold text-brandyellow">68</span>
              <span className="text-xl text-white/60">/100</span>
            </div>
            <div className="mt-4 space-y-2 text-sm text-white/80">
              <div className="flex justify-between">
                <span>Data breaches</span>
                <span className="font-semibold text-white">3 found</span>
              </div>
              <div className="flex justify-between">
                <span>Broker exposure</span>
                <span className="font-semibold text-white">8 est.</span>
              </div>
              <div className="flex justify-between">
                <span>Public profiles</span>
                <span className="font-semibold text-white">12 found</span>
              </div>
            </div>
            <p className="mt-4 text-center text-xs text-white/50">This is a sample. Get your real score above.</p>
          </div>
        </div>
      </section>

      <section className="border-b border-gray-100 bg-gray-50 px-4 py-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-8 text-sm text-brandgray">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <span>AES-256 encryption</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <span>No tracking cookies</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            <span>Delete anytime (GDPR)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-navy">Powered by</span>
            <span>Have I Been Pwned</span>
          </div>
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

      <section className="bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-10 text-center text-2xl font-bold text-navy">What early users say</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                quote:
                  "I had no idea I was in 6 breaches. The remediation steps were clear and I fixed everything in an afternoon.",
                name: "Sarah M.",
                role: "Marketing Manager",
              },
              {
                quote:
                  "The score breakdown showed me exactly where my risk was coming from. Changed all my passwords and froze my credit in one session.",
                name: "James K.",
                role: "Software Engineer",
              },
              {
                quote:
                  "Simple, fast, and honest about what it can and can't do. The broker removal links saved me hours of Googling.",
                name: "Priya R.",
                role: "Freelance Designer",
              },
            ].map((t, i) => (
              <div key={i} className="rounded-lg border border-gray-200 bg-white p-6">
                <p className="leading-relaxed text-brandgray">&quot;{t.quote}&quot;</p>
                <div className="mt-4 border-t pt-4">
                  <p className="font-semibold text-navy">{t.name}</p>
                  <p className="text-sm text-brandgray">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
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
