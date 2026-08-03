# Backend Module

Documentación del backend **Bookteka** — backend principal en Express (Node.js + TypeScript + Prisma + PostgreSQL).

## Contents

1. [01-stack](./01-stack.md) — Stack tecnológico y dependencias
2. [02-architecture](./02-architecture.md) — Estructura MVC + servicios + repositorios, errores
3. [03-api](./03-api.md) — Convenciones REST transversales

## Quick start

```bash
# Desde backend-express/
pnpm install
cp .env.example .env          # Configurar variables
pnpm prisma:generate          # Generar cliente Prisma
pnpm dev                      # Inicia en modo desarrollo (puerto 3000)
```

Variables de entorno requeridas (ver `src/config/env.ts`):

```
PORT=3000
DATABASE_URL=postgres://usuario:password@localhost:5432/bookteka_db?schema=public
FRONTEND_URL=http://localhost:1420
JWT_SECRET=<32+ chars>
JWT_REFRESH_SECRET=<32+ chars (distinto)>
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_ENDPOINT=...
R2_PUBLIC_DOMAIN=...
R2_BUCKET=...
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=onboarding@resend.dev
```

## Estado actual

Express es el backend **100% operativo** (auth, books, bookmarks, streak, health). `backend-rust/` está en fase de bootstrap; ver `specs/00-migration-status.md`.

## Cómo medir la cobertura

| Feature | Express (actual) | Rust (migración) |
|---|---|---|
| auth | ✅ | ❌ |
| books | ✅ | ❌ |
| bookmarks | ✅ | ❌ |
| streak | ✅ | ❌ |
| health | ✅ | ❌ |
