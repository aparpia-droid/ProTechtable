import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await logout();
    navigate("/");
    setOpen(false);
  }

  return (
    <header className="border-b border-navy/10 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="text-xl font-semibold text-navy" aria-label="ProTechtable home">
          ProTechtable
        </Link>
        <nav className="hidden items-center gap-6 md:flex" aria-label="Main">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `text-sm font-medium ${isActive ? "text-navy" : "text-brandgray hover:text-navy"}`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/pricing"
            className={({ isActive }) =>
              `text-sm font-medium ${isActive ? "text-navy" : "text-brandgray hover:text-navy"}`
            }
          >
            Pricing
          </NavLink>
          {isAuthenticated ? (
            <div className="relative">
              <button
                type="button"
                className="flex items-center gap-1 text-sm font-medium text-navy"
                aria-expanded={open}
                aria-haspopup="true"
                aria-label="User menu"
                onClick={() => setOpen(!open)}
              >
                {user?.firstName || user?.email || "Account"}
                <span aria-hidden>▾</span>
              </button>
              {open && (
                <ul
                  className="absolute right-0 z-40 mt-2 min-w-[10rem] rounded border border-navy/10 bg-white py-1 shadow"
                  role="menu"
                >
                  <li role="none">
                    <Link
                      role="menuitem"
                      to="/account"
                      className="block px-4 py-2 text-sm hover:bg-navy/5"
                      onClick={() => setOpen(false)}
                    >
                      Account
                    </Link>
                  </li>
                  <li role="none">
                    <button
                      type="button"
                      role="menuitem"
                      className="w-full px-4 py-2 text-left text-sm hover:bg-navy/5"
                      onClick={handleLogout}
                    >
                      Log out
                    </button>
                  </li>
                </ul>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-medium text-brandgray hover:text-navy">
                Log in
              </Link>
              <Link
                to="/signup"
                className="rounded bg-brandyellow px-4 py-2 text-sm font-semibold text-navy"
              >
                Sign up
              </Link>
            </div>
          )}
        </nav>
        <button
          type="button"
          className="md:hidden"
          aria-label="Open menu"
          onClick={() => setOpen(!open)}
        >
          Menu
        </button>
      </div>
    </header>
  );
}
