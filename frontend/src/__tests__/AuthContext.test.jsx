import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "../context/AuthContext";

vi.mock("../lib/api", () => ({
  getProfile: vi.fn(),
  getStoredToken: vi.fn(() => null),
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
    api.getStoredToken.mockReturnValue(null);
  });

  it("starts unauthenticated when no token", async () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("ready"));
    expect(screen.getByTestId("auth").textContent).toBe("no");
  });
});
