# `audit_logs`

Registro de auditoría de acciones importantes (hoy: borrado de libros). Modelo Prisma `audit_log`, mapeado a tabla `audit_logs` (`@@map("audit_logs")`).

## Esquema

| Columna | Tipo | Constraints | Descripción |
|---|---|---|---|
| `id` | `TEXT (UUID)` | `PK @default(uuid())` | — |
| `action` | `TEXT` | `NOT NULL` | Acción (e.g. `"delete_book"`). |
| `entityType` | `TEXT` | `NOT NULL` | Tipo de entidad (e.g. `"book"`). |
| `entityId` | `TEXT` | `NOT NULL` | ID de la entidad. |
| `userId` | `TEXT` | `NOT NULL` | Usuario que ejecutó la acción. |
| `metadata` | `JSONB` | NULL | Metadata extra (e.g. nombre del libro, fileKey). |
| `createdAt` | `TIMESTAMPTZ` | `NOT NULL DEFAULT now()` | — |

## Índices

- `INDEX(entityType, entityId)`.
- `INDEX(userId)`.
- `INDEX(createdAt)`.

## Relaciones

| Tabla | Tipo | FK / Referencia |
|---|---|---|
| `users` | N:1 | `audit_logs.userId → users.id` (lógica; sin constraint explícito en Prisma) |

## Reglas de negocio

- `BookService.deleteBook` registra un `audit_log` con metadata del libro eliminado **antes** de borrar.
- `DeleteBookResponse.auditId` expone el ID del log al cliente.
- Pensado para crecer a más acciones (uploads, progress, etc.).
