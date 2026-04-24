import { reportError } from "./error";

const TOKEN_KEY = "furnigo_admin_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshToken(): Promise<string | null> {
  const token = getToken();
  if (!token) return null;

  try {
    const res = await fetch("/api/auth/token/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const json = await res.json();

    if (json.success) {
      setToken(json.data.token);
      return json.data.token;
    }

    // Deactivated or expired beyond grace window — force logout
    clearToken();
    window.location.href = "/admin/login";
    return null;
  } catch {
    return null;
  }
}

export async function api<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<{ success: true; data: T; meta?: any } | { success: false; error: { code: string; message: string } }> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Don't set Content-Type for FormData (browser sets it with boundary)
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  let res: Response;
  try {
    res = await fetch(`/api${path}`, { ...options, headers });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Network error";
    reportError(message);
    return { success: false as const, error: { code: "NETWORK_ERROR", message } };
  }

  // On 401, attempt token refresh and retry once
  if (res.status === 401 && token) {
    if (!refreshPromise) {
      refreshPromise = refreshToken();
    }
    const newToken = await refreshPromise;
    refreshPromise = null;

    if (newToken) {
      headers["Authorization"] = `Bearer ${newToken}`;
      try {
        res = await fetch(`/api${path}`, { ...options, headers });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Network error";
        reportError(message);
        return { success: false as const, error: { code: "NETWORK_ERROR", message } };
      }
    }
  }

  const json = await res.json();

  if (!json.success && json.error?.message) {
    reportError(json.error.message);
  }

  return json;
}
