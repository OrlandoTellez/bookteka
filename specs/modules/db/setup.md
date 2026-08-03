# Local Setup — PostgreSQL de Bookteka

Guía de configuración local de la base de datos, para desarrollo y testing.

> **Stack**: PostgreSQL 16 + Prisma 6 + Docker (opcional).

---

## Prerrequisitos

| Herramienta | Versión | Propósito |
|---|---|---|
| PostgreSQL | 16+ | Base de datos. |
| pnpm | 10+ | Package manager. |
| Docker / Docker Compose | 24+ / v2+ | (Opcional) Levantar Postgres en contenedor. |
| psql | 16+ | (Opcional) Consultas manuales. |

---

## 1. Levantar PostgreSQL con Docker

Desde la raíz del monorepo (docker-compose.yml):

```bash
docker compose up db -d
docker compose ps
```

| Variable | Valor |
|---|---|
| `POSTGRES_USER` | `bookteka` |
| `POSTGRES_PASSWORD` | `bookteka123` |
| `POSTGRES_DB` | `bookteka_db` |
| Puerto host | `5433` (→ `5432` en el contenedor) |

---

## 2. Variables de entorno

```bash
cd backend-express
cp .env.example .env
```

Editar `backend-express/.env`:

```env
PORT=3000
DATABASE_URL=postgres://bookteka:bookteka123@localhost:5433/bookteka_db?schema=public
FRONTEND_URL=http://localhost:1420
JWT_SECRET=<openssl rand -hex 32>
JWT_REFRESH_SECRET=<openssl rand -hex 32>

R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_ENDPOINT=...
R2_PUBLIC_DOMAIN=...
R2_BUCKET=...

RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=onboarding@resend.dev
```

> ⚠️ `JWT_SECRET` y `JWT_REFRESH_SECRET` deben tener **al menos 32 caracteres** (lo valida `config/env.ts`).

---

## 3. Instalar dependencias y generar cliente

```bash
pnpm install
pnpm prisma:generate
```

---

## 4. Crear DB y aplicar migraciones

```bash
npx prisma migrate dev        # aplica las migraciones + genera cliente
npx prisma studio             # (opcional) UI para explorar los datos
```

Migraciones existentes en `prisma/migrations/`:

| Migración | Propósito |
|---|---|
| `20260603152941_init` | Schema inicial. |
| `20260801000000_add_jwt_auth` | Modelos `session`/`account`/`verification` para JWT propio. |
| `20260802010336_init` | Ajustes de JWT. |
| `20260802020000_normalize_legacy_auth` | Normalización de auth legacy. |

---

## 5. Verificar conexión

```bash
psql -U bookteka -h localhost -p 5433 -d bookteka_db -c '\dt'
```

Deberías ver:

```
            List of relations
 Schema |    Name     | Type  |  Owner
--------+-------------+-------+--------
 public | account     | table | bookteka
 public | audit_logs  | table | bookteka
 public | bookmarks   | table | bookteka
 public | books       | table | bookteka
 public | session     | table | bookteka
 public | user_books  | table | bookteka
 public | user_streaks| table | bookteka
 public | users       | table | bookteka
 public | verification| table | bookteka
```

Enums (`\dT+`):

```
        List of data types
 Schema | Name | Description
--------+------+-------------
 public | ROLE | user, admin
```

---

## 6. Seed data

No hay seed oficial. Para probar el flujo completo usá la API:

```bash
# Crear usuario vía API
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Demo","email":"demo@bookteka.com","password":"DemoPassword123"}' \
  -c cookies.txt

# Verificar que el usuario quedó creado
psql -U bookteka -h localhost -p 5433 -d bookteka_db -c 'SELECT id, email, role FROM users;'
```

---

## 7. Comandos útiles

```bash
# Resetear DB completa (cuidado: borra todo)
npx prisma migrate reset

# Ver estado de migraciones
npx prisma migrate status

# Generar una nueva migración desde el schema
npx prisma migrate dev --name <nombre_descriptivo>

# Aplicar migraciones sin generar cliente
npx prisma migrate deploy
```

> NUNCA editar una migración aplicada. Cambios de schema → `prisma migrate dev --name ...`.

---

## 8. Troubleshooting

### Error: `database "bookteka_db" does not exist`

El contenedor no creó la DB. Verificar `docker compose ps` y los logs (`docker compose logs db`).

### Error: `PrismaClientInitializationError` / conexión rechazada

- Verificar que `DATABASE_URL` use el puerto `5433` (host) — no `5432` (dentro del contenedor).
- En Docker full-stack, el backend usa `db:5432` (red interna del compose).

### Error: `P2002` (unique constraint)

- `users.email` — el correo ya está registrado.
- `book.fileHash` — el PDF ya existe (es el flujo de deduplicación).

---

## 9. Backups y restore

```bash
# Backup
pg_dump -U bookteka -h localhost -p 5433 -d bookteka_db -Fc -f bookteka.dump

# Restore
pg_restore -U bookteka -h localhost -p 5433 -d bookteka_db -Fc bookteka.dump
```

> En dev, `docker volume rm` + `prisma migrate reset` es suficiente para regenerar.
