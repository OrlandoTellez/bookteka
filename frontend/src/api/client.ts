import { readApiUrl } from "@/lib/api-config";
import { crossFetch } from "@/lib/fetch";
import { getRefreshToken, getSessionToken } from "@/lib/sessionToken";

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, data: unknown) {
    const message = extractErrorMessage(data) ?? `HTTP ${status}`;
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

function extractErrorMessage(data: unknown): string | null {
  if (typeof data === "object" && data !== null) {
    const record = data as Record<string, unknown>;
    if (typeof record.error === "string") return record.error;
    if (typeof record.message === "string") return record.message;
    if (Array.isArray(data) && data.length > 0 && "message" in data[0]) {
      return String((data[0] as Record<string, unknown>).message);
    }
  }
  return null;
}

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  const accessToken = getSessionToken();
  const refreshToken = getRefreshToken();
  if (accessToken) headers["x-session-token"] = accessToken;
  if (refreshToken) headers["x-refresh-token"] = refreshToken;
  return headers;
}

export interface RequestOptions {
  params?: Record<string, string | number | boolean | undefined>;
  headers?: Record<string, string>;
  keepalive?: boolean;
  signal?: AbortSignal;
}

interface RequestInternalOptions extends RequestOptions {
  raw?: boolean;
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  options: RequestInternalOptions = {},
): Promise<T> {
  const url = new URL(`${readApiUrl()}${path}`);

  if (options.params) {
    for (const [key, val] of Object.entries(options.params)) {
      if (val !== undefined) url.searchParams.set(key, String(val));
    }
  }

  const isFormData = body instanceof FormData;
  const headers: Record<string, string> = {
    ...getAuthHeaders(),
    ...options.headers,
  };

  if (body !== undefined && !isFormData) {
    headers["Content-Type"] = "application/json";
  }

  // FormData, binarios (raw) y keepalive van por fetch nativo: el bridge de
  // Tauri no soporta multipart ni arrayBuffer. En web es idéntico a crossFetch.
  const useNativeFetch = isFormData || options.raw || options.keepalive;

  let res: Response;
  try {
    const init: RequestInit = {
      method,
      headers,
      credentials: "include",
      body:
        isFormData
          ? (body as FormData)
          : body !== undefined
            ? JSON.stringify(body)
            : undefined,
    };
    if (options.keepalive) init.keepalive = true;
    if (options.signal) init.signal = options.signal;

    res = useNativeFetch
      ? await globalThis.fetch(url.toString(), init)
      : await crossFetch(url.toString(), init);
  } catch (err) {
    console.error(`[API] ${method} ${path} failed:`, err);
    throw new ApiError(0, {
      message: "Error al conectar con el servidor",
    });
  }

  if (options.raw) return res as unknown as T;

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(res.status, data);
  }

  return data as T;
}

export const api = {
  get: <T>(path: string, params?: RequestOptions["params"]) =>
    request<T>("GET", path, undefined, { params }),

  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("POST", path, body, options),

  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("PUT", path, body, options),

  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("PATCH", path, body, options),

  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>("DELETE", path, undefined, options),

  /** Devuelve la Response nativa (binarios, streams, blobs). */
  raw: (path: string, options?: RequestOptions) =>
    request<Response>("GET", path, undefined, { ...options, raw: true }),
};
