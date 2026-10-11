import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router";
import { useAuth } from "@/context/auth";
import { logOut } from "@/services/authService";

export default function Layout() {
  const { user, isAuthLoading } = useAuth();
  const { pathname } = useLocation();
  const viewKey = `${pathname}:${user?.uid ?? "guest"}`;
  const previousView = useRef(viewKey);
  const mainRef = useRef<HTMLElement>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (previousView.current !== viewKey) {
      mainRef.current?.focus();
      window.scrollTo(0, 0);
      previousView.current = viewKey;
    }
  }, [viewKey]);

  async function handleLogOut() {
    setAuthError(null);
    setIsLoggingOut(true);
    try {
      await logOut();
    } catch {
      setAuthError("We couldn't log you out. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="site-header">
        <div className="header-inner">
          <Link className="brand" to="/">
            <svg viewBox="0 0 40 40" aria-hidden="true" fill="none">
              <rect width="40" height="40" rx="10" fill="#28513a" />
              <path
                d="m6 29 12-19 9 14 4-6 5 11H6Z"
                stroke="#f5f0d9"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path d="m14 16 4 4 4-4" stroke="#b5cba2" strokeWidth="2" />
            </svg>
            Ferrata Tracker
          </Link>
          <nav className="nav" aria-label="Main navigation">
            <NavLink to="/" end>
              Explore
            </NavLink>
            <NavLink to="/progress">My progress</NavLink>
            {!isAuthLoading &&
              (user ? (
                <button
                  type="button"
                  onClick={handleLogOut}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? "Logging out…" : "Log out"}
                </button>
              ) : (
                <NavLink to="/auth">Log in</NavLink>
              ))}
          </nav>
        </div>
        {user && (
          <p className="account">Signed in as {user.email ?? "your account"}</p>
        )}
        <p role="alert" className="account error feedback">
          {authError}
        </p>
      </header>
      <main id="main-content" tabIndex={-1} ref={mainRef}>
        <Outlet key={viewKey} />
      </main>
      <footer className="site-footer">
        A small trail journal for your next climb.
      </footer>
    </>
  );
}
