export default function CelebrationModal({ oldScore, newScore, onClose }) {
  const improvement = oldScore - newScore;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" role="dialog" aria-modal="true">
      <div className="mx-4 w-full max-w-sm rounded-xl bg-white p-8 text-center shadow-2xl">
        <div className="mb-4 text-5xl">🛡️</div>
        <h2 className="text-2xl font-bold text-navy">Score Improved!</h2>
        <div className="mt-4 flex items-center justify-center gap-4">
          <div>
            <p className="text-sm text-brandgray">Before</p>
            <p className="text-3xl font-bold text-red-500">{oldScore}</p>
          </div>
          <div className="text-2xl text-green-500">→</div>
          <div>
            <p className="text-sm text-brandgray">After</p>
            <p className="text-3xl font-bold text-green-500">{newScore}</p>
          </div>
        </div>
        <p className="mt-4 text-brandgray">
          You reduced your digital exposure by <strong className="text-navy">{improvement} points</strong>.
          Nice work.
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
            className="w-full rounded-lg bg-navy py-3 font-semibold text-white hover:bg-navy/90 focus-visible:ring-2 focus-visible:ring-navy"
          >
            Share Your Progress
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg border border-gray-200 py-3 text-sm text-brandgray hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
