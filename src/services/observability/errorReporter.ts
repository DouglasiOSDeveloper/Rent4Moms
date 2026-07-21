import { API_BASE_URL } from "../api/apiClient";

export interface ClientErrorReport {
  message: string;
  stack?: string;
  source: "react" | "window" | "promise";
  path: string;
  userAgent: string;
  occurredAt: string;
}

function sanitize(value: string | undefined, limit: number): string | undefined {
  if (!value) return undefined;
  return value.replace(/[\r\n]+/g, " ").slice(0, limit);
}

export function reportClientError(input: Omit<ClientErrorReport, "path" | "userAgent" | "occurredAt">): void {
  const report: ClientErrorReport = {
    message: sanitize(input.message, 500) ?? "Erro não identificado",
    stack: sanitize(input.stack, 4_000),
    source: input.source,
    path: typeof window === "undefined" ? "unknown" : window.location.pathname,
    userAgent: typeof navigator === "undefined" ? "unknown" : navigator.userAgent.slice(0, 300),
    occurredAt: new Date().toISOString(),
  };

  if (import.meta.env.DEV) console.error("Client error report", report);
  if (typeof fetch !== "function") return;
  void fetch(`${API_BASE_URL}/observability/client-errors`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(report),
    keepalive: true,
  }).catch(() => undefined);
}

export function installGlobalErrorReporting(): () => void {
  if (typeof window === "undefined") return () => undefined;
  const onError = (event: ErrorEvent) => reportClientError({
    message: event.message,
    stack: event.error instanceof Error ? event.error.stack : undefined,
    source: "window",
  });
  const onUnhandledRejection = (event: PromiseRejectionEvent) => {
    const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
    reportClientError({ message: error.message, stack: error.stack, source: "promise" });
  };
  window.addEventListener("error", onError);
  window.addEventListener("unhandledrejection", onUnhandledRejection);
  return () => {
    window.removeEventListener("error", onError);
    window.removeEventListener("unhandledrejection", onUnhandledRejection);
  };
}
