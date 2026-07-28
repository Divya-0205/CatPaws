import { apiFetch } from "./client";

export interface AuthUser {
  id: string;
  name: string;
  username: string;
  email: string;
  collegeName?: string;
}

interface SignupPayload {
  name: string;
  username: string;
  email: string;
  password: string;
  collegeName?: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface AuthResponse {
  message: string;
  token: string;
  user: AuthUser;
}

interface SignupResponse {
  message: string;
  user: AuthUser;
}

export function signup(payload: SignupPayload): Promise<SignupResponse> {
  return apiFetch<SignupResponse>("/auth/signup", {
    method: "POST",
    body: payload,
    auth: false,
  });
}

export function login(payload: LoginPayload): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: payload,
    auth: false,
  });
}