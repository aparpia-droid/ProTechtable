import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { resetPassword } from "../lib/api";
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

export default function ResetPasswordPage() {
  const { token } = useParams();
  const { register, handleSubmit, watch, formState } = useForm();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const pw = watch("password");

  async function onSubmit(values) {
    try {
      await resetPassword({ token, password: values.password });
      showToast("Password updated. You can log in.", "success");
      navigate("/login");
    } catch (e) {
      showToast(e.response?.data?.message || "Reset failed", "error");
    }
  }

  return (
    <div className="min-h-[calc(100vh-73px)] bg-white">
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold text-navy">Reset password</h1>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-navy">
            New password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            className="mt-1 w-full rounded border border-navy/20 px-3 py-2"
            {...register("password", pwdRules)}
          />
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
        <button type="submit" className="w-full rounded bg-brandyellow py-3 font-semibold text-navy">
          Update password
        </button>
      </form>
    </div>
    </div>
  );
}
