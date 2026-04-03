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
  toggleMonitoring,
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

const inputDark =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 transition-all duration-300 focus:border-brandyellow/50 focus:outline-none focus:ring-1 focus:ring-brandyellow/25";

const tabs = [
  { id: "profile", label: "Profile" },
  { id: "security", label: "Security" },
  { id: "subscription", label: "Subscription" },
  { id: "monitoring", label: "Monitoring" },
  { id: "family", label: "Family emails" },
  { id: "scans", label: "Past scans" },
];

export default function AccountPage() {
  const { logout, refreshUser } = useAuth();
  const [monitoringBusy, setMonitoringBusy] = useState(false);
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
  const [activeTab, setActiveTab] = useState("profile");

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
    return (
      <div className="flex min-h-[40vh] items-center justify-center bg-[#0a1628] p-8 text-center text-white/60">
        Loading…
      </div>
    );
  }

  const newPw = pwForm.watch("newPassword") || "";

  return (
    <div className="min-h-screen bg-[#0a1628] px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-white">Account settings</h1>
        <p className="mt-1 text-white/50">Manage your profile, security, and subscription</p>

        <div className="mt-8 flex flex-wrap gap-2 rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                activeTab === t.id ? "bg-brandyellow text-navy" : "text-white/70 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === "profile" && (
          <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur">
            <h2 className="text-lg font-semibold text-white">Profile</h2>
            <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3">
              <p className="text-xs font-medium text-white/50">Email</p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="text-white">{profile.email}</span>
                {profile.emailVerified ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-xs text-green-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400" aria-hidden />
                    Verified
                  </span>
                ) : (
                  <span className="rounded-full bg-yellow-500/10 px-2 py-0.5 text-xs text-yellow-400">
                    Unverified
                  </span>
                )}
              </div>
            </div>
            <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(onSaveProfile)}>
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
              <div>
                <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-white/70">
                  Phone (optional)
                </label>
                <input id="phone" className={inputDark} {...register("phone")} />
              </div>
              <div>
                <label htmlFor="dob" className="mb-1.5 block text-sm font-medium text-white/70">
                  Date of birth (optional)
                </label>
                <input id="dob" type="date" className={inputDark} {...register("dob")} />
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="rounded-full bg-brandyellow px-8 py-3 font-semibold text-navy shadow-lg shadow-yellow-500/25 transition-all duration-300 hover:brightness-110"
                >
                  Save profile
                </button>
              </div>
            </form>
          </section>
        )}

        {activeTab === "security" && (
          <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur">
            <h2 className="text-lg font-semibold text-white">Change password</h2>
            <form className="mt-6 space-y-4" onSubmit={pwForm.handleSubmit(onChangePassword)}>
              <div>
                <label htmlFor="currentPassword" className="mb-1.5 block text-sm font-medium text-white/70">
                  Current password
                </label>
                <input
                  id="currentPassword"
                  type="password"
                  className={inputDark}
                  {...pwForm.register("currentPassword", { required: true })}
                />
              </div>
              <div>
                <label htmlFor="newPassword" className="mb-1.5 block text-sm font-medium text-white/70">
                  New password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  className={inputDark}
                  {...pwForm.register("newPassword", pwdRules)}
                />
                <p className="mt-2 text-xs text-white/40">
                  Strength:{" "}
                  {newPw.length >= 12 && /[a-z]/.test(newPw) && /[A-Z]/.test(newPw) && /[0-9]/.test(newPw) && /[^A-Za-z0-9]/.test(newPw)
                    ? "Strong"
                    : newPw.length >= 8
                      ? "Medium"
                      : "Enter a stronger password"}
                </p>
              </div>
              <button
                type="submit"
                className="rounded-full bg-brandyellow px-8 py-3 font-semibold text-navy shadow-lg shadow-yellow-500/25 transition-all duration-300 hover:brightness-110"
              >
                Update password
              </button>
            </form>
          </section>
        )}

        {activeTab === "subscription" && (
          <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur">
            <h2 className="text-lg font-semibold text-white">Subscription</h2>
            <p className="mt-4 text-white/70">
              Current plan:{" "}
              <strong className="text-xl capitalize text-brandyellow">{sub?.tier || "free"}</strong>
            </p>
            <p className="mt-3 text-sm text-white/50">
              Manage billing in the Stripe customer portal from your email after checkout, or upgrade from
              pricing.
            </p>
            <Link
              to="/pricing"
              className="mt-6 inline-block rounded-full bg-navy px-8 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-navy/90"
            >
              {sub?.tier === "premium" ? "View pricing" : "Upgrade to Premium"}
            </Link>
          </section>
        )}

        {activeTab === "monitoring" && (
          <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur">
            <h2 className="text-lg font-semibold text-white">Monitoring &amp; alerts</h2>
            <p className="mt-2 text-sm text-white/50">
              We periodically check for new breaches against your last assessment. You&apos;ll see alerts here
              and can get email notifications when something changes.
            </p>

            {profile.isStudent ? (
              <div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
                <p className="text-sm font-medium text-emerald-200">Student account</p>
                <p className="mt-1 text-xs text-emerald-200/70">
                  Registered with a .edu email — student rates apply on the pricing page.
                </p>
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4">
              <div>
                <p className="font-medium text-white">Continuous monitoring</p>
                <p className="mt-1 text-xs text-white/45">
                  {sub?.tier === "premium"
                    ? "Re-scan your email for new breaches on a weekly schedule."
                    : "Available on Premium."}
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center has-[:disabled]:opacity-50">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={Boolean(profile.monitoringEnabled)}
                  onChange={async () => {
                    if (sub?.tier !== "premium") return;
                    const next = !profile.monitoringEnabled;
                    setMonitoringBusy(true);
                    try {
                      await toggleMonitoring(next);
                      const p = await getProfile();
                      setProfile(p.data.user);
                      await refreshUser();
                      showToast(
                        next
                          ? "Monitoring enabled. We'll email you when new breaches are detected."
                          : "Monitoring disabled.",
                        "success"
                      );
                    } catch (e) {
                      showToast(e.response?.data?.message || "Could not update monitoring", "error");
                    } finally {
                      setMonitoringBusy(false);
                    }
                  }}
                  disabled={sub?.tier !== "premium" || monitoringBusy || !profile.emailVerified}
                />
                <span className="relative h-7 w-12 shrink-0 rounded-full bg-white/20 transition after:absolute after:left-0.5 after:top-0.5 after:h-6 after:w-6 after:rounded-full after:bg-white after:transition after:content-[''] peer-checked:bg-brandyellow peer-checked:after:translate-x-[1.25rem] peer-checked:after:bg-navy peer-focus-visible:outline peer-focus-visible:ring-2 peer-focus-visible:ring-brandyellow/40" />
              </label>
            </div>
            {!profile.emailVerified && (
              <p className="mt-3 text-xs text-amber-300/90">Verify your email before you can enable monitoring.</p>
            )}
            {sub?.tier !== "premium" && (
              <Link
                to="/pricing"
                className="mt-4 inline-block text-sm font-semibold text-brandyellow hover:brightness-110"
              >
                Upgrade to Premium to enable monitoring
              </Link>
            )}

            <div className="mt-8 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-4">
              <p className="text-sm font-medium text-white/70">Alert preferences</p>
              <p className="mt-2 text-sm text-white/40">
                Email frequency and quiet hours will be available in a future update. Critical alerts are sent
                when new breaches are detected.
              </p>
            </div>

            <Link
              to="/alerts"
              className="mt-6 inline-flex rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:border-brandyellow/40 hover:text-brandyellow"
            >
              View security alerts
            </Link>
          </section>
        )}

        {activeTab === "family" && (
          <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur">
            <h2 className="text-lg font-semibold text-white">Family emails</h2>
            {sub?.tier === "premium" ? (
              <>
                <p className="mt-2 text-sm text-white/50">
                  Add up to 5 verified emails (household) to run assessments for them. We&apos;ll send a
                  6-digit code to each address.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <input
                    type="email"
                    placeholder="email@example.com"
                    className={`min-w-[200px] flex-1 ${inputDark}`}
                    value={familyEmailInput}
                    onChange={(e) => setFamilyEmailInput(e.target.value)}
                  />
                  <button
                    type="button"
                    className="rounded-full bg-navy px-6 py-3 font-semibold text-white transition-all duration-300 hover:bg-navy/90"
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
                <ul className="mt-6 space-y-4">
                  {familyEmails.map((row) => (
                    <li
                      key={row.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
                    >
                      <span className="text-white">{row.email}</span>
                      {row.verified ? (
                        <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-400">
                          Verified
                        </span>
                      ) : (
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            placeholder="6-digit code"
                            className={`w-28 ${inputDark}`}
                            value={verifyForId === row.id ? verifyCode : ""}
                            onChange={(e) => {
                              setVerifyForId(row.id);
                              setVerifyCode(e.target.value);
                            }}
                          />
                          <button
                            type="button"
                            className="text-sm font-semibold text-brandyellow hover:brightness-110"
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
                          <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs text-yellow-400">
                            Pending
                          </span>
                        </div>
                      )}
                      <button
                        type="button"
                        className="text-sm text-red-400 underline transition-colors hover:text-red-300"
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
              </>
            ) : (
              <p className="mt-4 text-white/60">
                Family email monitoring is available on{" "}
                <Link to="/pricing" className="font-semibold text-brandyellow hover:brightness-110">
                  Premium
                </Link>
                .
              </p>
            )}
          </section>
        )}

        {activeTab === "scans" && (
          <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur">
            <h2 className="text-lg font-semibold text-white">Past assessments</h2>
            <ul className="mt-4 space-y-3">
              {assessments.map((a) => (
                <li
                  key={a.id}
                  className="rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 transition-all duration-300 hover:bg-white/10"
                >
                  <Link to={`/assessment?resume=${a.id}`} className="font-medium text-brandyellow hover:brightness-110">
                    {a.emailSearched}
                  </Link>{" "}
                  <span className="text-white/50">
                    — score {a.score} ({a.riskLevel})
                  </span>
                </li>
              ))}
              {!assessments.length && <li className="text-white/50">None yet.</li>}
            </ul>
          </section>
        )}

        <section className="mt-10 rounded-2xl border border-red-500/10 bg-red-500/5 p-6">
          <h2 className="font-semibold text-red-300">Danger zone</h2>
          <p className="mt-2 text-sm text-red-200/80">
            Permanently delete your account and associated assessments (GDPR).
          </p>
          <button
            type="button"
            className="mt-4 rounded-full bg-red-500 px-6 py-3 font-semibold text-white transition-all duration-300 hover:bg-red-600"
            onClick={() => {
              setDeletePassword("");
              setShowDelete(true);
            }}
          >
            Delete my account
          </button>
        </section>
      </div>

      {showDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-red-500/20 bg-navy/95 p-8 shadow-2xl backdrop-blur-xl">
            <h3 id="delete-title" className="text-lg font-semibold text-white">
              Confirm deletion
            </h3>
            <p className="mt-2 text-sm text-white/60">
              This cannot be undone. Your subscription will be canceled if active.
            </p>
            <div className="mt-4">
              <label htmlFor="delete-password" className="mb-1.5 block text-sm font-medium text-white/70">
                Confirm with your password
              </label>
              <input
                id="delete-password"
                type="password"
                autoComplete="current-password"
                className={inputDark}
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
              />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="rounded-full border border-white/20 px-5 py-2.5 text-white/80 transition-all duration-300 hover:bg-white/10"
                onClick={() => {
                  setShowDelete(false);
                  setDeletePassword("");
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-full bg-red-500 px-5 py-2.5 font-semibold text-white transition-all duration-300 hover:bg-red-600"
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
