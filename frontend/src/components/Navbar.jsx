import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useRef, useState } from "react";
import { getAlerts } from "../lib/api";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadAlerts, setUnreadAlerts] = useState(0);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadAlerts(0);
      return;
    }
    let cancelled = false;
    getAlerts()
      .then((res) => {
        if (!cancelled) setUnreadAlerts(res.data?.unreadCount ?? 0);
      })
      .catch(() => {
        if (!cancelled) setUnreadAlerts(0);
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    await logout();
    navigate("/");
    setUserMenuOpen(false);
    setMobileOpen(false);
  }

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition-all duration-300 ${
      isActive ? "text-white" : "text-white/70 hover:text-white"
    }`;

  const navLinks = (
    <>
      <NavLink to="/dashboard" className={linkClass} onClick={() => setMobileOpen(false)}>
        Dashboard
      </NavLink>
      <NavLink to="/broker-removal" className={linkClass} onClick={() => setMobileOpen(false)}>
        Removal
      </NavLink>
      {isAuthenticated && (
        <NavLink to="/detection" className={linkClass} onClick={() => setMobileOpen(false)}>
          Footprint
        </NavLink>
      )}
      {isAuthenticated && (
        <Link
          to="/referrals"
          className="text-sm font-semibold text-brandyellow transition-all duration-300 hover:brightness-110"
          onClick={() => setMobileOpen(false)}
        >
          Refer &amp; Earn
        </Link>
      )}
      <NavLink to="/pricing" className={linkClass} onClick={() => setMobileOpen(false)}>
        Pricing
      </NavLink>
      <NavLink to="/blog" className={linkClass} onClick={() => setMobileOpen(false)}>
        Guides
      </NavLink>
    </>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-navy/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link
          to="/"
          className="flex items-center gap-2 text-xl font-bold text-white"
          aria-label="ProTechtable home"
        >
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-brandyellow/15 text-brandyellow"
            aria-hidden
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              />
            </svg>
          </span>
          ProTechtable
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Main">
          {navLinks}
          {isAuthenticated ? (
            <div className="relative flex items-center gap-4" ref={menuRef}>
              <Link to="/alerts" className="relative">
                <svg
                  className="h-5 w-5 text-white/70 transition-colors hover:text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                  />
                </svg>
                {unreadAlerts > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-0.5 text-[10px] font-bold text-white">
                    {unreadAlerts > 9 ? "9+" : unreadAlerts}
                  </span>
                )}
                <span className="sr-only">Alerts</span>
              </Link>
              <button
                type="button"
                className="flex items-center gap-1 text-sm font-medium text-white/70 transition-all duration-300 hover:text-white"
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
                aria-label="User menu"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                {user?.firstName || user?.email || "Account"}
                <span aria-hidden>▾</span>
              </button>
              {userMenuOpen && (
                <ul
                  className="absolute right-0 z-40 mt-2 min-w-[12rem] rounded-xl border border-white/10 bg-navy/95 py-1 shadow-2xl backdrop-blur"
                  role="menu"
                >
                  <li role="none">
                    <Link
                      role="menuitem"
                      to="/account"
                      className="block px-4 py-2 text-sm text-white/90 transition-colors hover:bg-white/10"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Account
                    </Link>
                  </li>
                  <li role="none">
                    <button
                      type="button"
                      role="menuitem"
                      className="w-full px-4 py-2 text-left text-sm text-white/90 transition-colors hover:bg-white/10"
                      onClick={handleLogout}
                    >
                      Log out
                    </button>
                  </li>
                </ul>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <NavLink
                to="/scan"
                className="rounded-lg border border-brandyellow/20 bg-brandyellow/10 px-4 py-2 text-sm font-semibold text-brandyellow transition hover:bg-brandyellow/20"
              >
                Check Your Score
              </NavLink>
              <Link
                to="/login"
                className="text-sm font-medium text-white/70 transition-all duration-300 hover:text-white"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="rounded-full bg-brandyellow px-5 py-2 text-sm font-semibold text-navy transition-all duration-300 hover:brightness-110"
              >
                Sign up
              </Link>
            </div>
          )}
        </nav>

        <button
          type="button"
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-lg border border-white/10 md:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <span
            className={`block h-0.5 w-5 bg-white transition-transform ${mobileOpen ? "translate-y-2 rotate-45" : ""}`}
          />
          <span className={`block h-0.5 w-5 bg-white ${mobileOpen ? "opacity-0" : ""}`} />
          <span
            className={`block h-0.5 w-5 bg-white transition-transform ${mobileOpen ? "-translate-y-2 -rotate-45" : ""}`}
          />
        </button>
      </div>

      <div
        className={`overflow-hidden border-t border-white/10 bg-navy/95 backdrop-blur transition-all duration-300 md:hidden ${
          mobileOpen ? "max-h-[28rem] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <nav className="flex flex-col gap-1 px-4 py-4" aria-label="Mobile">
          {navLinks}
          {isAuthenticated ? (
            <>
              <Link
                to="/alerts"
                className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                onClick={() => setMobileOpen(false)}
              >
                Alerts
                {unreadAlerts > 0 && (
                  <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                    {unreadAlerts > 9 ? "9+" : unreadAlerts}
                  </span>
                )}
              </Link>
              <Link
                to="/account"
                className="rounded-lg px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                onClick={() => setMobileOpen(false)}
              >
                Account
              </Link>
              <button
                type="button"
                className="rounded-lg px-3 py-2 text-left text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                onClick={handleLogout}
              >
                Log out
              </button>
            </>
          ) : (
            <div className="mt-2 flex flex-col gap-3 border-t border-white/10 pt-4">
              <Link
                to="/scan"
                className="rounded-lg border border-brandyellow/20 bg-brandyellow/10 px-3 py-2 text-center text-sm font-semibold text-brandyellow transition hover:bg-brandyellow/20"
                onClick={() => setMobileOpen(false)}
              >
                Check Your Score
              </Link>
              <Link
                to="/login"
                className="rounded-lg px-3 py-2 text-center text-sm font-medium text-white/70 transition-colors hover:text-white"
                onClick={() => setMobileOpen(false)}
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="rounded-full bg-brandyellow py-3 text-center text-sm font-semibold text-navy transition-all duration-300 hover:brightness-110"
                onClick={() => setMobileOpen(false)}
              >
                Sign up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
