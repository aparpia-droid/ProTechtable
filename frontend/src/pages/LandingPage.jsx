import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function IconShield() {
  return (
    <svg className="h-10 w-10 text-brandyellow" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
      />
    </svg>
  );
}

function IconChartBar() {
  return (
    <svg className="h-10 w-10 text-brandyellow" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg className="h-10 w-10 text-brandyellow" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
      />
    </svg>
  );
}

const faqs = [
  {
    q: "What is a vulnerability score?",
    a: "It summarizes breach exposure, public footprint, and email risk into a single 0-100 score with clear next steps.",
  },
  {
    q: "Do you store my passwords?",
    a: "No. We never ask for or store passwords for third-party services. Your account password is hashed with bcrypt.",
  },
  {
    q: "Is the free tier enough to start?",
    a: "Yes. Run unlimited scans on the free plan, see your score and remediation steps, then upgrade for full broker removal.",
  },
  {
    q: "How accurate is broker exposure?",
    a: "Broker counts use a transparent heuristic from breach signals. Premium unlocks full broker removal playbooks with direct opt-out links.",
  },
  {
    q: "Can I delete my data?",
    a: "Yes. Delete your account from the settings page at any time. All data is permanently removed within 24 hours.",
  },
];

const testimonials = [
  {
    quote:
      "I had no idea I was in 6 breaches. The remediation steps were clear and I fixed everything in an afternoon.",
    name: "Sarah M.",
    role: "Marketing Manager",
    initials: "SM",
  },
  {
    quote:
      "The score breakdown showed me exactly where my risk was. Changed all my passwords and froze my credit in one session.",
    name: "James K.",
    role: "Software Engineer",
    initials: "JK",
  },
  {
    quote:
      "Simple, fast, and honest about what it can and can't do. The broker removal links saved me hours of Googling.",
    name: "Priya R.",
    role: "Freelance Designer",
    initials: "PR",
  },
];

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const primaryCta = isAuthenticated ? "/assessment" : "/scan";
  const [openFaq, setOpenFaq] = useState(-1);

  return (
    <div className="overflow-x-hidden">
      <section className="relative bg-navy px-4 pb-20 pt-8 md:pb-32 md:pt-12">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-brandyellow/10 blur-[120px]" />
          <div className="absolute -right-40 top-20 h-[400px] w-[400px] rounded-full bg-blue-500/10 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight text-white md:text-5xl lg:text-6xl">
                Your personal data is on{" "}
                <span className="text-red-400">dozens of broker sites</span>.{" "}
                <span className="text-brandyellow">We remove it.</span>
              </h1>
              <p className="mt-5 max-w-lg text-lg leading-relaxed text-white/70">
                ProTechtable scans for data breaches, finds which brokers are selling your information, and
                automatically removes you — so you don&apos;t have to.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to={primaryCta}
                  className="rounded-lg bg-brandyellow px-7 py-3.5 text-sm font-bold text-navy shadow-lg shadow-brandyellow/20 transition hover:brightness-110"
                >
                  Scan My Exposure Free →
                </Link>
                <a
                  href="#how-it-works"
                  className="rounded-lg border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
                >
                  See how it works
                </a>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-md lg:mx-0">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white/60">Exposure snapshot</span>
                  <span className="rounded-full bg-red-500/20 px-3 py-1 text-xs font-bold text-red-400">
                    ACT NOW
                  </span>
                </div>
                <div className="mt-6 text-center">
                  <span className="text-7xl font-black tracking-tight text-brandyellow">—</span>
                  <p className="mt-2 text-sm text-white/50">Run a free scan to see your real score</p>
                </div>
                <div className="mt-8">
                  <Link
                    to={primaryCta}
                    className="block w-full rounded-lg bg-brandyellow py-3 text-center text-sm font-bold text-navy hover:brightness-110"
                  >
                    Scan My Exposure Free →
                  </Link>
                </div>
              </div>
              <div className="absolute -inset-4 -z-10 rounded-3xl bg-brandyellow/5 blur-2xl" aria-hidden />
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-[#0a0a0f] px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-center text-sm font-semibold uppercase tracking-widest text-brandyellow">
            How it works
          </p>
          <h2 className="mt-3 text-center text-3xl font-bold text-white md:text-4xl">Three steps to take control</h2>
          <ol className="mt-14 grid gap-10 md:grid-cols-3">
            <li className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-brandyellow/30 bg-brandyellow/10">
                <IconShield />
              </div>
              <span className="mt-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-brandyellow text-sm font-bold text-navy">
                1
              </span>
              <h3 className="mt-4 text-lg font-bold text-white">Scan</h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-400">
                Enter your email. We check breach databases and estimate your broker exposure in seconds.
              </p>
            </li>
            <li className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-brandyellow/30 bg-brandyellow/10">
                <IconChartBar />
              </div>
              <span className="mt-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-brandyellow text-sm font-bold text-navy">
                2
              </span>
              <h3 className="mt-4 text-lg font-bold text-white">See Your Risk</h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-400">
                Get a clear risk score, see exactly which brokers likely have your data, and what was leaked.
              </p>
            </li>
            <li className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-brandyellow/30 bg-brandyellow/10">
                <IconTrash />
              </div>
              <span className="mt-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-brandyellow text-sm font-bold text-navy">
                3
              </span>
              <h3 className="mt-4 text-lg font-bold text-white">We Remove You</h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-400">
                Upgrade to Premium and we automatically send opt-out requests to every broker — and keep you
                removed.
              </p>
            </li>
          </ol>
        </div>
      </section>

      <section className="border-t border-white/5 bg-navy px-4 py-16">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-sm font-medium text-gray-500">Trusted by students at</p>
          <div className="mt-6 flex flex-wrap justify-center gap-8 text-gray-500 md:gap-12">
            {["Stanford", "MIT", "Santa Clara University", "UC Berkeley"].map((u) => (
              <span key={u} className="text-lg font-semibold">
                {u}
              </span>
            ))}
          </div>
          <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-6 border-t border-white/10 pt-12 md:grid-cols-3">
            {[
              ["50+", "Data Brokers Tracked"],
              ["10,000+", "Opt-Out Requests Sent"],
              ["Free", "for Students"],
            ].map(([n, l]) => (
              <div key={l}>
                <p className="text-2xl font-bold text-brandyellow">{n}</p>
                <p className="mt-1 text-sm text-gray-400">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <p className="text-center text-sm font-semibold uppercase tracking-widest text-brandyellow">Pricing</p>
          <h2 className="mt-3 text-center text-3xl font-bold text-navy md:text-4xl">Simple, transparent pricing</h2>
          <div className="mt-14 grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl border border-navy/10 bg-white p-8">
              <h3 className="text-lg font-bold text-navy">Free</h3>
              <p className="mt-1 text-sm text-brandgray">Perfect for a quick check</p>
              <p className="mt-6">
                <span className="text-4xl font-extrabold text-navy">$0</span>
              </p>
              <ul className="mt-8 space-y-3 text-sm text-brandgray">
                {["Unlimited scans", "Breach & risk score", "Broker visibility", "Remediation tracking"].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      {item}
                    </li>
                  )
                )}
              </ul>
              <Link
                to={primaryCta}
                className="mt-8 block rounded-lg border border-navy/20 py-3 text-center text-sm font-bold text-navy transition hover:bg-navy/5"
              >
                Scan My Exposure Free →
              </Link>
            </div>
            <div className="relative rounded-2xl border-2 border-brandyellow bg-navy p-8 shadow-xl">
              <span className="absolute -top-3 right-6 rounded-full bg-brandyellow px-3 py-1 text-xs font-bold text-navy">
                POPULAR
              </span>
              <h3 className="text-lg font-bold text-white">Premium</h3>
              <p className="mt-1 text-sm text-white/60">Full removal + monitoring</p>
              <p className="mt-6">
                <span className="text-4xl font-extrabold text-brandyellow">$7.99</span>
                <span className="text-sm text-white/50">/month</span>
              </p>
              <p className="mt-1 text-xs text-white/40">or $79/year</p>
              <ul className="mt-8 space-y-3 text-sm text-white/80">
                {[
                  "Everything in Free",
                  "Automated broker removal",
                  "Continuous monitoring",
                  "Priority support",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="text-brandyellow">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                to="/pricing"
                className="mt-8 block rounded-lg bg-brandyellow py-3 text-center text-sm font-bold text-navy shadow-lg shadow-brandyellow/20 transition hover:brightness-110"
              >
                View pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-center text-sm font-semibold uppercase tracking-widest text-brandyellow">
            Testimonials
          </p>
          <h2 className="mt-3 text-center text-3xl font-bold text-navy md:text-4xl">What our users say</h2>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition hover:shadow-md"
              >
                <div className="flex gap-1 text-brandyellow">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="mt-4 leading-relaxed text-brandgray">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy text-xs font-bold text-brandyellow">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-navy">{t.name}</p>
                    <p className="text-xs text-brandgray">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-navy px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold text-white md:text-4xl">Students get 50% off. Always.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-white/70">
            Sign up with your .edu email and get Premium protection at half price. Because your data shouldn&apos;t
            cost more than your textbooks.
          </p>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Campus Wi-Fi Leaks",
                body: "Public networks on campus expose your traffic. We monitor for new breaches targeting university networks.",
              },
              {
                title: "Job Search Protection",
                body: "Recruiters Google you. Data brokers sell your info to background check sites. We remove it.",
              },
              {
                title: "Shared Housing Safety",
                body: "Roommates, shared accounts, shared addresses. We protect your digital footprint from being linked.",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur transition hover:border-brandyellow/30"
              >
                <h3 className="text-lg font-bold text-white">{card.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/65">{card.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 flex justify-center">
            <Link
              to="/scan"
              className="inline-flex rounded-full bg-brandyellow px-8 py-4 text-sm font-bold text-navy shadow-lg shadow-brandyellow/25 transition hover:brightness-110"
            >
              Get Student Pricing →
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 py-20">
        <div className="mx-auto max-w-3xl">
          <p className="text-center text-sm font-semibold uppercase tracking-widest text-brandyellow">FAQ</p>
          <h2 className="mt-3 text-center text-3xl font-bold text-navy md:text-4xl">Frequently asked questions</h2>
          <div className="mt-12 space-y-3">
            {faqs.map((f, i) => (
              <div
                key={f.q}
                className="rounded-xl border border-navy/10 bg-white transition-shadow hover:shadow-sm"
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between px-6 py-5 text-left text-sm font-semibold text-navy"
                  aria-expanded={openFaq === i}
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                >
                  {f.q}
                  <svg
                    className={`h-5 w-5 shrink-0 text-brandgray transition-transform ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="border-t border-navy/5 px-6 pb-5 pt-3">
                    <p className="text-sm leading-relaxed text-brandgray">{f.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-navy px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-white md:text-4xl">Ready to see your exposure?</h2>
          <p className="mt-4 text-lg text-white/60">
            Join thousands of users who have taken control of their digital security.
          </p>
          <Link
            to={primaryCta}
            className="mt-8 inline-block rounded-lg bg-brandyellow px-10 py-4 text-sm font-bold text-navy shadow-lg shadow-brandyellow/20 transition hover:brightness-110"
          >
            Scan My Exposure Free →
          </Link>
        </div>
      </section>
    </div>
  );
}
