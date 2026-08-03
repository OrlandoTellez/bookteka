/**
 * Punto de entrada de autenticación.
 *
 * Re-export del módulo unificado `@/api/auth` (que usa el client.ts común)
 * para no romper los imports existentes (`@/lib/auth-api`).
 */
export * from "@/api/auth";
