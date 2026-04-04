import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { resendVerification } from "../lib/api";

const inputDark =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 transition-all duration-300 focus:border-brandyellow/50 focus:outline-none focus:ring-1 focus:ring-brandyellow/25 focus:shadow-[0_0_0_3px_rgba(255,215,0,0.1)]";

export default function LoginPage() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";
  const { register, handleSubmit, formState, getValues } = useForm();
  const [resendBusy, setResendBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(values) {
    try {
      await login(values.email, values.password);
      navigate(from, { replace: true });
    } catch (e) {
      const msg = e.response?.data?.message || "Login failed";
      showToast(msg, "error");
      if (e.response?.status === 403 && msg.toLowerCase().includes("verify")) {
        /* surface resend below */
      }
    }
  }

  async function handleResend() {
    const email = getValues("email");
    if (!email) {
      showToast("Enter your email first", "error");
      return;
    }
    setResendBusy(true);
    try {
      await resendVerification({ email });
      showToast("If an unverified account exists, we sent a verification email.", "success");
    } catch {
      showToast("Could not resend", "error");
    } finally {
      setResendBusy(false);
    }
  }

  return (
    <div className="animate-fade-in relative min-h-[calc(100vh-73px)] overflow-hidden bg-navy px-4 py-12">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute left-1/4 top-20 h-72 w-72 rounded-full bg-brandyellow/20 blur-3xl" />
        <div className="absolute bottom-20 right-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-md animate-fade-in">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
          <div className="mb-6 flex justify-center">
            <span
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brandyellow/15 text-brandyellow"
              aria-hidden
            >
              <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                />
              </svg>
            </span>
          </div>
          <h1 className="text-center text-3xl font-bold text-white">Welcome back</h1>
          <p className="mb-8 text-center text-white/60">Sign in to your account</p>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-white/70">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className={inputDark}
                {...register("email", { required: true })}
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-white/70">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className={`${inputDark} pr-11`}
                  {...register("password", { required: true })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 transition-colors hover:text-gray-300"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-end">
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-brandyellow transition-all duration-300 hover:brightness-110"
              >
                Forgot password?
              </Link>
            </div>
            {formState.errors.root && (
              <p className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                {formState.errors.root.message}
              </p>
            )}
            <button
              type="submit"
              className="w-full rounded-full bg-brandyellow py-4 text-sm font-semibold text-navy shadow-lg shadow-yellow-500/25 transition-all duration-300 hover:brightness-110 active:scale-[0.98]"
            >
              Log in
            </button>
          </form>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-micro text-gray-500">
            <span className="flex items-center gap-1">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
              AES-256 encrypted
            </span>
            <span aria-hidden>•</span>
            <span className="flex items-center gap-1">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                />
              </svg>
              SOC 2 compliant
            </span>
          </div>

          <p className="mt-4 text-center">
            <button
              type="button"
              onClick={handleResend}
              disabled={resendBusy}
              className="rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white/80 transition-all duration-300 hover:bg-white/10 disabled:opacity-50"
            >
              {resendBusy ? "Sending…" : "Resend verification email"}
            </button>
          </p>

          <div className="relative my-6 border-t border-white/10">
            <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 bg-navy/80 px-3 text-xs text-white/50">
              or
            </span>
          </div>

          <p className="text-center text-sm text-white/60">
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              className="font-semibold text-brandyellow transition-all duration-300 hover:brightness-110"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
