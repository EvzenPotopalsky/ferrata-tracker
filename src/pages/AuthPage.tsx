import { useState, type SubmitEvent } from "react";
import { Link, useNavigate } from "react-router";
import { logIn, signUp } from "@/services/authService";
import { useAuth } from "@/context/auth";
import { usePageTitle } from "@/lib/usePageTitle";

type AuthMode = "login" | "signup";

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const isSignup = mode === "signup";
  usePageTitle(isSignup ? "Create an account" : "Log in");

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    setError(null);
    setIsSubmitting(true);
    try {
      if (isSignup) await signUp(email.trim(), password);
      else await logIn(email.trim(), password);
      navigate("/progress", { replace: true });
    } catch {
      setError(
        isSignup
          ? "We couldn't create your account. Check your details and connection, then try again."
          : "We couldn't log you in. Check your email, password and connection, then try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page-auth panel">
      <p className="eyebrow muted">Your trail journal</p>
      <h1 className="mt-4">
        {user
          ? "You're signed in"
          : isSignup
            ? "Start your journal."
            : "Welcome back."}
      </h1>
      {isAuthLoading ? (
        <p role="status" className="muted mt-4">
          Checking your account…
        </p>
      ) : user ? (
        <Link to="/progress" className="button mt-6">
          View my progress
        </Link>
      ) : (
        <>
          <p className="muted mt-4">
            {isSignup
              ? "Create an account to keep your completed routes in one place."
              : "Log in to continue tracking your ferratas."}
          </p>
          <form
            onSubmit={handleSubmit}
            className="form-stack mt-6"
            aria-label={isSignup ? "Create account" : "Log in"}
          >
            <fieldset disabled={isSubmitting}>
              <legend className="sr-only">Account details</legend>
              <div>
                <label htmlFor="email">Email (required)</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password">Password (required)</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isSignup ? "new-password" : "current-password"}
                  minLength={isSignup ? 6 : undefined}
                  required
                  value={password}
                  aria-describedby={isSignup ? "password-hint" : undefined}
                  onChange={(event) => setPassword(event.target.value)}
                />
                {isSignup && (
                  <p id="password-hint" className="hint">
                    Use at least 6 characters.
                  </p>
                )}
              </div>
            </fieldset>
            <p role="alert" className="error feedback">
              {error}
            </p>
            <p role="status" className="muted feedback">
              {isSubmitting ? "Connecting to your account…" : ""}
            </p>
            <button
              type="submit"
              disabled={isSubmitting}
              className="button w-full"
            >
              {isSubmitting
                ? "Please wait…"
                : isSignup
                  ? "Create account"
                  : "Log in"}
            </button>
          </form>
          <p className="muted mt-6 text-sm">
            {isSignup ? "Already have an account?" : "New to Ferrata Tracker?"}{" "}
            <button
              type="button"
              disabled={isSubmitting}
              className="text-button"
              onClick={() => {
                setMode(isSignup ? "login" : "signup");
                setError(null);
              }}
            >
              {isSignup ? "Log in" : "Create an account"}
            </button>
          </p>
        </>
      )}
    </div>
  );
}
