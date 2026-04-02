import { useToast } from "../context/ToastContext";

const styles = {
  success: "bg-white/10 text-green-300 border-green-500/30 backdrop-blur-xl",
  error: "bg-white/10 text-red-300 border-red-500/30 backdrop-blur-xl",
  info: "bg-navy/90 text-white/90 border-white/10 backdrop-blur-xl",
};

export default function Toast() {
  const { toast } = useToast();
  if (!toast) return null;
  const cls = styles[toast.variant] || styles.info;
  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-4 right-4 z-[60] max-w-sm rounded-2xl border px-4 py-3 shadow-2xl ${cls}`}
    >
      {toast.message}
    </div>
  );
}
