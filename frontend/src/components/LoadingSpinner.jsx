export default function LoadingSpinner({ label = "Loading" }) {
  return (
    <div className="flex flex-col items-center gap-2" role="status" aria-live="polite">
      <span
        className="h-10 w-10 animate-spin rounded-full border-2 border-navy border-t-transparent"
        aria-hidden
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
