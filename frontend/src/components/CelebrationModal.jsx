export default function CelebrationModal({ oldScore, newScore, onClose }) {
  const improvement = oldScore - newScore;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative mx-4 w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-navy/95 p-8 text-center shadow-2xl backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brandyellow/10 via-transparent to-green-500/10" aria-hidden />
        <div className="relative">
          <div className="mb-4 text-5xl drop-shadow-[0_0_12px_rgba(255,215,0,0.5)]">🛡️</div>
          <h2 className="text-2xl font-bold text-white">Score improved!</h2>
          <div className="mt-4 flex items-center justify-center gap-4">
            <div>
              <p className="text-sm text-white/50">Before</p>
              <p className="text-3xl font-bold text-red-400">{oldScore}</p>
            </div>
            <div className="text-2xl text-brandyellow">→</div>
            <div>
              <p className="text-sm text-white/50">After</p>
              <p className="text-3xl font-bold text-green-400">{newScore}</p>
            </div>
          </div>
          <p className="mt-4 text-white/70">
            You reduced your digital exposure by{" "}
            <strong className="text-brandyellow">{improvement} points</strong>. Nice work.
          </p>
          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={() => {
                const text = `I just reduced my digital exposure score by ${improvement} points using ProTechtable. Check yours: ${window.location.origin}`;
                if (navigator.share) {
                  navigator.share({ title: "ProTechtable", text });
                } else {
                  navigator.clipboard.writeText(text);
                  // eslint-disable-next-line no-alert
                  alert("Copied to clipboard!");
                }
              }}
              className="w-full rounded-full bg-brandyellow py-3 font-semibold text-navy shadow-lg shadow-yellow-500/25 transition-all duration-300 hover:brightness-110 focus-visible:ring-2 focus-visible:ring-brandyellow"
            >
              Share your progress
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-full border border-white/20 py-3 text-sm text-white/70 transition-all duration-300 hover:bg-white/10"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
