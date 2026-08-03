# Estado de migración: Express → Rust (Axum)

**Fecha de revisión**: 2026-08-02

Resumen ejecutivo de qué hay en `backend-rust` hoy vs todo lo que existe en `backend-express` (completo y operativo). Esta tabla es la **fuente de verdad** para planear los próximos pasos de la migración.

---

## Resumen de un vistazo

| Categoría | Express (referencia) | Rust (estado actual) | % |
|---|---|---|---|
| **Features backend** | 4 (auth, books, bookmarks, streak) | 0 | 0% |
| **Endpoints HTTP** | ~19 | 1 ("hola mundo") | ~5% |
| **Modelos de DB** | 9 + enum ROLE | 0 (no hay migrations en Rust) | 0% |
| **DTOs / schemas** | 4 features (Zod) | 0 | 0% |
| **CRUD libros/marcadores/rachas** | Sí (operativo) | ❌ No | 0% |

> **Express es la fuente de verdad** y está 100% operativo. La migración a Rust está en fase de bootstrap (solo `main.rs` con una ruta raíz).

---

## Estado por feature

### ✅ Implementadas en Express (referencia)

| Feature | Endpoints | Estado |
|---|---|---|
| **auth** | register, login, refresh, logout, get-session, verify-email, resend-verification (7) | ✅ 100% |
| **books** | GET /books, POST /upload, GET /:id/download, GET /:id/stream, PATCH /:id/progress, DELETE /:id (6) | ✅ 100% |
| **bookmarks** | GET/POST /books/:bookId/bookmarks, DELETE /:bookmarkId (3) | ✅ 100% |
| **streak** | GET /streak, POST /complete, POST /initialize (3) | ✅ 100% |
| **health** | GET /api/v1/health (DB + R2) | ✅ 100% |

### ❌ Pendientes (falta implementar en Rust)

| Feature | Endpoints Express a replicar | Dificultad | Notas |
|---|---|---|---|
| **auth** | 7 (register, login, refresh, logout, get-session, verify-email, resend) | Media | JWT access 15min + refresh 7d con rotación (compare-and-delete), bcrypt, cookies + headers |
| **books** | 6 (list, upload multipart, download signed URL, stream, progress, delete) | **Alta** | Requiere integración S3/R2 + Multer equivalente + dedup por hash SHA-256 |
| **bookmarks** | 3 (list, create, delete) | Baja | Depende de user_book |
| **streak** | 3 (get, complete, initialize) | Media | Lógica de fechas/días consecutivos con timezone del cliente |
| **health** | 1 | Baja | Verificar DB + R2 |

---

## Comparación de stack

| Concern | Express (referencia) | Rust (objetivo) | Acción |
|---|---|---|---|
| Web framework | Express 5 | Axum 0.8 | Bien |
| DB driver | Prisma 6 + PostgreSQL | sqlx 0.8 | Escribir queries manuales + migraciones |
| Validation | Zod 4 | `validator` crate (derive) | Port de schemas |
| Auth | jsonwebtoken + bcrypt + sessions en DB | jsonwebtoken crate + bcrypt | Replicar rotación de refresh |
| Cookies / headers | cookie httpOnly + x-session-token/x-refresh-token | cookie crate + TypedHeader | Replicar transporte dual |
| Storage | Cloudflare R2 (aws-sdk) | `aws-sdk-s3` o `reqwest` | Pendiente de decidir |
| Email | Resend | `reqwest` a API Resend | Pendiente |
| Rate limit | express-rate-limit (4 tiers) | tower-governor | Pendiente |
| Logging | pino + pino-http | tracing + tracing-subscriber | Bien |
| CORS | cors + guard de orígenes | tower-http CorsLayer | Replicar allowlist + TRUST_BACKEND_ORIGINS |

---

## Observaciones críticas sobre la implementación actual

1. **`BETTER_AUTH_SECRET`/`BETTER_AUTH_URL` en Rust**: `backend-rust/src/shared/config/constants.rs` lee variables de un prototipo Better Auth que no existen en el diseño final (JWT propio con `JWT_SECRET`/`JWT_REFRESH_SECRET`). **Limpiar** al iniciar la migración.

2. **Puerto del backend Rust**: `main.rs` escucha en `:4000` (hardcodeado). Express usa `PORT` (3000 dev / 3001 Docker). Definir el puerto objetivo y alinearlo con CORS/nginx/compose.

3. **No hay migraciones en Rust**: Express usa Prisma migrations. Para Rust habrá que generar el DDL completo (sqlx migrate) a partir del schema Prisma.

4. **Upload de PDFs**: el flujo Express usa Multer (memoryStorage, 25MB) + `PutObjectCommand` a R2. En Rust habrá que decidir `axum::extract::Multipart` + SDK S3 o `reqwest` contra la API de R2.

5. **Deduplicación de libros**: `book.fileHash @unique` + `countOtherUsers` para decidir si borrar el objeto de R2. Replicar la lógica exacta.

6. **Stream de PDF**: Express hace proxy del `GetObjectCommand` de R2 con headers de Content-Type/Disposition/Length. Replicar con `StreamBody` de Axum.

7. **Formato de error**: Express usa `{ error, code }` (AppError) y `{ error, details }` (Zod). Elegir un shape y mantenerlo consistente en Rust.

---

## Próximos pasos recomendados (orden sugerido)

1. 🛠️ **Bootstrap**: definir `AppState { db: PgPool }`, `AppError` + `IntoResponse`, logger tracing, CORS.
2. 🛠️ **Migrar `auth`** (base de todo: register/login/refresh/logout/get-session/verify-email/resend).
3. 🛠️ **Migrar `streak`** (simple, sin storage externo — valida el patrón date/time).
4. ⚠️ **Migrar `books`** (la más compleja: multipart + R2 + dedup + stream).
5. 🛠️ **Migrar `bookmarks`** (depende de user_book).
6. ⚙️ Agregar rate limit (tower-governor), health endpoint y tests (`cargo test` + sqlx_test).

---

## Pendientes transversales

- [ ] Limpiar `BETTER_AUTH_*` de `backend-rust/src/shared/config/constants.rs`.
- [ ] Definir puerto/estructura de `.env` del backend Rust.
- [ ] Generar migración SQL completa desde `backend-express/prisma/schema.prisma`.
- [ ] Estandarizar shape de error en Rust.
- [ ] Tests desde el inicio (`cargo test`).
- [ ] Logs estructurados con `tracing::instrument` en cada handler.
