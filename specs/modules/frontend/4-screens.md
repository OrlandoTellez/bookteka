# Frontend Screens

Inventario completo de pantallas de Bookteka, con su propósito, estado actual y comportamiento.

---

## Convención de nombres

| Convención | Uso |
|---|---|
| Ruta pública | `/auth/login`, `/auth/register` |
| Ruta protegida | `/` (Biblioteca), `/profile` |
| Vista de lector | No es ruta — la renderiza `Layout` cuando `currentView === "reader"` |
| Estado: ✅ implementado | UI viva + flujo end-to-end |
| Estado: ⚠️ parcial | UI existe pero falta algún detalle |

---

## `/auth/login` — Login ✅

**Archivos**: `src/pages/auth/Login.tsx` + `src/components/auth/LoginForm.tsx`

**Propósito**: Inicio de sesión con email/password.

- Form con `react-hook-form` + `zodResolver(loginSchema)` (validación onBlur).
- Campo `email` + `password` (componente `Input` con label + error).
- Submit → `authApi.login(email, password)` → `invalidateAuthSession()` → `navigate("/")`.
- Errores inline (credenciales inválidas).
- Link a `/auth/register`.
- Toggle de tema (IconTheme) + logo según tema.

**Estados**: Empty / Submitting (botón "Cargando...") / Error / Success (redirect).

---

## `/auth/register` — Register ✅

**Archivos**: `src/pages/auth/Register.tsx` + `src/components/auth/RegisterForm.tsx`

**Propósito**: Crear cuenta nueva.

- Campos: `name`, `email`, `password`, `confirmPassword`.
- `zodResolver(registerSchema)` valida match de passwords.
- Submit → `authApi.register(name, email, password)` → `invalidateAuthSession()` → `navigate("/")`.
- Link a `/auth/login`.

---

## `/` — Biblioteca (Index) ✅

**Archivos**: `src/pages/Index.tsx` + `src/components/pages/index/Library.tsx`

**Propósito**: Pantalla principal con la biblioteca de libros del usuario.

**Features**:

1. **Toolbar**: búsqueda por nombre (`normalizeText`), filtro (`todos | leyendo | sin empezar`), orden (`recientes | nombre | tiempo`), toggles de vista.
2. **Vistas**: `grid` (CardBook), `list` (CardBookList), `shelf` (BookShelfView). La vista shelf muestra todos; grid/list pagan (6 por página).
3. **CardBook**: icono de libro, título (sin `.pdf`), tiempo de lectura + estado ("En progreso"/"Sin empezar"), fecha de última lectura, botón principal ("Continuar leyendo"/"Empezar a leer" → `onOpen`), indicador de sync (`Cloud`/`CloudOff` según `isSynced`), botón eliminar (trash → `DeleteModal`). Cuando el PDF se está preparando, el botón muestra "Descargando n%" con spinner (`isDownloading` + `downloadProgress`).
4. **Paginación**: `Pagination` (6 items/página), resetea a página 1 al cambiar filtros.
5. **Subir libro**: botón "Añadir libro" (header o empty state) → `ShowUploaderModal` → `addBook(name, text, totalPages, file)`.
6. **Abrir libro**: `getBookById(id)` (descarga/extrae PDF si hace falta con progreso) → `setCurrentBook` + `setCurrentView("reader")`.
7. **Empty state**: "Tu biblioteca está vacía" + CTA.

**Flujo de PDF**: si el libro viene del cloud y no tiene texto local, `getBookById` llama `processBookForReading` (stream → pdf.js → extrae texto) con overlay `"Preparando libro... {n}%"`.

---

## `/profile` — Perfil ✅

**Archivos**: `src/pages/Profile.tsx` + `src/components/pages/profile/UserProfile.tsx`

**Propósito**: Estadísticas de lectura, racha, preferencias, gestión de cloud y logout.

**Sections**:

1. **Header**: botón volver, avatar, "Mi Perfil" / "Estadísticas de lectura".
2. **CloudSyncToggle**: toggle de sincronización con la nube (`userPreferencesStore.cloudSyncEnabled`).
3. **StreakCard**: racha actual + botón "completar día" (`streakStore.completeDay`) + inicialización (`initializeStreak`).
4. **CardProfile**: perfil del usuario.
5. **ReadingSettingsCard**: preferencias de lectura por defecto (fontSize, fontFamily, lineHeight, textWidth) con reset.
6. **Stats**: 4 tarjetas — Tiempo total, Libros, En progreso, Promedio/libro.
7. **Todos los libros**: lista ordenada por tiempo de lectura, con:
   - badge de sync (`Cloud` si `isSynced`, `CloudOff` si no).
   - acción `CloudDownload` (descarga del PDF vía URL firmada) si está en nube.
   - acción `CloudUpload` (subir a la nube) si no.
   - botón editar tiempo (`EditTimeModal`).
8. **LogoutButton**: cierra sesión + limpia datos locales.

**Modals**: `EditTimeModal` (editar `readingTimeSeconds` → `setReadingTime`).

---

## Reader (vista, no ruta) ✅

**Archivos**: `src/components/pages/reader/Reader.tsx` + `TextReader.tsx`, `ReaderHeader.tsx`, `ReadingControls.tsx`, `BooksmarksPanel.tsx`, `HighlightToolbar.tsx`, `PageNavigator.tsx`, `ReadingTimer.tsx`, `StreakButton.tsx`, `StatCard.tsx`

**Propósito**: Lectura del libro con texto extraído del PDF.

**Header**:

- `ReaderHeader`: nombre del archivo, botón cerrar (vuelve a `library`), panel de bookmarks, timer (`ReadingTimer` con `sessionSeconds`), racha (`StreakButton` con `streakData` + `onCompleteDay`/`onInitialize`).
- `ReadingControls`: tipografía (fontSize, fontFamily, lineHeight, textWidth) — se persisten como preferencias por defecto.

**Cuerpo**:

- `TextReader`: renderiza el texto con párrafos, resalta highlights (`HighlightToolbar` para seleccionar texto → agregar highlight con color), navegación por página (`PageNavigator`), scroll persistido, modo zen (oculta header/controls).
- Highlights: 5 colores (`yellow | green | blue | pink | orange`), se guardan solo en IndexedDB.
- Bookmarks: panel lateral con lista, agregar desde toolbar o selección, navegar a página, editar nombre/preview, eliminar. Color aleatorio.

**Timer**: `useReadingTimer` (guarda cada 30s, al pausar, al desmontar y en `beforeunload`). Cada tick → `updateReadingTime` → coalescer de cloud.

**Persistencia en vivo**: `onScrollPositionChange` (debounce del TextReader) → `updateScrollPosition`; `onPageChange` (solo cuando la página real cambia) → `updateCurrentPage`. En `pagehide`/`visibilitychange:hidden` → `flushPendingCloudProgress(bookId, { keepalive: true })`.

---

## `/auth/*` — Auth Layout ✅

- Las páginas de auth no muestran el header (lo detecta `Layout` con `location.pathname.startsWith("/auth")`).
- Logo (según tema) + formulario + toggle de tema. Existe un componente `SideLogo` en `components/auth/` pero no lo usan `Login`/`Register` (renderizan el logo directamente).

---

## `*` — NotFound ✅

**Archivo**: `src/pages/NotFound.tsx`

Pantalla genérica 404 con link de vuelta.

---

## Patrones comunes

### Header de página

```tsx
<header className={styles.header}>
  <h1>...</h1>
  <button onClick={openAction}><Plus /> Añadir libro</button>
</header>
```

### Card de libro

```tsx
<CardBook book={book} onOpen={handleOpenBook} onDelete={handleDelete} />
```

### Loader de preparación de PDF

```tsx
<Loading text={`Preparando libro... ${pdfProgress}%`} subtext="Extrayendo texto del PDF" />
```
