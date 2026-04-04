import { useState } from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  const [subscribed, setSubscribed] = useState(false);

  function handleNewsletter(e) {
    e.preventDefault();
    setSubscribed(true);
  }

  return (
    <footer className="mt-auto bg-gradient-to-b from-navy to-[#001530] text-white">
      <div className="h-px bg-gradient-to-r from-transparent via-brandyellow/20 to-transparent" />
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-lg font-bold">ProTechtable</p>
            <p className="mt-3 text-sm leading-relaxed text-white/60">
              Understand your digital exposure and take action with clear scores and remediation steps.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-white/50">Product</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link to="/dashboard" className="text-white/60 transition-colors hover:text-white">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-white/60 transition-colors hover:text-white">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-white/60 transition-colors hover:text-white">
                  Privacy Guides
                </Link>
              </li>
              <li>
                <Link to="/assessment" className="text-white/60 transition-colors hover:text-white">
                  Assessment
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-white/50">Company</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <a href="#about" className="text-white/60 transition-colors hover:text-white">
                  About
                </a>
              </li>
              <li>
                <Link to="/privacy" className="text-white/60 transition-colors hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-white/60 transition-colors hover:text-white">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-white/50">Contact</p>
            <p className="mt-4 text-sm text-white/60">
              <a href="mailto:support@protechtable.com" className="transition-colors hover:text-white">
                support@protechtable.com
              </a>
            </p>
            {subscribed ? (
              <p className="mt-6 text-caption text-success">Thanks! We&apos;ll keep you updated.</p>
            ) : (
              <form className="mt-6" onSubmit={handleNewsletter}>
                <p className="text-xs font-medium text-white/50">Security newsletter</p>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                  <input
                    type="email"
                    name="newsletter"
                    required
                    placeholder="you@email.com"
                    className="w-full flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/40 backdrop-blur transition-all duration-300 focus:border-brandyellow/50 focus:outline-none focus:ring-1 focus:ring-brandyellow/25 focus:shadow-[0_0_0_3px_rgba(255,215,0,0.1)]"
                    aria-label="Email for newsletter"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-brandyellow px-5 py-2.5 text-sm font-semibold text-navy transition-all duration-300 hover:brightness-110 active:scale-[0.98]"
                  >
                    Join
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-6 text-center text-xs text-white/50">
        © {new Date().getFullYear()} ProTechtable. All rights reserved. · Made with care for your security
      </div>
    </footer>
  );
}
