import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  addFamilyEmail,
  changePassword,
  deleteAccount,
  deleteFamilyEmail,
  getProfile,
  getSubscription,
  getUserAssessments,
  listFamilyEmails,
  updateProfile,
  verifyFamilyEmail,
} from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const pwdRules = {
  minLength: { value: 12, message: "At least 12 characters" },
  validate: (v) =>
    /[a-z]/.test(v) &&
    /[A-Z]/.test(v) &&
    /[0-9]/.test(v) &&
    /[^A-Za-z0-9]/.test(v)
      ? true
      : "Include upper, lower, number, and special character",
};

export default function AccountPage() {
  const { logout, refreshUser } = useAuth();
  const { showToast } = useToast();
  const { register, handleSubmit, reset } = useForm();
  const pwForm = useForm();
  const [profile, setProfile] = useState(null);
  const [sub, setSub] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [showDelete, setShowDelete] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [familyEmails, setFamilyEmails] = useState([]);
  const [familyEmailInput, setFamilyEmailInput] = useState("");
  const [verifyForId, setVerifyForId] = useState(null);
  const [verifyCode, setVerifyCode] = useState("");

  async function load() {
    const [p, s, a] = await Promise.all([
      getProfile(),
      getSubscription(),
      getUserAssessments(),
    ]);
    setProfile(p.data.user);
    setSub(s.data.data);
    setAssessments(a.data.data || []);
    if (s.data.data?.tier === "premium") {
      try {
        const fe = await listFamilyEmails();
        setFamilyEmails(fe.data.data || []);
      } catch {
        setFamilyEmails([]);
      }
    }
    reset({
      firstName: p.data.user.firstName || "",
      lastName: p.data.user.lastName || "",
      phone: p.data.user.phone || "",
      dob: p.data.user.dob ? p.data.user.dob.slice(0, 10) : "",
    });
  }

  useEffect(() => {
    load().catch(() => showToast("Could not load profile", "error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial load only
  }, []);

  async function onSaveProfile(values) {
    try {
      await updateProfile({
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone || undefined,
        dob: values.dob || undefined,
      });
      await refreshUser();
      await load();
      showToast("Profile saved", "success");
    } catch (e) {
      showToast(e.response?.data?.message || "Save failed", "error");
    }
  }

  async function onChangePassword(values) {
    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      pwForm.reset();
      showToast("Password updated", "success");
    } catch (e) {
      showToast(e.response?.data?.message || "Password change failed", "error");
    }
  }

  async function confirmDelete() {
    try {
      await deleteAccount({ password: deletePassword });
      await logout();
      window.location.href = "/";
    } catch (e) {
      showToast(e.response?.data?.message || "Could not delete account", "error");
    }
  }

  if (!profile) {
    return <p className="p-8 text-center text-brandgray">Loading…</p>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-navy">Account</h1>

      <section className="mt-8 rounded border border-navy/10 p-6">
        <h2 className="font-semibold text-navy">Profile</h2>
        <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(onSaveProfile)}>
          <div>
            <label htmlFor="firstName" className="text-sm font-medium text-navy">
              First name
            </label>
            <input
              id="firstName"
              className="mt-1 w-full rounded border border-navy/20 px-3 py-2"
              {...register("firstName")}
            />
          </div>
          <div>
            <label htmlFor="lastName" className="text-sm font-medium text-navy">
              Last name
            </label>
            <input
              id="lastName"
              className="mt-1 w-full rounded border border-navy/20 px-3 py-2"
              {...register("lastName")}
            />
          </div>
          <div>
            <label htmlFor="phone" className="text-sm font-medium text-navy">
              Phone (optional)
            </label>
            <input
              id="phone"
              className="mt-1 w-full rounded border border-navy/20 px-3 py-2"
              {...register("phone")}
            />
          </div>
          <div>
            <label htmlFor="dob" className="text-sm font-medium text-navy">
              Date of birth (optional)
            </label>
            <input id="dob" type="date" className="mt-1 w-full rounded border border-navy/20 px-3 py-2" {...register("dob")} />
          </div>
          <div className="md:col-span-2">
            <button type="submit" className="rounded bg-navy px-4 py-2 font-semibold text-white">
              Save profile
            </button>
          </div>
        </form>
      </section>

      <section className="mt-8 rounded border border-navy/10 p-6">
        <h2 className="font-semibold text-navy">Change password</h2>
        <form
          className="mt-4 space-y-4"
          onSubmit={pwForm.handleSubmit(onChangePassword)}
        >
          <div>
            <label htmlFor="currentPassword" className="text-sm font-medium text-navy">
              Current password
            </label>
            <input
              id="currentPassword"
              type="password"
              className="mt-1 w-full rounded border border-navy/20 px-3 py-2"
              {...pwForm.register("currentPassword", { required: true })}
            />
          </div>
          <div>
            <label htmlFor="newPassword" className="text-sm font-medium text-navy">
              New password
            </label>
            <input
              id="newPassword"
              type="password"
              className="mt-1 w-full rounded border border-navy/20 px-3 py-2"
              {...pwForm.register("newPassword", pwdRules)}
            />
          </div>
          <button type="submit" className="rounded bg-navy px-4 py-2 font-semibold text-white">
            Update password
          </button>
        </form>
      </section>

      {sub?.tier === "premium" && (
        <section className="mt-8 rounded border border-navy/10 p-6">
          <h2 className="font-semibold text-navy">Family emails</h2>
          <p className="mt-1 text-sm text-brandgray">
            Add up to 5 verified emails (household) to run assessments for them. We&apos;ll send a 6-digit
            code to each address.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <input
              type="email"
              placeholder="email@example.com"
              className="min-w-[200px] flex-1 rounded border border-navy/20 px-3 py-2"
              value={familyEmailInput}
              onChange={(e) => setFamilyEmailInput(e.target.value)}
            />
            <button
              type="button"
              className="rounded bg-navy px-4 py-2 font-semibold text-white"
              onClick={async () => {
                try {
                  await addFamilyEmail({ email: familyEmailInput });
                  setFamilyEmailInput("");
                  const fe = await listFamilyEmails();
                  setFamilyEmails(fe.data.data || []);
                  showToast("Verification code sent", "success");
                } catch (e) {
                  showToast(e.response?.data?.message || "Could not add email", "error");
                }
              }}
            >
              Add &amp; send code
            </button>
          </div>
          <ul className="mt-4 space-y-3">
            {familyEmails.map((row) => (
              <li
                key={row.id}
                className="flex flex-wrap items-center justify-between gap-2 border-t border-navy/10 pt-3 first:border-t-0 first:pt-0"
              >
                <span className="text-navy">{row.email}</span>
                {row.verified ? (
                  <span className="text-sm text-green-700">Verified</span>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="6-digit code"
                      className="w-28 rounded border border-navy/20 px-2 py-1 text-sm"
                      value={verifyForId === row.id ? verifyCode : ""}
                      onChange={(e) => {
                        setVerifyForId(row.id);
                        setVerifyCode(e.target.value);
                      }}
                    />
                    <button
                      type="button"
                      className="text-sm font-semibold text-navy underline"
                      onClick={async () => {
                        try {
                          await verifyFamilyEmail(row.id, { code: verifyCode });
                          setVerifyCode("");
                          setVerifyForId(null);
                          const fe = await listFamilyEmails();
                          setFamilyEmails(fe.data.data || []);
                          showToast("Email verified", "success");
                        } catch (e) {
                          showToast(e.response?.data?.message || "Invalid code", "error");
                        }
                      }}
                    >
                      Verify
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  className="text-sm text-red-700 underline"
                  onClick={async () => {
                    try {
                      await deleteFamilyEmail(row.id);
                      setFamilyEmails((prev) => prev.filter((x) => x.id !== row.id));
                      showToast("Removed", "success");
                    } catch {
                      showToast("Could not remove", "error");
                    }
                  }}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-8 rounded border border-navy/10 p-6">
        <h2 className="font-semibold text-navy">Subscription</h2>
        <p className="mt-2 text-brandgray capitalize">
          Current plan: <strong className="text-navy">{sub?.tier || "free"}</strong>
        </p>
        <p className="mt-2 text-sm text-brandgray">
          Manage billing in the Stripe customer portal from your email after checkout, or upgrade from
          pricing.
        </p>
        <Link to="/pricing" className="mt-4 inline-block font-semibold text-navy underline">
          {sub?.tier === "premium" ? "View pricing" : "Upgrade to Premium"}
        </Link>
      </section>

      <section className="mt-8 rounded border border-navy/10 p-6">
        <h2 className="font-semibold text-navy">Past assessments</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {assessments.map((a) => (
            <li key={a.id}>
              <Link to={`/assessment?resume=${a.id}`} className="text-navy underline">
                {a.emailSearched}
              </Link>{" "}
              — score {a.score} ({a.riskLevel})
            </li>
          ))}
          {!assessments.length && <li className="text-brandgray">None yet.</li>}
        </ul>
      </section>

      <section className="mt-8 rounded border border-red-200 bg-red-50 p-6">
        <h2 className="font-semibold text-red-900">Delete account</h2>
        <p className="mt-2 text-sm text-red-800">
          Permanently delete your account and associated assessments (GDPR).
        </p>
        <button
          type="button"
          className="mt-4 rounded border border-red-700 px-4 py-2 font-semibold text-red-900"
          onClick={() => {
            setDeletePassword("");
            setShowDelete(true);
          }}
        >
          Delete my account
        </button>
      </section>

      {showDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-title"
        >
          <div className="max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 id="delete-title" className="text-lg font-semibold text-navy">
              Confirm deletion
            </h3>
            <p className="mt-2 text-sm text-brandgray">
              This cannot be undone. Your subscription will be canceled if active.
            </p>
            <div className="mt-4">
              <label htmlFor="delete-password" className="block text-sm font-medium text-navy">
                Confirm with your password
              </label>
              <input
                id="delete-password"
                type="password"
                autoComplete="current-password"
                className="mt-1 w-full rounded border border-navy/20 px-3 py-2"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
              />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="rounded border border-navy/20 px-4 py-2 text-navy"
                onClick={() => {
                  setShowDelete(false);
                  setDeletePassword("");
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded bg-red-600 px-4 py-2 font-semibold text-white"
                onClick={confirmDelete}
              >
                Delete permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
