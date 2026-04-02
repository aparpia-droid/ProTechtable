import { Link } from "react-router-dom";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { resendVerification, signup } from "../lib/api";
import { useToast } from "../context/ToastContext";

const pwdRules = {
  required: "Password is required",
  minLength: { value: 12, message: "At least 12 characters" },
  validate: (v) =>
    /[a-z]/.test(v) &&
    /[A-Z]/.test(v) &&
    /[0-9]/.test(v) &&
    /[^A-Za-z0-9]/.test(v)
      ? true
      : "Include upper, lower, number, and special character",
};

const inputDark =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 transition-all duration-300 focus:border-brandyellow/50 focus:outline-none focus:ring-1 focus:ring-brandyellow/25";

function ReqRow({ met, label }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {met ? (
        <svg className="h-4 w-4 shrink-0 text-green-400" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        <span className="h-4 w-4 shrink-0 rounded-full border border-white/40" aria-hidden />
      )}
      <span className={met ? "text-green-400" : "text-white/50"}>{label}</span>
    </div>
  );
}

export default function SignupPage() {
  const { register, handleSubmit, watch, formState } = useForm();
  const { showToast } = useToast();
  const pw = watch("password") || "";
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [signedUpEmail, setSignedUpEmail] = useState("");
  const [resendBusy, setResendBusy] = useState(false);

  const hasLen = pw.length >= 12;
  const hasLower = /[a-z]/.test(pw);
  const hasUpper = /[A-Z]/.test(pw);
  const hasNum = /[0-9]/.test(pw);
  const hasSpec = /[^A-Za-z0-9]/.test(pw);

  async function onSubmit(values) {
    try {
      await signup({
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
      });
      setSignedUpEmail(values.email);
      setSignupSuccess(true);
      showToast("Check your email to verify your account.", "success");
    } catch (e) {
      showToast(e.response?.data?.message || "Signup failed", "error");
    }
  }

  async function handleResendVerification() {
    if (!signedUpEmail) return;
    setResendBusy(true);
    try {
      await resendVerification({ email: signedUpEmail });
      showToast("If an unverified account exists, a verification email has been sent.", "success");
    } catch (e) {
      showToast(e.response?.data?.message || "Could not resend", "error");
    } finally {
      setResendBusy(false);
    }
  }

  if (signupSuccess) {
    return (
      <div className="relative min-h-[calc(100vh-73px)] overflow-hidden bg-navy px-4 py-12">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute left-1/4 top-20 h-72 w-72 rounded-full bg-brandyellow/20 blur-3xl" />
          <div className="absolute bottom-20 right-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
        </div>
        <div className="relative mx-auto w-full max-w-md">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl backdrop-blur">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 text-green-400">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="mt-6 text-2xl font-bold text-white">Check your email</h1>
            <p className="mt-3 text-white/60">
              Account created! Check your email to verify your account, then log in.
            </p>
            <Link
              to="/login"
              className="mt-8 inline-block rounded-full bg-brandyellow px-8 py-3 text-sm font-semibold text-navy shadow-lg shadow-yellow-500/25 transition-all duration-300 hover:brightness-110"
            >
              Log in
            </Link>
            <div className="mt-6">
              <button
                type="button"
                disabled={resendBusy}
                className="rounded-full border border-white/20 px-6 py-2.5 text-sm font-medium text-white/80 transition-all duration-300 hover:bg-white/10 disabled:opacity-50"
                onClick={handleResendVerification}
              >
                {resendBusy ? "Sending…" : "Resend verification email"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-73px)] overflow-hidden bg-navy px-4 py-12">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute left-1/4 top-20 h-72 w-72 rounded-full bg-brandyellow/20 blur-3xl" />
        <div className="absolute bottom-20 right-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-md animate-fade-in">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur">
          <h1 className="text-center text-3xl font-bold text-white">Create your account</h1>
          <p className="mb-8 text-center text-white/60">Start protecting your digital identity</p>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="mb-1.5 block text-sm font-medium text-white/70">
                  First name
                </label>
                <input id="firstName" className={inputDark} {...register("firstName")} />
              </div>
              <div>
                <label htmlFor="lastName" className="mb-1.5 block text-sm font-medium text-white/70">
                  Last name
                </label>
                <input id="lastName" className={inputDark} {...register("lastName")} />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-white/70">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className={inputDark}
                {...register("email", { required: "Email is required" })}
                aria-invalid={formState.errors.email ? "true" : "false"}
              />
              {formState.errors.email && (
                <p className="mt-1 text-sm text-red-400">{formState.errors.email.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-white/70">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                className={inputDark}
                {...register("password", pwdRules)}
                aria-invalid={formState.errors.password ? "true" : "false"}
                aria-describedby="password-hint"
              />
              <div id="password-hint" className="mt-3 space-y-1.5 rounded-xl border border-white/5 bg-white/[0.03] p-3">
                <ReqRow met={hasLen} label="At least 12 characters" />
                <ReqRow met={hasLower} label="One lowercase letter" />
                <ReqRow met={hasUpper} label="One uppercase letter" />
                <ReqRow met={hasNum} label="One number" />
                <ReqRow met={hasSpec} label="One special character" />
              </div>
              {formState.errors.password && (
                <p className="mt-1 text-sm text-red-400">{formState.errors.password.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="confirm" className="mb-1.5 block text-sm font-medium text-white/70">
                Confirm password
              </label>
              <input
                id="confirm"
                type="password"
                className={inputDark}
                {...register("confirm", {
                  validate: (v) => v === pw || "Passwords do not match",
                })}
              />
              {formState.errors.confirm && (
                <p className="mt-1 text-sm text-red-400">{formState.errors.confirm.message}</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full rounded-full bg-brandyellow py-4 text-sm font-semibold text-navy shadow-lg shadow-yellow-500/25 transition-all duration-300 hover:brightness-110"
            >
              Sign up
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-white/60">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-brandyellow transition-all duration-300 hover:brightness-110"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
