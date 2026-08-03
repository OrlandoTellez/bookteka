# API Module

Documentación de la API REST de **Bookteka** organizada por feature. Cada archivo cubre un dominio funcional con: tabla de endpoints, detalle de cada endpoint (auth, request, response, validaciones, errores).

## Base URL

```
http://localhost:3000/api/v1
```

## Convenciones transversales

- **Auth**: `Sí` requiere access token válido (cookie `accessToken`, `Authorization: Bearer`, o `x-session-token`). `No` es público.
- **Content-Type**: `application/json` salvo uploads (`multipart/form-data`) y streams (`application/pdf`).
- **Errores**: shape `{ "error": "...", "code": "..." }`. Ver `backend/03-api.md` para mapeo de status codes.
- **Versionado**: prefijo `/api/v1` obligatorio.
- **Tamaño máximo de upload**: 25 MB por PDF.

## Índice de features

| # | Feature | Descripción |
|---|---|---|
| [01-auth.md](./01-auth.md) | Autenticación | Register, login, refresh (rotación), logout, get-session, verify-email, resend. |
| [02-books.md](./02-books.md) | Libros | Lista, upload (multipart + dedup por hash), download (URL firmada), stream, progreso, delete. |
| [03-bookmarks.md](./03-bookmarks.md) | Marcadores | Lista, crear, eliminar por libro. |
| [04-streak.md](./04-streak.md) | Rachas | Get, complete day, initialize. |

## Formato de errores

| HTTP | Forma |
|---|---|
| 400 | `{ "error": "Validation failed", "details": [...] }` (Zod) |
| 401 | `{ "error": "No autorizado", "code": "UNAUTHORIZED" }` |
| 403 | `{ "error": "No es tu libro", "code": "FORBIDDEN" }` |
| 404 | `{ "error": "Libro no encontrado para este usuario", "code": "NOT_FOUND" }` |
| 409 | `{ "error": "El correo ya está registrado", "code": "CONFLICT" }` |
| 413 | `{ "error": "El archivo excede el tamaño máximo permitido (20MB)", "code": "LIMIT_FILE_SIZE" }` — ⚠️ el mensaje dice 20MB pero el límite real de Multer es 25MB (mensaje stale en el código). |
| 500 | `{ "error": "Internal Server Error", "requestId": "..." }` |

## Smoke test rápido

```bash
# 1. Health
curl http://localhost:3000/api/v1/health

# 2. Register
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Carlos","email":"carlos@demo.com","password":"MiPassword123"}' \
  -c cookies.txt

# 3. Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"carlos@demo.com","password":"MiPassword123"}' \
  -c cookies.txt

# 4. Sesión
curl http://localhost:3000/api/v1/auth/get-session -b cookies.txt

# 5. Subir PDF (multipart)
curl -X POST http://localhost:3000/api/v1/books/upload \
  -H 'x-session-token: eyJ...' \
  -F 'pdf=@mock/book.pdf' \
  -F 'title=Mi libro'

# 6. Libros
curl http://localhost:3000/api/v1/books -H 'x-session-token: eyJ...'

# 7. Racha
curl http://localhost:3000/api/v1/streak -H 'x-session-token: eyJ...'
```

> Ejemplos REST Client completos en `backend-express/http/` (`books.http`, `bookmarks.http`, `streaks.http`).
