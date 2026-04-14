import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api, getProfile, login as apiLogin, logout as apiLogout } from "../lib/api";

const AuthContext = createContext(null);

const TOKEN_KEY = "pt_token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, attach any stored token as a fallback for browsers
  // that block third-party cookies (cross-origin cookie issue).
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, []);

  const loadUser = useCallback(async () => {
    try {
      const { data } = await getProfile({ skipAuthRedirect: true });
      setUser(data.user);
    } catch {
      // Cookie/token invalid or missing — clear stale token
      localStorage.removeItem(TOKEN_KEY);
      delete api.defaults.headers.common["Authorization"];
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(async (email, password) => {
    const { data } = await apiLogin({ email, password });
    // Store token in localStorage as fallback for third-party cookie blocking
    if (data.token) {
      localStorage.setItem(TOKEN_KEY, data.token);
      api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
    }
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      /* ignore */
    }
    localStorage.removeItem(TOKEN_KEY);
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      isAuthenticated: Boolean(user),
      isLoading,
      refreshUser: loadUser,
    }),
    [user, login, logout, isLoading, loadUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
