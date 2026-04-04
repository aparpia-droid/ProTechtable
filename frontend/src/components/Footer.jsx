import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-auto bg-gradient-to-b from-navy to-[#001530] text-white">
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
            <div className="mt-4 flex flex-wrap gap-3 text-sm text-white/50">
              <span aria-hidden>X</span>
              <span aria-hidden>in</span>
              <span aria-hidden>GH</span>
            </div>
            <form
              className="mt-6"
              onSubmit={(e) => {
                e.preventDefault();
              }}
            >
              <p className="text-xs font-medium text-white/50">Security newsletter</p>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <input
                  type="email"
                  name="newsletter"
                  placeholder="you@email.com"
                  className="w-full flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/40 backdrop-blur transition-all duration-300 focus:border-brandyellow/50 focus:outline-none focus:ring-1 focus:ring-brandyellow/25"
                  aria-label="Email for newsletter"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-brandyellow px-5 py-2.5 text-sm font-semibold text-navy transition-all duration-300 hover:brightness-110"
                >
                  Join
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-6 text-center text-xs text-white/50">
        © {new Date().getFullYear()} ProTechtable. All rights reserved. · Made with care for your security
      </div>
    </footer>
  );
}
