import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "@/routes/AppRoutes.tsx";
import { ThemeProvider } from "./context/ThemeContext";
import { AppBootstrap } from "./context/AppBootstrap";
import { patchFetchWithSessionToken } from "./lib/sessionToken";

// Inyecta el header de sesión en todas las llamadas a la API (Android dev
// no puede usar cookies cross-site; la sesión viaja por x-session-token).
patchFetchWithSessionToken();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppBootstrap>
      <BrowserRouter>
        <ThemeProvider>
          <AppRoutes />
        </ThemeProvider>
      </BrowserRouter>
    </AppBootstrap>
  </StrictMode>,
);
