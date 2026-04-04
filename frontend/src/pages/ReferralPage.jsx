import { useEffect, useState } from "react";
import { getReferralInfo } from "../lib/api";
import { useToast } from "../context/ToastContext";
import LoadingSpinner from "../components/LoadingSpinner";

export default function ReferralPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getReferralInfo()
      .then((res) => {
        if (!cancelled) setData(res.data.data);
      })
      .catch(() => {
        if (!cancelled) showToast("Could not load referrals", "error");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [showToast]);

  async function copyLink() {
    if (!data?.referralLink) return;
    try {
      await navigator.clipboard.writeText(data.referralLink);
      showToast("Copied!", "success");
    } catch {
      showToast("Could not copy", "error");
    }
  }

  const upgraded = data?.referrals?.filter((r) => r.status === "converted").length ?? 0;

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-[#0a0a0f]">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-white md:text-4xl">Refer Friends, Earn Free Premium</h1>
        <p className="mt-3 text-lg text-gray-400">
          Share your link. When friends sign up and upgrade, you BOTH get 1 month free.
        </p>

        <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <p className="text-sm font-medium text-gray-400">Your referral link</p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <input
              readOnly
              value={data?.referralLink || ""}
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
            />
            <button
              type="button"
              onClick={copyLink}
              className="shrink-0 rounded-xl bg-brandyellow px-6 py-3 font-bold text-gray-900 hover:bg-yellow-300"
            >
              Copy Link
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent("Check your data exposure with ProTechtable — " + (data?.referralLink || ""))}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-white/20 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-white/5"
            >
              Share on Twitter
            </a>
            <a
              href={`mailto:?subject=${encodeURIComponent("Join me on ProTechtable")}&body=${encodeURIComponent("Sign up here: " + (data?.referralLink || ""))}`}
              className="rounded-xl border border-white/20 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-white/5"
            >
              Share via Email
            </a>
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            ["Friends Referred", data?.referralCount ?? 0],
            ["Friends Upgraded", upgraded],
            ["Months Earned", data?.referralCredits ?? 0],
          ].map(([label, val]) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur">
              <p className="text-3xl font-bold text-brandyellow">{val}</p>
              <p className="mt-2 text-sm text-gray-400">{label}</p>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <h2 className="text-lg font-semibold text-white">Your referrals</h2>
          {!data?.referrals?.length ? (
            <p className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-gray-500">
              No referrals yet. Share your link to get started!
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {data.referrals.map((r) => (
                <li
                  key={r.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <span className="text-white">{r.referee?.firstName || "Friend"}</span>
                  <span className="text-sm text-gray-400">
                    {r.status === "converted" ? "Upgraded" : "Signed Up"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
