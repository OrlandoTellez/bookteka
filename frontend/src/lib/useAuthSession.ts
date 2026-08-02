import { useEffect, useState } from "react";
import { getCachedSession, invalidateSessionCache } from "./sessionCache";
import type { SessionData } from "./auth-api";

export function useAuthSession() {
  const [data, setData] = useState<SessionData | null>(null);
  const [isPending, setIsPending] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsPending(true);
    getCachedSession()
      .then((session) => {
        if (!cancelled) setData(session);
      })
      .catch((reason: unknown) => {
        if (!cancelled) {
          setError(reason instanceof Error ? reason : new Error("Error de sesión"));
          setData(null);
        }
      })
      .finally(() => {
        if (!cancelled) setIsPending(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, isPending, error };
}

export function invalidateAuthSession(): void {
  invalidateSessionCache();
}
