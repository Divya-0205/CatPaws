import { useState, type FormEvent } from "react";
import "../Styles/Signup.css";

import CatMascot from "../components/CatMascot";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../api/client";

interface SignupProps {
  onSuccess: () => void;
  onGoToLogin: () => void;
}

export default function Signup({
  onSuccess,
  onGoToLogin,
}: SignupProps) {
  const { signup } = useAuth();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setError(null);
    setLoading(true);

    try {
      await signup(
        name,
        username,
        email,
        password,
        collegeName || undefined
      );

      onSuccess();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Couldn't create your account. Try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="signup-page">
      <div className="signup-card">

        <div className="cat-row">
          <CatMascot size={110} mood="happy" />
        </div>

        <h1 className="signup-title">
          Join CatPaws
        </h1>

        <p className="signup-subtitle">
          AQ's ready to start reading your code.
        </p>

        <form
          className="signup-form"
          onSubmit={handleSubmit}
        >
          <input
            className="signup-input"
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            className="signup-input"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            className="signup-input"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="signup-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <input
            className="signup-input"
            type="text"
            placeholder="College name (optional)"
            value={collegeName}
            onChange={(e) => setCollegeName(e.target.value)}
          />

          {error && (
            <p className="signup-error">
              {error}
            </p>
          )}

          <button
            className="signup-btn"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Creating account..."
              : "Create account"}
          </button>
        </form>

        <p className="signup-switch">
          Already have an account?

          <button
            className="signup-link"
            onClick={onGoToLogin}
          >
            Log in
          </button>
        </p>

      </div>
    </div>
  );
}