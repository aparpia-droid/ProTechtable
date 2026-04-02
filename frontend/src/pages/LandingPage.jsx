import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

/* ── Animated counter ─────────────────────────────────── */
function AnimatedNumber({ target, suffix = "", duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const step = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            setCount(Math.floor(progress * target));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ── FAQ data ─────────────────────────────────────────── */
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
    a: "Yes. Run one full assessment on the free plan, see your score and remediation steps, then upgrade for unlimited scans.",
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

/* ── Features ─────────────────────────────────────────── */
const features = [
  {
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
        />
      </svg>
    ),
    title: "Breach Detection",
    desc: "Cross-reference your email against known data breaches using the Have I Been Pwned database.",
  },
  {
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
        />
      </svg>
    ),
    title: "Data Broker Scanning",
    desc: "Estimate your exposure across data broker networks and get direct opt-out links with Premium.",
  },
  {
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
        />
      </svg>
    ),
    title: "Guided Remediation",
    desc: "Step-by-step instructions to freeze credit, change passwords, set fraud alerts, and remove broker listings.",
  },
  {
    icon: (
      <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
        />
      </svg>
    ),
    title: "Score Tracking",
    desc: "Monitor your exposure score over time with trend charts and get re-scan reminders.",
  },
];

/* ── Testimonials ─────────────────────────────────────── */
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

/* ── Main Component ───────────────────────────────────── */
export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState(-1);

  return (
    <div className="overflow-x-hidden">
      {/* ── HERO ──────────────────────────────────────── */}
      <section className="relative bg-navy px-4 pb-20 pt-8 md:pb-32 md:pt-12">
        {/* Gradient orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-brandyellow/10 blur-[120px]" />
          <div className="absolute -right-40 top-20 h-[400px] w-[400px] rounded-full bg-blue-500/10 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left — Copy */}
            <div>
              <span className="inline-block rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs font-medium tracking-wide text-white/80 backdrop-blur">
                Trusted by security-conscious individuals
              </span>
              <h1 className="mt-6 text-4xl font-extrabold leading-[1.1] tracking-tight text-white md:text-5xl lg:text-6xl">
                Know your digital exposure.{" "}
                <span className="text-brandyellow">Take control.</span>
              </h1>
              <p className="mt-5 max-w-lg text-lg leading-relaxed text-white/70">
                ProTechtable scans breaches, public profiles, and data brokers — then gives you a clear score
                and step-by-step remediation plan in under 60 seconds.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/signup"
                  className="rounded-lg bg-brandyellow px-7 py-3.5 text-sm font-bold text-navy shadow-lg shadow-brandyellow/20 transition hover:brightness-110 focus-visible:ring-2 focus-visible:ring-brandyellow focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
                >
                  Get started free
                </Link>
                <a
                  href="#how-it-works"
                  className="rounded-lg border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white"
                >
                  Learn more
                </a>
              </div>

              {/* Trust badges inline */}
              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-white/50">
                <span className="flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  AES-256 encrypted
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  No tracking cookies
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="h-4 w-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  GDPR compliant
                </span>
              </div>
            </div>

            {/* Right — Sample score card */}
            <div className="relative mx-auto w-full max-w-md lg:mx-0">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white/60">Vulnerability Score</span>
                  <span className="rounded-full bg-red-500/20 px-3 py-1 text-xs font-bold text-red-400">
                    HIGH RISK
                  </span>
                </div>
                <div className="mt-6 text-center">
                  <span className="text-7xl font-black tracking-tight text-brandyellow">68</span>
                  <span className="ml-1 text-2xl font-medium text-white/40">/100</span>
                </div>
                <div className="mt-8 space-y-3">
                  {[
                    ["Data breaches", "3 found", "bg-red-500"],
                    ["Broker exposure", "8 est.", "bg-orange-500"],
                    ["Public profiles", "12 found", "bg-yellow-500"],
                  ].map(([label, val, color]) => (
                    <div key={label} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-white/70">
                        <span className={`h-2 w-2 rounded-full ${color}`} />
                        {label}
                      </div>
                      <span className="font-semibold text-white">{val}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <p className="mt-4 text-center text-xs text-white/40">Sample result — get your real score above</p>
              </div>
              {/* Glow behind card */}
              <div className="absolute -inset-4 -z-10 rounded-3xl bg-brandyellow/5 blur-2xl" aria-hidden />
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ─────────────────────────────────── */}
      <section className="border-b border-gray-100 bg-white px-4 py-10">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 text-center md:grid-cols-4">
          {[
            [10000, "+", "Breaches monitored"],
            [60, "s", "Average scan time"],
            [256, "-bit", "Encryption standard"],
            [100, "%", "Data you control"],
          ].map(([num, suf, label]) => (
            <div key={label}>
              <p className="text-3xl font-extrabold text-navy md:text-4xl">
                <AnimatedNumber target={num} suffix={suf} />
              </p>
              <p className="mt-1 text-sm text-brandgray">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────── */}
      <section id="how-it-works" className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-center text-sm font-semibold uppercase tracking-widest text-brandyellow">
            How it works
          </p>
          <h2 className="mt-3 text-center text-3xl font-bold text-navy md:text-4xl">
            Three steps to digital safety
          </h2>
          <ol className="mt-14 grid gap-8 md:grid-cols-3">
            {[
              [
                "Submit your email",
                "Create an account and run a secure assessment against breach databases, public records, and broker networks.",
              ],
              [
                "Get your score",
                "Receive a 0-100 vulnerability score with a detailed breakdown of breaches, broker exposure, and email risk.",
              ],
              [
                "Take action",
                "Follow prioritized, step-by-step remediation — freeze credit, change passwords, remove broker listings.",
              ],
            ].map(([title, desc], i) => (
              <li
                key={title}
                className="group relative rounded-2xl border border-navy/5 bg-gray-50 p-8 transition hover:border-navy/20 hover:shadow-lg"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy text-sm font-bold text-brandyellow">
                  {i + 1}
                </span>
                <h3 className="mt-5 text-lg font-bold text-navy">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-brandgray">{desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────── */}
      <section className="bg-navy px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-center text-sm font-semibold uppercase tracking-widest text-brandyellow">Features</p>
          <h2 className="mt-3 text-center text-3xl font-bold text-white md:text-4xl">
            Everything you need to protect yourself
          </h2>
          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur transition hover:border-white/20 hover:bg-white/[0.08]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brandyellow/10 text-brandyellow">
                  {f.icon}
                </div>
                <h3 className="mt-5 text-lg font-bold text-white">{f.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/60">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ───────────────────────────────────── */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-5xl">
          <p className="text-center text-sm font-semibold uppercase tracking-widest text-brandyellow">Pricing</p>
          <h2 className="mt-3 text-center text-3xl font-bold text-navy md:text-4xl">
            Simple, transparent pricing
          </h2>
          <div className="mt-14 grid gap-8 md:grid-cols-2">
            {/* Free */}
            <div className="rounded-2xl border border-navy/10 bg-white p-8">
              <h3 className="text-lg font-bold text-navy">Free</h3>
              <p className="mt-1 text-sm text-brandgray">Perfect for a quick check</p>
              <p className="mt-6">
                <span className="text-4xl font-extrabold text-navy">$0</span>
              </p>
              <ul className="mt-8 space-y-3 text-sm text-brandgray">
                {["1 full assessment", "Breach & risk score", "First 3 broker links", "Remediation tracking"].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-2">
                      <svg className="h-5 w-5 shrink-0 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {item}
                    </li>
                  )
                )}
              </ul>
              <Link
                to="/signup"
                className="mt-8 block rounded-lg border border-navy/20 py-3 text-center text-sm font-bold text-navy transition hover:bg-navy/5"
              >
                Get started
              </Link>
            </div>
            {/* Premium */}
            <div className="relative rounded-2xl border-2 border-brandyellow bg-navy p-8 shadow-xl">
              <span className="absolute -top-3 right-6 rounded-full bg-brandyellow px-3 py-1 text-xs font-bold text-navy">
                POPULAR
              </span>
              <h3 className="text-lg font-bold text-white">Premium</h3>
              <p className="mt-1 text-sm text-white/60">Full protection for you and your family</p>
              <p className="mt-6">
                <span className="text-4xl font-extrabold text-brandyellow">$9.99</span>
                <span className="text-sm text-white/50">/month</span>
              </p>
              <p className="mt-1 text-xs text-white/40">or $99/year (save 17%)</p>
              <ul className="mt-8 space-y-3 text-sm text-white/80">
                {[
                  "Unlimited assessments",
                  "All broker removal links",
                  "Score history & trends",
                  "Family email monitoring",
                  "Priority support",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <svg className="h-5 w-5 shrink-0 text-brandyellow" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                to="/pricing"
                className="mt-8 block rounded-lg bg-brandyellow py-3 text-center text-sm font-bold text-navy shadow-lg shadow-brandyellow/20 transition hover:brightness-110"
              >
                Upgrade now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────── */}
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
                {/* Stars */}
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

      {/* ── FAQ ───────────────────────────────────────── */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-3xl">
          <p className="text-center text-sm font-semibold uppercase tracking-widest text-brandyellow">FAQ</p>
          <h2 className="mt-3 text-center text-3xl font-bold text-navy md:text-4xl">
            Frequently asked questions
          </h2>
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

      {/* ── FINAL CTA ─────────────────────────────────── */}
      <section className="bg-navy px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-white md:text-4xl">Ready to see your exposure?</h2>
          <p className="mt-4 text-lg text-white/60">
            Join thousands of users who have taken control of their digital security.
          </p>
          <Link
            to="/signup"
            className="mt-8 inline-block rounded-lg bg-brandyellow px-10 py-4 text-sm font-bold text-navy shadow-lg shadow-brandyellow/20 transition hover:brightness-110 focus-visible:ring-2 focus-visible:ring-brandyellow"
          >
            Get started free — takes 30 seconds
          </Link>
        </div>
      </section>
    </div>
  );
}
