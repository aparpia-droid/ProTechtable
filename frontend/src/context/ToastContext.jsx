import { createContext, useCallback, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, variant = "info") => {
    setToast({ message, variant, id: Date.now() });
    window.setTimeout(() => setToast(null), 5000);
  }, []);

  const value = useMemo(() => ({ showToast, toast }), [showToast, toast]);

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}
