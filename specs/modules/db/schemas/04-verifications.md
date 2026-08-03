# `verification`

Códigos de verificación de email. Modelo Prisma `verification`, mapeado a tabla `verification` (`@@map("verification")` — nombre en singular).

## Esquema

| Columna | Tipo | Constraints | Descripción |
|---|---|---|---|
| `id` | `TEXT (UUID)` | `PK @default(uuid())` | — |
| `identifier` | `TEXT` | `NOT NULL` | Email (u otro identificador). |
| `value` | `TEXT` | `NOT NULL` | Código de 6 caracteres (A-Z0-9). |
| `expires_at` | `TIMESTAMPTZ` | `NOT NULL` | Expiración (+15 min). |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | — |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL @updatedAt` | — |

## Índices

- `INDEX(identifier)` — lookup por email.

## Relaciones

Sin FK (identificador libre por email).

## Reglas de negocio

- `createVerification(email)` borra verificaciones previas del identifier y crea una nueva (código 6 chars, 15 min).
- En dev el código se loguea en consola (`console.info`); en producción va por Resend (`lib/email.ts`).
- `verifyEmail(identifier, code)` matchea `identifier + value`; si expiró → borra y 401.
- Tras verificar → `UPDATE users.email_verified = true` + DELETE verification.
