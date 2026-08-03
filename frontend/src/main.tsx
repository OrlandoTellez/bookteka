import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "@/routes/AppRoutes.tsx";
import { ThemeProvider } from "./context/ThemeContext";
import { patchFetchWithSessionToken } from "./lib/sessionToken";
import { fetchAndStoreApiUrl } from "./lib/api-config";
import { Loading } from "@/components/common/Loading";

// Inyecta el header de sesión en todas las llamadas a la API (Android dev
// no puede usar cookies cross-site; la sesión viaja por x-session-token).
patchFetchWithSessionToken();

async function bootstrap() {
  // Resuelve la URL de la API (dev → servidor local; producción → bootstrap
  // remoto de config-api.json). El client.ts la lee con readApiUrl().
  try {
    await fetchAndStoreApiUrl();
  } catch (err) {
    console.warn("[bootstrap] No se pudo resolver la URL de la API:", err);
  }
}

const root = createRoot(document.getElementById("root")!);
root.render(<Loading text="Conectando con el servidor..." />);

bootstrap().then(() => {
  root.render(
    <StrictMode>
      <BrowserRouter>
        <ThemeProvider>
          <AppRoutes />
        </ThemeProvider>
      </BrowserRouter>
    </StrictMode>,
  );
});
