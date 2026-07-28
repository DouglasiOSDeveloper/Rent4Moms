const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
export const API_BASE_URL = (configuredBaseUrl || "/api/v1").replace(/\/$/, "");

export function resolveApiResourceUrl(value: string, apiBaseUrl = API_BASE_URL): string {
  const normalized = value.trim();
  if (!normalized) return "";
  if (/^(https?:|data:|blob:)/i.test(normalized)) return normalized;
  if (normalized.startsWith("/api/v1") && /^https?:\/\//i.test(apiBaseUrl)) {
    return `${apiBaseUrl}${normalized.slice("/api/v1".length)}`;
  }
  return normalized.startsWith("/") ? normalized : "";
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (typeof fetch !== "function") throw new ApiError("API indisponível neste ambiente.", 0, "API_UNAVAILABLE");
  const headers = new Headers(init.headers);
  const isFormData = typeof FormData !== "undefined" && init.body instanceof FormData;
  if (!isFormData && init.body !== undefined && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: "include",
    headers,
  });

  if (response.status === 204) return undefined as T;
  const contentType = response.headers.get("content-type") ?? "";
  const body = contentType.includes("application/json")
    ? await response.json().catch(() => ({})) as { message?: string; error?: string } & T
    : {} as { message?: string; error?: string } & T;
  if (!response.ok) {
    throw new ApiError(body.message || "Não foi possível concluir a solicitação.", response.status, body.error || "API_ERROR");
  }
  return body;
}
