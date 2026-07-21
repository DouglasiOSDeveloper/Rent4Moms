import React from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import type { AuthStatus } from "../../domain/auth/types";
import type { AuthState } from "../../domain/shared/types";

export function RequireRole({ auth, authStatus, role }: { auth: AuthState; authStatus: AuthStatus; role: "client" | "admin" }) {
  const location = useLocation();

  if (authStatus === "loading") {
    return <div className="min-h-[50vh] flex items-center justify-center text-muted-foreground">Verificando sua sessão...</div>;
  }

  if (auth !== role) {
    return <Navigate to="/entrar" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
