# 03 · Bookmarks — Marcadores

> ✅ **Implementado en Express** (`backend-express/src/routes/bookmark.routes.ts`).

Marcadores por página dentro de un libro. Un marcador pertenece a un `user_book` (relación usuario-libro), lo que garantiza que solo el dueño del libro puede listar/crear/eliminar.

**Auth**: todos los endpoints requieren sesión (`requireAuth`).

## Tabla de endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/books/:bookId/bookmarks` | Lista marcadores de un libro. |
| POST | `/books/:bookId/bookmarks` | Crea un marcador. |
| DELETE | `/books/:bookId/bookmarks/:bookmarkId` | Elimina un marcador. |

> ⚠️ El cliente (`bookmarksApi.update`) hace `PATCH /books/:bookId/bookmarks/:bookmarkId`, pero el backend **no implementa** ese endpoint hoy: los updates de marcador quedan locales en IndexedDB (el store captura el error y continúa).

---

## GET `/api/v1/books/:bookId/bookmarks`

- **Auth**: Sí.

### Response 200

```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "userBookId": "uuid",
    "name": "Capítulo 3",
    "pageNumber": 42,
    "textPreview": "En un lugar de la Mancha...",
    "createdAt": "ISO-8601"
  }
]
```

### Errores

- `403` — `No autorizado o libro no encontrado` (el usuario no tiene ese user_book).

---

## POST `/api/v1/books/:bookId/bookmarks`

- **Auth**: Sí.

### Request body

```json
{
  "name": "Capítulo 3",
  "pageNumber": 42,
  "textPreview": "En un lugar de la Mancha..."
}
```

### Response 201

```json
{
  "id": "uuid",
  "userId": "uuid",
  "userBookId": "uuid",
  "name": "Capítulo 3",
  "pageNumber": 42,
  "textPreview": "En un lugar de la Mancha...",
  "createdAt": "ISO-8601"
}
```

### Validaciones (CreateBookmarkBodySchema)

- `name`: string, min 1, máx 200.
- `pageNumber`: number, int, positivo.
- `textPreview`: string, máx 2000, opcional.

### Errores

- `400` — payload inválido (Zod).
- `403` — no autorizado / libro no encontrado.

---

## DELETE `/api/v1/books/:bookId/bookmarks/:bookmarkId`

- **Auth**: Sí.

### Response 200

```json
{ "success": true }
```

### Errores

- `403` — no autorizado / libro no encontrado.
- `404` — `Bookmark no encontrado`.

---

## Seguridad (patrón)

Todos los handlers primero buscan el `user_book` del usuario (`findUserBookAccess`). Si no existe → 403. Así se impide acceder a bookmarks de libros ajenos aunque se conozcan los IDs.

---

## Cliente (frontend)

- `bookmarksApi` (`src/api/bookmark.ts`): `list`, `create`, `remove`, `update` (PATCH no soportado por backend — fallback local).
- `bookStore.addBookmark`: guarda local y, si el libro está `isSynced`, crea en el backend y reemplaza el ID local por el del servidor.
- `bookStore.removeBookmark`: borra en backend (si isSynced) y local.
