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

export default function SignupPage() {
  const { register, handleSubmit, watch, formState } = useForm();
  const { showToast } = useToast();
  const pw = watch("password");
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [signedUpEmail, setSignedUpEmail] = useState("");
  const [resendBusy, setResendBusy] = useState(false);

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
      <div className="mx-auto max-w-md px-4 py-12">
        <h1 className="text-2xl font-bold text-navy">Almost there</h1>
        <p className="mt-4 text-brandgray">
          Account created! Check your email to verify your account, then log in.
        </p>
        <p className="mt-6">
          <Link to="/login" className="font-semibold text-navy underline">
            Log in
          </Link>
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            disabled={resendBusy}
            className="rounded border border-navy/20 px-4 py-2 text-sm font-medium text-navy disabled:opacity-50"
            onClick={handleResendVerification}
          >
            {resendBusy ? "Sending…" : "Resend verification email"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold text-navy">Create account</h1>
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
            {...register("email", { required: "Email is required" })}
            aria-invalid={formState.errors.email ? "true" : "false"}
          />
          {formState.errors.email && (
            <p className="mt-1 text-sm text-red-600">{formState.errors.email.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-navy">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            className="mt-1 w-full rounded border border-navy/20 px-3 py-2"
            {...register("password", pwdRules)}
            aria-invalid={formState.errors.password ? "true" : "false"}
            aria-describedby="password-hint"
          />
          <p id="password-hint" className="mt-1 text-xs text-brandgray">
            12+ characters with upper, lower, number, and special character.
          </p>
          {formState.errors.password && (
            <p className="mt-1 text-sm text-red-600">{formState.errors.password.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="confirm" className="block text-sm font-medium text-navy">
            Confirm password
          </label>
          <input
            id="confirm"
            type="password"
            className="mt-1 w-full rounded border border-navy/20 px-3 py-2"
            {...register("confirm", {
              validate: (v) => v === pw || "Passwords do not match",
            })}
          />
          {formState.errors.confirm && (
            <p className="mt-1 text-sm text-red-600">{formState.errors.confirm.message}</p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-navy">
              First name
            </label>
            <input
              id="firstName"
              className="mt-1 w-full rounded border border-navy/20 px-3 py-2"
              {...register("firstName")}
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-navy">
              Last name
            </label>
            <input
              id="lastName"
              className="mt-1 w-full rounded border border-navy/20 px-3 py-2"
              {...register("lastName")}
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full rounded bg-brandyellow py-3 font-semibold text-navy"
        >
          Sign up
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-brandgray">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-navy">
          Log in
        </Link>
      </p>
    </div>
  );
}
