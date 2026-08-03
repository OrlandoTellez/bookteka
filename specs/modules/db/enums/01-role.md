# `ROLE`

Roles de usuario en el sistema.

> Definido en Prisma como `enum ROLE` (SQL: `CREATE TYPE "ROLE" AS ENUM ('user', 'admin')`) y referenciado por `users.role`.

| Valor | Descripción |
|---|---|
| `user` | **Default** del schema. Es el rol que crea `register`. |
| `admin` | Sin uso funcional hoy (no hay rutas admin ni guards de rol). |

## Tablas que lo usan

- [`users`](../schemas/01-users.md) — columna `role ROLE NOT NULL DEFAULT 'user'`.

## Reglas

- `register` crea el usuario con `role: "user"` (no se puede elegir rol en el register).
- No hay endpoints que distingan roles en la app actual.
- El valor `cajero` fue removido del enum (migración `20260802040000_remove_cajero_role`); los usuarios que lo tenían pasaron a `user`.
- Al implementar roles reales, definir qué acciones distingue `admin` y agregar guards.
