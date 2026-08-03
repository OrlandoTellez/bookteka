# Frontend Module

App de **Bookteka** con React + Vite + TypeScript, dual-target (web + Tauri desktop/Android).

## Contents

1. [1-stack](./1-stack.md) — Stack tecnológico, dual-target, build, deps principales
2. [2-design](./2-design.md) — Sistema de diseño, tokens, temas, componentes
3. [3-architecture](./3-architecture.md) — Estructura de carpetas, stores, API client, IndexedDB
4. [4-screens](./4-screens.md) — Inventario de pantallas con sus features
5. [5-quality](./5-quality.md) — Build, typecheck, testing, convenciones

## Quick start

```bash
# Desde frontend/
pnpm install
cp .env.example .env
pnpm dev                  # Vite web → http://localhost:1420
pnpm tauri dev            # Desktop (Tauri shell)
pnpm tauri android dev    # Android
pnpm build                # Build producción web
```

## Dual target

| Target | Comando | API base |
|---|---|---|
| Web dev | `pnpm dev` | `/api/v1` (proxy de Vite → `BACKEND_HOST`) |
| Web Docker | `docker compose up` | `/api/v1` (nginx proxya al backend) |
| Desktop dev | `pnpm tauri dev` | `/api/v1` (proxy de Vite) |
| Desktop prod | `pnpm tauri build` | Bootstrap remoto (`config-api.json`) o `localStorage[BOOKTEKA_API_URL]` |
| Android dev | `pnpm tauri android dev` | `VITE_BACKEND_HOST` + `/api/v1` (LAN) |
| Android prod | `pnpm tauri android build` | Bootstrap remoto |

> El arranque lo resuelve `AppBootstrap` (`context/AppBootstrap.tsx`): en dev usa el servidor local; en producción consulta el bootstrap remoto (`config-api.json`) y cae a `FALLBACK_PRODUCTION_URL` si falla. El usuario puede sobrescribir la URL desde `localStorage[BOOKTEKA_API_URL]`.

## Scripts

```jsonc
// frontend/package.json
{
  "scripts": {
    "dev": "vite",
    "production:mode": "VITE_FORCE_PRODUCTION=true pnpm tauri dev",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "tauri": "tauri"
  }
}
```
