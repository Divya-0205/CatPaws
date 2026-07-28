import { useState, type FormEvent } from "react";
import "./../Styles/Login.css";

import CatMascot from "../components/CatMascot";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../api/client";

interface LoginProps {
  onSuccess: () => void;
  onGoToSignup: () => void;
}

export default function Login({
  onSuccess,
  onGoToSignup,
}: LoginProps) {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      onSuccess();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Couldn't log in."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">

      <div className="login-left">

        <CatMascot
          size={240}
          mood="happy"
        />

        <h1>Welcome Back!</h1>

        <p>
          AQ has been patiently waiting to
          review your next project.
        </p>

      </div>

      <div className="login-right">

        <div className="login-card">

          <h2>Sign In</h2>

          <p className="login-desc">
            Continue your coding journey.
          </p>

          <form
            onSubmit={handleSubmit}
            className="login-form"
          >

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e)=>
                setEmail(e.target.value)
              }
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e)=>
                setPassword(e.target.value)
              }
              required
            />

            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            <button
              disabled={loading}
            >
              {loading
                ? "Logging in..."
                : "Log In"}
            </button>

          </form>

          <p className="login-bottom">

            Don't have an account?

            <button
              onClick={onGoToSignup}
              type="button"
              className="signup-link"
            >
              Sign Up
            </button>

          </p>

        </div>

      </div>

    </div>
  );
}