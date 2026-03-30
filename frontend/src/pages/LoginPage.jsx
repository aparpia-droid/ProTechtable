import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { resendVerification } from "../lib/api";

export default function LoginPage() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";
  const { register, handleSubmit, formState, getValues } = useForm();
  const [resendBusy, setResendBusy] = useState(false);

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
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold text-navy">Log in</h1>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-navy">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="mt-1 w-full rounded border border-navy/20 px-3 py-2"
            {...register("email", { required: true })}
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-navy">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className="mt-1 w-full rounded border border-navy/20 px-3 py-2"
            {...register("password", { required: true })}
          />
        </div>
        {formState.errors.root && (
          <p className="text-sm text-red-600">{formState.errors.root.message}</p>
        )}
        <button
          type="submit"
          className="w-full rounded bg-brandyellow py-3 font-semibold text-navy"
        >
          Log in
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-brandgray">
        <button
          type="button"
          onClick={handleResend}
          disabled={resendBusy}
          className="text-navy underline disabled:opacity-50"
        >
          Resend verification email
        </button>
      </p>
      <p className="mt-2 text-center text-sm text-brandgray">
        <Link to="/forgot-password" className="text-navy">
          Forgot password?
        </Link>
      </p>
      <p className="mt-2 text-center text-sm text-brandgray">
        No account?{" "}
        <Link to="/signup" className="font-semibold text-navy">
          Sign up
        </Link>
      </p>
    </div>
  );
}
