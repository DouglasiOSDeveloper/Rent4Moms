import type { AuthState } from "../shared/types";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  cpfDigits: string | null;
  phone: string | null;
  role: Exclude<AuthState, "guest">;
  createdAt: string;
}

export interface RegistrationInput {
  name: string;
  email: string;
  cpf: string;
  phone: string;
  password: string;
}

export type AuthStatus = "loading" | "ready";
