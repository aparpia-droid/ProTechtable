import { useToast } from "../context/ToastContext";

const styles = {
  success: "bg-green-50 text-green-900 border-green-200",
  error: "bg-red-50 text-red-900 border-red-200",
  info: "bg-navy/5 text-navy border-navy/10",
};

export default function Toast() {
  const { toast } = useToast();
  if (!toast) return null;
  const cls = styles[toast.variant] || styles.info;
  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-4 right-4 z-50 max-w-sm rounded border px-4 py-3 shadow-lg ${cls}`}
    >
      {toast.message}
    </div>
  );
}
