import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { verifyEmail } from "../lib/api";

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token.");
      return;
    }
    verifyEmail(token)
      .then((res) => {
        setStatus("ok");
        setMessage(res.data.message || "Email verified");
      })
      .catch(() => {
        setStatus("error");
        setMessage("Verification failed or link expired.");
      });
  }, [token]);

  return (
    <div className="mx-auto max-w-md px-4 py-12 text-center">
      <h1 className="text-2xl font-bold text-navy">Email verification</h1>
      {status === "loading" && <p className="mt-4 text-brandgray">Verifying…</p>}
      {status !== "loading" && (
        <p className={`mt-4 ${status === "ok" ? "text-green-800" : "text-red-700"}`}>{message}</p>
      )}
      <Link to="/login" className="mt-6 inline-block font-semibold text-navy">
        Go to login
      </Link>
    </div>
  );
}
