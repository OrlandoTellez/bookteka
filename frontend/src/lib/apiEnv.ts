/**
 * Resolución del base URL de la API según la plataforma.
 * En Android se usa la URL LAN del backend para evitar problemas del proxy
 * de la WebView; en desktop se mantienen URLs relativas de Vite.
 */

function isAndroidWebView(): boolean {
  return typeof window !== "undefined" && window.location.hostname === "tauri.localhost";
}

const LAN_BACKEND = (import.meta.env.VITE_BACKEND_HOST ?? "")
  .trim()
  .replace(/\/+$/, "");

const RELATIVE_API = (import.meta.env.VITE_API_URL ?? "/api/v1").trim() || "/api/v1";

export const API_BASE: string =
  isAndroidWebView() && LAN_BACKEND
    ? `${LAN_BACKEND}${RELATIVE_API}`
    : RELATIVE_API;
