import { Link } from "react-router-dom";

export default function UpgradeModal({ onClose, lastScore, lastDate }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-label="Upgrade to Premium"
    >
      <div className="mx-4 w-full max-w-md rounded-xl bg-white shadow-2xl">
        <div className="rounded-t-xl bg-navy p-6 text-center text-white">
          <h2 className="text-2xl font-bold">Time to Level Up</h2>
          <p className="mt-2 text-white/80">Your exposure may have changed since your last scan</p>
        </div>
        <div className="p-6">
          {lastScore !== undefined && (
            <div className="mb-4 rounded-lg bg-gray-50 p-4 text-center">
              <p className="text-sm text-brandgray">Your last score</p>
              <p className="text-3xl font-bold text-navy">{lastScore}/100</p>
              {lastDate && <p className="mt-1 text-xs text-brandgray">{lastDate}</p>}
            </div>
          )}
          <h3 className="font-semibold text-navy">Premium includes:</h3>
          <ul className="mt-2 space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-green-500">&#10003;</span>
              <span>Unlimited vulnerability scans</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-green-500">&#10003;</span>
              <span>All 20 data broker removal links</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-green-500">&#10003;</span>
              <span>Score history and trend tracking</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-green-500">&#10003;</span>
              <span>Priority email support</span>
            </li>
          </ul>
          <div className="mt-6 space-y-3">
            <Link
              to="/pricing"
              className="block w-full rounded-lg bg-brandyellow py-3 text-center font-bold text-navy hover:bg-yellow-400 focus-visible:ring-2 focus-visible:ring-navy"
            >
              Upgrade — Starting at $9.99/mo
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="block w-full rounded-lg border border-gray-200 py-3 text-center text-sm text-brandgray hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-navy"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
