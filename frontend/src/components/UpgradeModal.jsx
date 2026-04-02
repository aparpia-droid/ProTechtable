import { Link } from "react-router-dom";

export default function UpgradeModal({ onClose, lastScore, lastDate }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Upgrade to Premium"
    >
      <div className="mx-4 w-full max-w-md rounded-2xl border border-white/10 bg-navy/95 shadow-2xl backdrop-blur-xl">
        <div className="rounded-t-2xl border-b border-white/10 bg-navy p-6 text-center text-white">
          <h2 className="text-2xl font-bold">Time to level up</h2>
          <p className="mt-2 text-white/70">Your exposure may have changed since your last scan</p>
        </div>
        <div className="p-6">
          {lastScore !== undefined && (
            <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur">
              <p className="text-sm text-white/50">Your last score</p>
              <p className="text-3xl font-bold text-brandyellow">{lastScore}/100</p>
              {lastDate && <p className="mt-1 text-xs text-white/50">{lastDate}</p>}
            </div>
          )}
          <h3 className="font-semibold text-white">Premium includes:</h3>
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-brandyellow">&#10003;</span>
              <span>Unlimited vulnerability scans</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-brandyellow">&#10003;</span>
              <span>All 20 data broker removal links</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-brandyellow">&#10003;</span>
              <span>Score history and trend tracking</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-brandyellow">&#10003;</span>
              <span>Priority email support</span>
            </li>
          </ul>
          <div className="mt-6 space-y-3">
            <Link
              to="/pricing"
              className="block w-full rounded-full bg-brandyellow py-3 text-center font-bold text-navy shadow-lg shadow-yellow-500/25 transition-all duration-300 hover:brightness-110 focus-visible:ring-2 focus-visible:ring-brandyellow"
            >
              Upgrade — Starting at $9.99/mo
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="block w-full rounded-full border border-white/20 py-3 text-center text-sm text-white/70 transition-all duration-300 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
