import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { getToken, setToken, clearToken } from "../api/client";
import { login as apiLogin, signup as apiSignup, type AuthUser } from "../api/auth";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, username: string, email: string, password: string, collegeName?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiLogin({ email, password });
    setToken(res.token);
    setUser(res.user);
  }, []);

  const signup = useCallback(
    async (name: string, username: string, email: string, password: string, collegeName?: string) => {
      await apiSignup({ name, username, email, password, collegeName });
      const res = await apiLogin({ email, password });
      setToken(res.token);
      setUser(res.user);
    },
    []
  );

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const value: AuthContextValue = {
    user,
    isAuthenticated: Boolean(user || getToken()),
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}