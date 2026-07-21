import type { AuthUser, RegistrationInput } from "../../domain/auth/types";
import { apiRequest } from "../api/apiClient";

export async function getSession(): Promise<AuthUser | null> {
  try {
    const response = await apiRequest<{ user: AuthUser }>("/auth/session");
    return response.user;
  } catch (error) {
    if (error && typeof error === "object" && "status" in error && (error as { status: number }).status === 401) return null;
    throw error;
  }
}

export async function loginSession(identifier: string, password: string): Promise<AuthUser> {
  const response = await apiRequest<{ user: AuthUser }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ identifier, password }),
  });
  return response.user;
}

export async function registerSession(input: RegistrationInput): Promise<AuthUser> {
  const response = await apiRequest<{ user: AuthUser }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return response.user;
}

export async function logoutSession(): Promise<void> {
  await apiRequest<void>("/auth/logout", { method: "POST" });
}
