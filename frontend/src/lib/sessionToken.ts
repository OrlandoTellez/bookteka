/**
 * Transporte de tokens JWT para Tauri.
 *
 * En Android la WebView puede llamar al backend por LAN y no debe depender
 * de cookies cross-site. El access token viaja en x-session-token y el
 * refresh token en x-refresh-token; el backend los valida como JWT.
 */
import { API_BASE } from "./apiEnv";

const ACCESS_TOKEN_KEY = "bookteka.access_token";
const REFRESH_TOKEN_KEY = "bookteka.refresh_token";
const ACCESS_HEADER = "x-session-token";
const REFRESH_HEADER = "x-refresh-token";

export function getSessionToken(): string | null {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getRefreshToken(): string | null {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setSessionTokens(accessToken: string | null, refreshToken: string | null): void {
  try {
    if (accessToken) localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    else localStorage.removeItem(ACCESS_TOKEN_KEY);

    if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    else localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    // localStorage no disponible.
  }
}

/** Compatibilidad local para llamadas existentes que sólo limpian el access token. */
export function setSessionToken(token: string | null): void {
  setSessionTokens(token, token ? getRefreshToken() : null);
}

function isApiRequest(input: RequestInfo | URL): boolean {
  try {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.href
          : input.url;
    return url.startsWith(API_BASE) || url.startsWith("/api");
  } catch {
    return false;
  }
}

/** Inyecta ambos JWT en las requests a la API una sola vez. */
export function patchFetchWithSessionToken(): void {
  if (typeof window === "undefined") return;
  const marker = window as unknown as { __sessionTokenPatched?: boolean };
  if (marker.__sessionTokenPatched) return;
  marker.__sessionTokenPatched = true;

  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const headers = new Headers(init?.headers);
    if (isApiRequest(input)) {
      const accessToken = getSessionToken();
      const refreshToken = getRefreshToken();
      if (accessToken && !headers.has(ACCESS_HEADER)) headers.set(ACCESS_HEADER, accessToken);
      if (refreshToken && !headers.has(REFRESH_HEADER)) headers.set(REFRESH_HEADER, refreshToken);
    }
    return originalFetch(input, { ...init, headers });
  };
}
