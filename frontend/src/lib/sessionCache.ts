import { authApi, type SessionData } from "./auth-api";
import { setSessionTokens } from "./sessionToken";

let cachedSession: SessionData | null | undefined;
let lastFetch = 0;
let pendingFetch: Promise<SessionData | null> | null = null;
let backgroundRefreshPromise: Promise<void> | null = null;

const CACHE_TTL_MS = 5 * 60 * 1000;
const MIN_RETRY_MS = 30 * 1000;

export async function getCachedSession(forceRefresh = false): Promise<SessionData | null> {
  const now = Date.now();
  if (!forceRefresh && cachedSession !== undefined && now - lastFetch < CACHE_TTL_MS) {
    return cachedSession;
  }
  if (!forceRefresh && cachedSession !== undefined) {
    void refreshInBackground();
    return cachedSession;
  }
  return doFetch();
}

export function invalidateSessionCache(): void {
  cachedSession = undefined;
  lastFetch = 0;
  pendingFetch = null;
}

async function doFetch(): Promise<SessionData | null> {
  if (pendingFetch) return pendingFetch;
  pendingFetch = doFetchInner();
  try {
    return await pendingFetch;
  } finally {
    pendingFetch = null;
  }
}

async function doFetchInner(): Promise<SessionData | null> {
  try {
    const session = await authApi.getSession();
    cachedSession = session;
    lastFetch = Date.now();
    if (!session) setSessionTokens(null, null);
    return session;
  } catch (error) {
    console.warn("[sessionCache] Error fetching session:", error);
    if (cachedSession !== undefined) return cachedSession;
    lastFetch = Date.now() - CACHE_TTL_MS + MIN_RETRY_MS;
    return null;
  }
}

async function refreshInBackground(): Promise<void> {
  if (backgroundRefreshPromise) return backgroundRefreshPromise;
  backgroundRefreshPromise = doFetch().then(() => undefined).finally(() => {
    backgroundRefreshPromise = null;
  });
  return backgroundRefreshPromise;
}
