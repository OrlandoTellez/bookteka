import { api, ApiError } from "./client";
import { getRefreshToken, setSessionTokens } from "@/lib/sessionToken";

export { ApiError as AuthApiError } from "./client";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  email_verified: boolean;
  phone: string | null;
  image: string | null;
  role: "user" | "admin";
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

export const authApi = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const result = await api.post<AuthResponse>("/auth/login", { email, password });
    setSessionTokens(result.accessToken, result.refreshToken);
    return result;
  },

  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const result = await api.post<AuthResponse>("/auth/register", {
      name,
      email,
      password,
    });
    setSessionTokens(result.accessToken, result.refreshToken);
    return result;
  },

  async getSession(): Promise<SessionData | null> {
    try {
      return await api.get<SessionData>("/auth/get-session");
    } catch (error) {
      if (!(error instanceof ApiError && error.status === 401)) throw error;
      if (!getRefreshToken()) return null;
      try {
        await this.refresh();
        return await api.get<SessionData>("/auth/get-session");
      } catch {
        setSessionTokens(null, null);
        return null;
      }
    }
  },

  async refresh(): Promise<AuthResponse> {
    const result = await api.post<AuthResponse>("/auth/refresh");
    setSessionTokens(result.accessToken, result.refreshToken);
    return result;
  },

  async logout(): Promise<void> {
    try {
      await api.post<{ message: string }>("/auth/logout");
    } finally {
      setSessionTokens(null, null);
    }
  },
};
