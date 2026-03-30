import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "../context/AuthContext";

vi.mock("../lib/api", () => ({
  getProfile: vi.fn(),
  login: vi.fn(),
  logout: vi.fn(),
}));

import * as api from "../lib/api";

function Probe() {
  const { isAuthenticated, isLoading } = useAuth();
  return (
    <div>
      <span data-testid="loading">{isLoading ? "loading" : "ready"}</span>
      <span data-testid="auth">{isAuthenticated ? "yes" : "no"}</span>
    </div>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads profile and sets authenticated when getProfile succeeds", async () => {
    api.getProfile.mockResolvedValue({
      data: { user: { id: "1", email: "a@b.com" } },
    });
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("ready"));
    expect(screen.getByTestId("auth").textContent).toBe("yes");
  });

  it("starts unauthenticated when getProfile fails", async () => {
    api.getProfile.mockRejectedValue(new Error("unauthorized"));
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("ready"));
    expect(screen.getByTestId("auth").textContent).toBe("no");
  });
});
