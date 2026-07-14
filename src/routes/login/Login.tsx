import { useState } from "react";
import type { FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  confirmSignUp,
  resendConfirmationCode,
  signIn,
  signUp,
  type AuthUser,
} from "../../auth/cognito";

type LoginProps = {
  isAuthReady: boolean;
  user: AuthUser | null;
  onAuthenticated: (user: AuthUser) => Promise<void>;
};

type AuthMode = "sign-in" | "sign-up" | "confirm";

function authErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error && "message" in error) {
    return String(error.message);
  }

  return "Authentication failed.";
}

export function Login({ isAuthReady, user, onAuthenticated }: LoginProps) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setStatus(null);
    setIsSubmitting(true);

    try {
      if (mode === "sign-up") {
        await signUp(email, password);
        setMode("confirm");
        setStatus("Check your email for the confirmation code.");
        return;
      }

      if (mode === "confirm") {
        await confirmSignUp(email, confirmationCode);
        setStatus("Email confirmed. Signing you in...");
      }

      const authUser = await signIn(email, password);
      await onAuthenticated(authUser);
      navigate("/home");
    } catch (caughtError) {
      const message = authErrorMessage(caughtError);
      if (message.includes("User is not confirmed")) {
        setMode("confirm");
        setStatus("Confirm your email before signing in.");
      }
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResendCode() {
    setError(null);
    setStatus(null);
    setIsSubmitting(true);

    try {
      await resendConfirmationCode(email);
      setStatus("A new confirmation code was sent.");
    } catch (caughtError) {
      setError(authErrorMessage(caughtError));
    } finally {
      setIsSubmitting(false);
    }
  }

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode);
    setError(null);
    setStatus(null);
  }

  if (!isAuthReady) {
    return <main className="page login-page">Loading...</main>;
  }

  if (user) {
    return <Navigate to="/home" replace />;
  }

  const isConfirming = mode === "confirm";
  const title =
    mode === "sign-up"
      ? "Create account"
      : isConfirming
        ? "Confirm email"
        : "Sign in";
  const submitLabel =
    mode === "sign-up"
      ? "Create account"
      : isConfirming
        ? "Confirm and sign in"
        : "Sign in";

  return (
    <main className="page login-page">
      <p className="eyebrow">Account</p>
      <h1>{title}</h1>
      <form className="login-form" onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            name="password"
            autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        {isConfirming && (
          <label>
            Confirmation code
            <input
              type="text"
              name="confirmationCode"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              value={confirmationCode}
              onChange={(event) => setConfirmationCode(event.target.value)}
              required
            />
          </label>
        )}

        {status && <p className="auth-status">{status}</p>}
        {error && <p className="auth-error">{error}</p>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Please wait..." : submitLabel}
        </button>

        <div className="auth-switcher">
          {mode === "sign-in" ? (
            <button type="button" onClick={() => switchMode("sign-up")}>
              Create an account
            </button>
          ) : (
            <button type="button" onClick={() => switchMode("sign-in")}>
              Back to sign in
            </button>
          )}
          {isConfirming && (
            <button
              type="button"
              onClick={handleResendCode}
              disabled={isSubmitting || !email}
            >
              Resend code
            </button>
          )}
        </div>
      </form>
    </main>
  );
}
