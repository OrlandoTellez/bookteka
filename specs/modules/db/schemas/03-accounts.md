# `account`

Cuentas de autenticación por usuario. Modelo Prisma `account`, mapeado a tabla `account` (`@@map("account")` — nombre en singular).

Sigue el patrón Better Auth (multi-provider), pero hoy solo se usa el provider `credentials` con password bcrypt.

## Esquema

| Columna | Tipo | Constraints | Descripción |
|---|---|---|---|
| `id` | `TEXT (UUID)` | `PK @default(uuid())` | — |
| `account_id` | `TEXT` | `NOT NULL` | ID de la cuenta (hoy = `user_id`). |
| `provider_id` | `TEXT` | `NOT NULL` | Provider: `credentials`. |
| `user_id` | `TEXT` | `NOT NULL` | FK → `users.id`. |
| `access_token` | `TEXT` | NULL | (No usado con provider credentials.) |
| `refresh_token` | `TEXT` | NULL | (No usado con provider credentials.) |
| `id_token` | `TEXT` | NULL | (No usado.) |
| `scope` | `TEXT` | NULL | (No usado.) |
| `password` | `TEXT` | NULL | **Hash bcrypt** de la password (solo provider credentials). |
| `access_token_expires_at` | `TIMESTAMPTZ` | NULL | (No usado.) |
| `refresh_token_expires_at` | `TIMESTAMPTZ` | NULL | (No usado.) |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | — |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL @updatedAt` | — |

## Índices

- `UNIQUE(provider_id, account_id)`.
- `INDEX(user_id)`.

## Relaciones

| Tabla | Tipo | FK / Referencia |
|---|---|---|
| `users` | N:1 | `account.user_id → users.id` (ON DELETE Cascade) |

## Reglas de negocio

- `register` crea `account_id = user_id` + `provider_id = "credentials"` + `password = bcrypt(password, 10)` en la misma transacción.
- `login` hace `bcrypt.compare` contra `account.password` del provider `credentials`.
- **NUNCA** devolver `password` ni `refresh_token` al cliente.
