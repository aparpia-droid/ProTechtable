import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AssessmentPage from "../pages/AssessmentPage";
import { AuthProvider } from "../context/AuthContext";

vi.mock("../lib/api", () => ({
  getProfile: vi.fn().mockResolvedValue({ data: { user: { email: "a@b.com" } } }),
  getAssessment: vi.fn(),
  createAssessment: vi.fn(),
}));

vi.mock("../context/ToastContext", () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

import * as api from "../lib/api";

describe("AssessmentPage", () => {
  it("renders email form", () => {
    api.getAssessment.mockResolvedValue({});
    render(
      <MemoryRouter>
        <AuthProvider>
          <AssessmentPage />
        </AuthProvider>
      </MemoryRouter>
    );
    expect(screen.getByLabelText(/email to assess/i)).toBeTruthy();
  });
});
