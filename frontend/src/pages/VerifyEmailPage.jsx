import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { verifyEmail } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token.");
      return;
    }
    verifyEmail(token)
      .then(async (res) => {
        setMessage(res.data.message || "Email verified");
        if (res.data.autoLogin) {
          await refreshUser();
          navigate("/dashboard", { replace: true });
          return;
        }
        setStatus("ok");
      })
      .catch(() => {
        setStatus("error");
        setMessage("Verification failed or link expired.");
      });
  }, [token, refreshUser, navigate]);

  return (
    <div className="relative min-h-[calc(100vh-73px)] overflow-hidden bg-navy px-4 py-12">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute left-1/4 top-20 h-72 w-72 rounded-full bg-brandyellow/20 blur-3xl" />
        <div className="absolute bottom-20 right-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-md">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl backdrop-blur">
          {status === "loading" && (
            <>
              <div className="mx-auto flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-brandyellow/15 text-brandyellow">
                <svg className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                  />
                </svg>
              </div>
              <h1 className="mt-6 text-xl font-bold text-white">Verifying your email…</h1>
              <p className="mt-2 text-sm text-white/60">Please wait a moment.</p>
            </>
          )}

          {status === "ok" && (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 text-green-400">
                <svg className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="mt-6 text-2xl font-bold text-white">Email verified!</h1>
              <p className="mt-2 text-white/60">Your account is ready.</p>
              <p className="mt-2 text-sm text-white/50">{message}</p>
              <Link
                to="/login"
                className="mt-8 inline-block rounded-full bg-brandyellow px-10 py-4 text-sm font-bold text-navy shadow-lg shadow-yellow-500/25 transition-all duration-300 hover:brightness-110"
              >
                Continue to login
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20 text-red-400">
                <svg className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="mt-6 text-2xl font-bold text-white">Verification failed</h1>
              <p className="mt-3 text-white/60">{message}</p>
              <Link
                to="/login"
                className="mt-8 inline-block rounded-full border border-white/20 px-8 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/10"
              >
                Back to login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
