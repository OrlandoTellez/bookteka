# Schemas — Bookteka

Esquemas de tablas de la base de datos PostgreSQL de Bookteka.

Cada archivo documenta una tabla con su esquema, columnas, constraints, índices y relaciones.

Las tablas están numeradas por orden de dependencia:

## 1. Auth (01–04)

| # | Tabla | Archivo | Descripción |
|---|---|---|---|
| 01 | `users` | [01-users.md](./01-users.md) | Usuarios (roles, soft-delete). |
| 02 | `session` | [02-sessions.md](./02-sessions.md) | Refresh tokens activos (rotación single-use). |
| 03 | `account` | [03-accounts.md](./03-accounts.md) | Cuentas de credenciales (password bcrypt). |
| 04 | `verification` | [04-verifications.md](./04-verifications.md) | Códigos de verificación de email. |

## 2. Contenido (05–07)

| # | Tabla | Archivo | Descripción |
|---|---|---|---|
| 05 | `books` | [05-books.md](./05-books.md) | Libro físico (PDF en R2), dedup por `fileHash`. |
| 06 | `user_books` | [06-user-books.md](./06-user-books.md) | Relación usuario-libro + progreso de lectura. |
| 07 | `bookmarks` | [07-bookmarks.md](./07-bookmarks.md) | Marcadores por página. |

## 3. Engagement y auditoría (08–09)

| # | Tabla | Archivo | Descripción |
|---|---|---|---|
| 08 | `user_streaks` | [08-user-streaks.md](./08-user-streaks.md) | Racha de lectura (1 por usuario). |
| 09 | `audit_logs` | [09-audit-logs.md](./09-audit-logs.md) | Auditoría de acciones (borrados de libros). |

---

> **Fuente de verdad**: `backend-express/prisma/schema.prisma` (Prisma 6).
> **Nota de naming**: los modelos Prisma son singulares (`user`, `book`) y las tablas SQL mapeadas son `users`, `books`... salvo `session`, `account`, `verification` que usan el **mismo nombre en singular** para la tabla (`@@map("session")`, `@@map("account")`, `@@map("verification")`).
