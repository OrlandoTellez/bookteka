# `session`

Sesiones / refresh tokens activos. Modelo Prisma `session`, mapeado a tabla `session` (`@@map("session")` — nombre en singular).

Cada refresh token emitido se registra aquí. El refresh **rota**: la sesión vieja se elimina (compare-and-delete) y se crea una nueva.

## Esquema

| Columna | Tipo | Constraints | Descripción |
|---|---|---|---|
| `id` | `TEXT (UUID)` | `PK @default(uuid())` | — |
| `expires_at` | `TIMESTAMPTZ` | `NOT NULL` | Expiración del refresh token (+7 días). |
| `token` | `TEXT` | `NOT NULL @unique` | El refresh token JWT (string completo). |
| `ip_address` | `TEXT` | NULL | IP del request (de `x-forwarded-for`). |
| `user_agent` | `TEXT` | NULL | User-Agent del request. |
| `user_id` | `TEXT` | `NOT NULL` | FK → `users.id`. |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | — |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL @updatedAt` | — |

## Índices

- `UNIQUE(token)` — lookup por refresh token.
- `INDEX(user_id)`.

## Relaciones

| Tabla | Tipo | FK / Referencia |
|---|---|---|
| `users` | N:1 | `session.user_id → users.id` (ON DELETE Cascade) |

## Reglas de negocio

- **Rotación single-use**: en `refresh`, se borra la fila con `{ id, token }`; si el count borrado ≠ 1 → 401 (token ya usado — protección contra replay).
- `expires_at <= now()` → se borra y responde 401 `Sesión expirada`.
- `logout` borra todas las filas con ese token.
- Sesiones expiradas no se limpian en batch (pendiente de job).
