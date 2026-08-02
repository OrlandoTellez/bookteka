import { API_BASE } from "./apiEnv";
import { getRefreshToken, setSessionTokens } from "./sessionToken";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  email_verified: boolean;
  phone: string | null;
  image: string | null;
  role: "admin" | "cajero";
  created_at: string;
  updated_at: string;
}

export interface SessionData {
  user: AuthUser;
  session: {
    id: string;
    token: string;
    expiresAt: string;
    userId: string;
  };
}

export interface AuthResponse {
  message: string;
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

class AuthApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "AuthApiError";
    this.status = status;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}/auth${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
    credentials: "include",
  });

  const body = (await response.json().catch(() => ({}))) as {
    error?: string;
    message?: string;
  } & T;
  if (!response.ok) {
    throw new AuthApiError(
      response.status,
      body.error ?? body.message ?? "Error de autenticación",
    );
  }
  return body;
}

export const authApi = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const result = await request<AuthResponse>("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setSessionTokens(result.accessToken, result.refreshToken);
    return result;
  },

  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const result = await request<AuthResponse>("/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    setSessionTokens(result.accessToken, result.refreshToken);
    return result;
  },

  async getSession(): Promise<SessionData | null> {
    try {
      return await request<SessionData>("/get-session");
    } catch (error) {
      if (!(error instanceof AuthApiError && error.status === 401)) throw error;
      if (!getRefreshToken()) return null;
      try {
        await this.refresh();
        return await request<SessionData>("/get-session");
      } catch {
        setSessionTokens(null, null);
        return null;
      }
    }
  },

  async refresh(): Promise<AuthResponse> {
    const result = await request<AuthResponse>("/refresh", {
      method: "POST",
    });
    setSessionTokens(result.accessToken, result.refreshToken);
    return result;
  },

  async logout(): Promise<void> {
    try {
      await request<{ message: string }>("/logout", { method: "POST" });
    } finally {
      setSessionTokens(null, null);
    }
  },
};

export { AuthApiError };
