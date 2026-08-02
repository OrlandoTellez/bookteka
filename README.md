# Bookteka

![TypeScript](https://img.shields.io/badge/typescript-%233178C6.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/node.js-%23339933.svg?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![React](https://img.shields.io/badge/react-%2320232A.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Tauri](https://img.shields.io/badge/tauri-%23000000.svg?style=for-the-badge&logo=tauri&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![Astro](https://img.shields.io/badge/astro-%23000000.svg?style=for-the-badge&logo=astro&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Rust](https://img.shields.io/badge/rust-%23000000.svg?style=for-the-badge&logo=rust&logoColor=white)
![Prisma](https://img.shields.io/badge/prisma-%232D3748.svg?style=for-the-badge&logo=prisma&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%232496ED.svg?style=for-the-badge&logo=docker&logoColor=white)

**Bookteka** es una plataforma para gestionar y leer libros digitales con seguimiento de progreso de lectura, rachas diarias y marcadores. Disponible como app de escritorio (Tauri), app Android (Tauri WebView) y web.

## Estructura del Proyecto

Este monorepo contiene **cuatro proyectos** independientes:

```
bookteka-repo/
├── backend-express/    # API REST (Express + TypeScript + Prisma + JWT)
├── backend-rust/       # API REST (Rust — migración en progreso)
├── frontend/           # App de escritorio + Android (Tauri 2 + React + Vite)
├── landing-page/       # Página de marketing (Astro)
├── docker-compose.yml  # Orquestación completa del stack
└── .env.example        # Variables de entorno globales
```

| Proyecto | Tecnología | Propósito |
|----------|------------|-----------|
| `backend-express/` | Node.js + Express + TypeScript | API REST principal |
| `backend-rust/` | Rust | Migración del backend a Rust (en progreso) |
| `frontend/` | React 19 + Vite + Tauri 2 | App de escritorio (Windows/Linux/macOS) y Android |
| `landing-page/` | Astro + TypeScript | Página de marketing estática |

> **Nota:** la app móvil Android se genera desde el mismo `frontend/` mediante Tauri (`src-tauri/gen/android`). No hay un proyecto Expo/React Native separado.

---

## Requisitos Previos

- **Node.js** (v20 o superior)
- **pnpm** (gestor de paquetes)
  ```bash
  npm install -g pnpm
  ```
- **Docker** y **Docker Compose** (para el stack completo)
- **Rust** (solo para desarrollo del backend-rust o el build de Tauri)

---

## Inicio Rápido (Docker — stack completo)

La forma más fácil de levantar todo el proyecto:

```bash
# 1. Clonar
git clone https://github.com/orlandotellez/bookteka.git
cd BOOKTEKA-REPO

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales (JWT_SECRET, JWT_REFRESH_SECRET, R2_*, RESEND_*)

# 3. Levantar PostgreSQL + Backend + Frontend
docker compose up --build
```

Esto levanta:

- **PostgreSQL 16** en `localhost:5433`
- **Backend Express** en `localhost:3001`
- **Frontend Web** en `localhost:8081`

> El frontend en Docker se sirve con Nginx, que proxya `/api/` al backend. El build inyecta `VITE_API_URL=/api/v1`, por lo que las peticiones del navegador llegan al backend con el prefijo correcto.

---

## Instalación Manual (por proyecto)

### Backend Express

```bash
cd backend-express
cp .env.example .env     # Configurar variables
pnpm install
pnpm prisma:generate     # Generar cliente Prisma
pnpm dev                 # Iniciar en modo desarrollo (puerto 3000)
```

### Frontend (escritorio + Android)

```bash
cd frontend
cp .env.example .env
pnpm install
pnpm dev                 # Iniciar Vite en modo desarrollo (puerto 1420)

# App de escritorio (Tauri)
pnpm tauri dev

# Build Android
pnpm tauri android dev      # o: pnpm tauri android build
```

> En desarrollo, Vite proxya `/api` al backend (`BACKEND_HOST`). En Android, `apiEnv.ts` usa `VITE_BACKEND_HOST` + `/api/v1` directamente contra el backend en tu red local.

### Landing Page

```bash
cd landing-page
pnpm install
pnpm dev                 # Iniciar en modo desarrollo (puerto 4321)
```

---

## Configuración del Entorno

### Variables globales (raíz, para Docker)

```env
# Backend
PORT=3000
FRONTEND_URL=http://localhost:8081

# JWT (access + refresh)
JWT_SECRET=replace-with-at-least-32-random-characters
JWT_REFRESH_SECRET=replace-with-a-different-at-least-32-random-characters

# Cloudflare R2 (almacenamiento de PDFs)
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_ENDPOINT=...
R2_PUBLIC_DOMAIN=...
R2_BUCKET=...

# Resend (emails)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=onboarding@resend.dev
```

### Backend Express (`backend-express/.env`)

```env
PORT=3000
DATABASE_URL=postgres://usuario:password@localhost:5432/bookteka_db?schema=public
FRONTEND_URL=http://localhost:1420

JWT_SECRET=replace-with-at-least-32-random-characters
JWT_REFRESH_SECRET=replace-with-a-different-at-least-32-random-characters

R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_ENDPOINT=...
R2_PUBLIC_DOMAIN=...
R2_BUCKET=...

RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=onboarding@resend.dev
```

### Frontend (`frontend/.env`)

```env
# Prefijo de la API. Todas las rutas del backend viven bajo /api/v1.
VITE_API_URL=/api/v1

# Host del backend al que Vite proxya /api en desarrollo. VA SOLO EL HOST,
# sin ruta: apiEnv.ts y vite.config.ts añaden el prefijo solos.
BACKEND_HOST=http://localhost:3000

# Host LAN del backend para Android (la WebView no usa el proxy de Vite).
# También sin ruta: se le concatena /api/v1 automáticamente.
VITE_BACKEND_HOST=http://192.168.0.10:3000
```

> ⚠️ **Importante:** los hosts (`BACKEND_HOST`, `VITE_BACKEND_HOST`) no deben incluir `/api/v1`. Si los incluyes, se duplicará el prefijo (`/api/v1/api/...`).

---

## Scripts Disponibles

### Backend Express (`backend-express/`)

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Iniciar servidor en modo desarrollo (tsx watch) |
| `pnpm build` | Compilar TypeScript + generar Prisma |
| `pnpm start` | Iniciar servidor en producción |
| `pnpm prisma:generate` | Generar el cliente Prisma |
| `pnpm test` | Ejecutar tests (Jest + Supertest) |
| `pnpm test:watch` | Tests en modo watch |

### Frontend (`frontend/`)

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Servidor de desarrollo de Vite (puerto 1420) |
| `pnpm build` | Compilar TypeScript + Vite build |
| `pnpm preview` | Vista previa de producción |
| `pnpm tauri dev` | App de escritorio en desarrollo |
| `pnpm tauri build` | Build de la app de escritorio |
| `pnpm tauri android dev` / `build` | App Android en desarrollo / release |
| `pnpm exec vitest run` | Ejecutar tests unitarios (Vitest) |

### Landing Page (`landing-page/`)

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Iniciar servidor de desarrollo |
| `pnpm build` | Construir para producción |
| `pnpm preview` | Vista previa de producción |

---

## API Endpoints

> Todas las rutas están montadas bajo **`/api/v1`**. Ejemplo: `GET /api/v1/books`.

### Autenticación (JWT)

Autenticación propia con **JWT access (15 min) + refresh (7 días)** y rotación de refresh tokens. Las contraseñas se guardan con **bcrypt**. Los tokens se envían como cookies `httpOnly` (navegador) o por headers (`Authorization: Bearer`, `x-session-token`, `x-refresh-token` — Tauri).

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/v1/auth/register` | Registrar usuario (emite tokens) |
| `POST` | `/api/v1/auth/login` | Iniciar sesión |
| `POST` | `/api/v1/auth/refresh` | Renovar tokens (rota el refresh token) |
| `POST` | `/api/v1/auth/logout` | Cerrar sesión y revocar refresh token |
| `GET` | `/api/v1/auth/get-session` | Obtener sesión actual |
| `POST` | `/api/v1/auth/verify-email` | Verificar correo con código |
| `POST` | `/api/v1/auth/resend-verification` | Reenviar código de verificación |

### Libros (`/api/v1/books`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/v1/books` | Obtener libros del usuario |
| `POST` | `/api/v1/books/upload` | Subir libro PDF (multipart, máx. 25 MB) |
| `GET` | `/api/v1/books/:id/download` | Descargar libro (URL firmada de R2) |
| `GET` | `/api/v1/books/:id/stream` | Stream del PDF |
| `PATCH` | `/api/v1/books/:id/progress` | Actualizar progreso de lectura |
| `DELETE` | `/api/v1/books/:id` | Eliminar libro |

### Marcadores (`/api/v1/books/:bookId/bookmarks`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/v1/books/:bookId/bookmarks` | Obtener marcadores de un libro |
| `POST` | `/api/v1/books/:bookId/bookmarks` | Crear marcador |
| `DELETE` | `/api/v1/books/:bookId/bookmarks/:bookmarkId` | Eliminar marcador |

### Rachas de Lectura (`/api/v1/streak`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/v1/streak` | Obtener racha del usuario |
| `POST` | `/api/v1/streak/initialize` | Inicializar racha |
| `POST` | `/api/v1/streak/complete` | Marcar día completado |

### Health Check

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/v1/health` | Estado de la API (DB + R2) |

> Ejemplos listos para probar en `backend-express/http/` (`books.http`, `bookmarks.http`, `streaks.http`).

---

## Tecnologías Utilizadas

### Backend Express
- **Express** v5 — Framework HTTP
- **TypeScript** — Tipado estático
- **Prisma** v6 — ORM para PostgreSQL
- **Zod** v4 — Validación de esquemas
- **jsonwebtoken + bcrypt** — Autenticación JWT con rotación de refresh tokens
- **Cloudflare R2** — Almacenamiento de PDFs (S3-compatible)
- **Resend** — Envío de emails
- **Pino + pino-http** — Logging estructurado
- **Helmet** — Seguridad HTTP
- **express-rate-limit** — Rate limiting
- **Jest** + **Supertest** — Tests
- **Multer** — Upload de archivos

### Frontend
- **React** v19 — Biblioteca de UI
- **Vite** v7 — Build tool
- **Tauri** v2 — Shell de escritorio y Android
- **TypeScript** v5 — Tipado estático
- **React Router** v7 — Enrutamiento
- **Zustand** v5 — Estado global
- **React Hook Form** + **Zod** — Formularios
- **PDF.js** v5 — Renderizado de PDFs
- **IndexedDB (idb)** — Almacenamiento offline / modo local
- **Axios** — Cliente HTTP
- **Lucide React** — Iconos
- **Sonner** — Notificaciones toast
- **Vitest** + **Testing Library** — Tests
- **ESLint** — Linting

### Landing Page
- **Astro** v5 — Framework SSG
- **TypeScript** — Tipado estático
- **Prettier** — Formateo de código

---

## Rutas de la Aplicación

| Ruta | Acceso | Descripción |
|------|--------|-------------|
| `/auth/login` | Público | Inicio de sesión |
| `/auth/register` | Público | Registro de usuario |
| `/` | Protegido | Dashboard / Biblioteca |
| `/profile` | Protegido | Perfil de usuario |

### Landing Page
- `/` — Página principal de marketing

---

## Despliegue

### Docker (producción)

El `docker-compose.yml` incluye el stack completo:

```bash
cp .env.example .env
# Configurar las variables según el entorno
docker compose up -d --build
```

### Frontend — standalone

```bash
cd frontend
docker build -t bookteka-web .     # inyecta VITE_API_URL=/api/v1
docker run -p 8080:8080 bookteka-web
```

La imagen sirve `dist/` con Nginx y proxya `/api/` al backend.

### Backend Express — standalone

```bash
cd backend-express
docker build -t bookteka-api .
docker run -p 3000:3000 bookteka-api
```

### Landing Page

Sitio estático, desplegable en cualquier hosting:

```bash
cd landing-page
pnpm build
# Subir contenido de dist/
```

---

## Backend Rust (migración en progreso)

Se está migrando el backend de Express a Rust. El proyecto está en fase inicial.

```bash
cd backend-rust
cargo build
```

---

## Estructura de Archivos

### Backend Express
```
backend-express/
├── src/
│   ├── __tests__/       # Tests automatizados (Jest + Supertest)
│   ├── config/          # Configuración (env, prisma, cors, rate-limit, shutdown)
│   ├── controllers/     # Controladores de rutas
│   ├── dto/             # Data Transfer Objects
│   ├── helper/          # Utilidades
│   ├── lib/             # Auth (JWT), R2, Logger, Email
│   ├── middleware/      # Auth, validación, error handler
│   ├── repositories/    # Acceso a datos
│   ├── routes/          # Definición de rutas (auth, books, bookmarks, streak)
│   ├── schema/          # Esquemas Zod
│   ├── services/        # Lógica de negocio
│   └── server.ts        # Entry point
├── prisma/              # Esquema y migraciones Prisma
├── http/                # Endpoints listos para REST Client
├── mock/                # PDFs de prueba
├── doc/                 # Documentación técnica
├── Dockerfile
└── package.json
```

### Frontend
```
frontend/
├── src/
│   ├── __tests__/       # Tests con Vitest + Testing Library
│   ├── api/             # Cliente Axios
│   ├── components/      # Componentes React (pages, auth, modals, layout, common)
│   ├── context/         # Contextos (Theme)
│   ├── database/        # IndexedDB (idb) + sync con la API
│   ├── hooks/           # Custom hooks
│   ├── lib/             # Utilidades (auth, session, PDF, env)
│   ├── pages/           # Páginas de la app
│   ├── routes/          # Configuración de rutas (protected/public)
│   ├── store/           # Zustand stores
│   ├── types/           # Tipos TypeScript
│   ├── utils/           # Funciones auxiliares
│   └── validations/     # Esquemas Zod
├── src-tauri/           # Configuración Tauri (incluye gen/android para Android)
├── public/              # Assets públicos
├── Dockerfile
├── nginx.conf           # Configuración Nginx para producción
└── vite.config.ts
```

### Landing Page
```
landing-page/
├── src/
│   ├── components/      # Componentes reutilizables
│   ├── layouts/         # Layouts de página
│   ├── pages/           # Páginas (Astro)
│   └── sections/        # Secciones de la landing
├── public/              # Assets estáticos
├── astro.config.mjs
└── package.json
```

---

## Tests

### Backend Express
```bash
cd backend-express
pnpm test            # Ejecutar tests (Jest + Supertest)
pnpm test:watch      # Modo watch
```
Usa **Jest** + **Supertest** para tests de integración.

### Frontend
```bash
cd frontend
pnpm exec vitest run    # Ejecutar tests unitarios
```
Usa **Vitest** + **Testing Library** para tests unitarios y de componentes.

---

## Solución de Problemas

### Error de dependencias
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### El servidor no inicia
```bash
# Verificar qué proceso usa el puerto
lsof -i :3000    # Backend
lsof -i :1420    # Frontend (Vite)
lsof -i :4321    # Landing Page
```

### Errores 404 tipo `/api/v1/api/...` o `/api/auth/...`
El prefijo de la API es **`/api/v1`**. Verifica que:
1. `frontend/.env` tenga `VITE_API_URL=/api/v1`.
2. `BACKEND_HOST` y `VITE_BACKEND_HOST` **no** incluyan `/api/v1` (van solo el host y puerto).
3. Si cambiaste `.env`, reinicia el dev server (`pnpm dev`) — las variables se cargan al arrancar.

### Error de TypeScript
```bash
cd frontend
pnpm build    # Regenerar tipos
```

### Error de Prisma
```bash
cd backend-express
pnpm prisma:generate
npx prisma migrate dev
```

### Docker
```bash
# Reconstruir desde cero
docker compose down -v
docker compose build --no-cache
docker compose up
```

---

## Contribuir

1. **Fork** el repositorio
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Realiza tus cambios y haz commit (`git commit -m 'feat: añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un **Pull Request**

### Convenciones

- **ESLint** para consistencia en frontend
- **Prettier** para formato en landing-page
- **Conventional Commits**
- TypeScript strict mode habilitado

---

## Licencia

MIT. Consulta el archivo `LICENSE` para más detalles.

---

## Contacto

- ¿Encontraste un bug? [Abre un issue](https://github.com/orlandotellez/bookteka/issues)
- ¿Quieres contribuir? Revisa la sección de contribuciones arriba
