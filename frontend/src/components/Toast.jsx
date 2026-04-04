import { useToast } from "../context/ToastContext";

const styles = {
  success: "bg-success-soft border border-success-muted text-success backdrop-blur-xl rounded-card",
  error: "bg-danger-soft border border-danger-muted text-danger backdrop-blur-xl rounded-card",
  info: "bg-info-soft border border-info-muted text-info backdrop-blur-xl rounded-card",
};

export default function Toast() {
  const { toast } = useToast();
  if (!toast) return null;
  const cls = styles[toast.variant] || styles.info;
  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-4 right-4 z-[60] max-w-sm px-4 py-3 shadow-2xl ${cls}`}
    >
      {toast.message}
    </div>
  );
}
