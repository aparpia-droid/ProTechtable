import { useState } from "react";
import { useForm } from "react-hook-form";
import { forgotPassword } from "../lib/api";

export default function ForgotPasswordPage() {
  const { register, handleSubmit } = useForm();
  const [done, setDone] = useState(false);

  async function onSubmit(values) {
    try {
      await forgotPassword({ email: values.email });
    } catch {
      /* same UX: do not leak existence */
    }
    setDone(true);
  }

  return (
    <div className="min-h-[calc(100vh-73px)] bg-white">
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold text-navy">Forgot password</h1>
      {done ? (
        <p className="mt-4 text-brandgray">
          If an account exists for that email, we sent reset instructions.
        </p>
      ) : (
        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-navy">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="mt-1 w-full rounded border border-navy/20 px-3 py-2"
              {...register("email", { required: true })}
            />
          </div>
          <button type="submit" className="w-full rounded bg-brandyellow py-3 font-semibold text-navy">
            Send reset link
          </button>
        </form>
      )}
    </div>
    </div>
  );
}
