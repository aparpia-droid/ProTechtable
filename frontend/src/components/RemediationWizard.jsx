import { useState } from "react";
import { markActionComplete } from "../lib/api";
import { useToast } from "../context/ToastContext";

const GUIDES = {
  credit_freeze: {
    title: "Freeze Your Credit",
    steps: [
      {
        text: "Go to Equifax.com/personal/credit-report-services/credit-freeze",
        link: "https://www.equifax.com/personal/credit-report-services/credit-freeze/",
      },
      { text: "Create an account or sign in" },
      { text: "Navigate to 'Place a Security Freeze'" },
      { text: "Verify your identity and confirm the freeze" },
      { text: "Save your PIN — you'll need it to unfreeze later" },
      { text: "Repeat for Experian (experian.com/freeze) and TransUnion (transunion.com/freeze)" },
    ],
  },
  password_reset: {
    title: "Change Breached Passwords",
    steps: [
      {
        text: "Open your password manager (or start using one — we recommend Bitwarden, it's free)",
      },
      { text: "Go to the breached service's website and log in" },
      { text: "Navigate to Settings → Security → Change Password" },
      { text: "Generate a unique password (16+ characters) using your password manager" },
      { text: "Save the new password in your password manager" },
      { text: "Enable two-factor authentication (2FA) if available" },
    ],
  },
  fraud_alert: {
    title: "Set Up Fraud Alerts",
    steps: [
      { text: "Call Equifax at 1-800-525-6285 or visit equifax.com" },
      { text: "Request an initial fraud alert (free, lasts 1 year)" },
      { text: "Equifax will notify the other two bureaus automatically" },
      { text: "You'll receive confirmation letters — keep them" },
    ],
  },
  data_removal: {
    title: "Remove Yourself from Data Broker",
    steps: [
      { text: "Click the removal link below to go to the broker's opt-out page" },
      { text: "Search for your name and/or email on their site" },
      { text: "Follow their removal/opt-out process (usually a form or email)" },
      { text: "Save confirmation emails or screenshots as proof" },
      { text: "Check back in 2-4 weeks to verify removal" },
    ],
  },
};

export default function RemediationWizard({ actions, onComplete, onClose }) {
  const { showToast } = useToast();
  const [currentAction, setCurrentAction] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [completing, setCompleting] = useState(false);

  if (!actions || actions.length === 0) return null;

  const action = actions[currentAction];
  const guide = GUIDES[action.actionType] || GUIDES.data_removal;
  const isLastStep = currentStep >= guide.steps.length - 1;
  const isLastAction = currentAction >= actions.length - 1;

  async function handleMarkComplete() {
    setCompleting(true);
    try {
      await markActionComplete(action.id);
      onComplete(action.id);
      if (!isLastAction) {
        setCurrentAction((prev) => prev + 1);
        setCurrentStep(0);
      } else {
        onClose();
      }
    } catch {
      showToast("Could not save progress", "error");
    } finally {
      setCompleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" role="dialog" aria-modal="true">
      <div className="mx-4 w-full max-w-lg rounded-xl bg-white shadow-2xl">
        <div className="rounded-t-xl bg-navy p-5 text-white">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/70">
              Step {currentAction + 1} of {actions.length}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="text-xl text-white/70 hover:text-white"
              aria-label="Close"
            >
              &times;
            </button>
          </div>
          <h2 className="mt-2 text-xl font-bold">{guide.title}</h2>
          {action.actionTarget && <p className="mt-1 text-sm text-white/80">{action.actionTarget}</p>}
        </div>
        <div className="p-6">
          <ol className="space-y-3">
            {guide.steps.map((step, i) => (
              <li
                key={i}
                className={`flex items-start gap-3 ${i > currentStep ? "opacity-40" : ""}`}
              >
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    i < currentStep
                      ? "bg-green-100 text-green-600"
                      : i === currentStep
                        ? "bg-navy text-white"
                        : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {i < currentStep ? "✓" : i + 1}
                </span>
                <span className="text-sm">
                  {step.text}
                  {step.link && (
                    <a
                      href={step.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-1 text-navy underline"
                    >
                      Open →
                    </a>
                  )}
                </span>
              </li>
            ))}
          </ol>
          <div className="mt-6 flex gap-3">
            {!isLastStep ? (
              <button
                type="button"
                onClick={() => setCurrentStep((s) => s + 1)}
                className="flex-1 rounded-lg bg-navy py-2.5 text-sm font-semibold text-white hover:bg-navy/90 focus-visible:ring-2 focus-visible:ring-navy"
              >
                Next Step
              </button>
            ) : (
              <button
                type="button"
                onClick={handleMarkComplete}
                disabled={completing}
                className="flex-1 rounded-lg bg-green-600 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-green-600"
              >
                {completing ? "Saving..." : "Mark Complete & Continue"}
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                if (currentStep > 0) setCurrentStep((s) => s - 1);
              }}
              disabled={currentStep === 0}
              className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-brandgray hover:bg-gray-50 disabled:opacity-30"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
