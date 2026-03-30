import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import RemediationPage from "../pages/RemediationPage";
import { AuthProvider } from "../context/AuthContext";

vi.mock("../lib/api", () => ({
  getProfile: vi.fn().mockResolvedValue({ data: { user: { subscriptionTier: "free" } } }),
  getRemediation: vi.fn().mockResolvedValue({
    data: {
      remediationPlan: {
        actions: [
          {
            id: "1",
            actionType: "credit_freeze",
            actionTarget: "x",
            status: "pending",
            isAutomated: false,
            title: "Place a credit freeze",
            description: "desc",
            priority: "High",
            difficulty: "Medium",
            timeEstimate: "45 min",
            removalUrl: null,
            removalMethod: null,
          },
        ],
        progress: { total: 1, completed: 0, percentage: 0 },
      },
    },
  }),
  getBrokers: vi.fn().mockResolvedValue({ data: { data: [] } }),
}));

vi.mock("../context/ToastContext", () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

describe("RemediationPage", () => {
  it("shows quick wins when actions present", async () => {
    render(
      <MemoryRouter initialEntries={["/remediation/abc"]}>
        <AuthProvider>
          <Routes>
            <Route path="/remediation/:assessmentId" element={<RemediationPage />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );
    expect(await screen.findByText(/Quick wins/i)).toBeTruthy();
  });
});
