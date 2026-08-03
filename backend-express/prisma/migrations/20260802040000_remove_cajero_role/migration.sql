-- Remove the 'cajero' ROLE value: only 'user' and 'admin' remain, with
-- 'user' as the column default. PostgreSQL cannot drop a single enum value
-- in place, so the type is recreated without it.
BEGIN;

-- 1. Migrar datos existentes: cualquier 'cajero' pasa a 'user'.
UPDATE "users" SET "role" = 'user' WHERE "role" = 'cajero';

-- 2. Crear el nuevo tipo sin 'cajero'.
CREATE TYPE "ROLE_new" AS ENUM ('user', 'admin');

-- 3. Reapuntar la columna al nuevo tipo (sin default de por medio).
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "ROLE_new" USING ("role"::text::"ROLE_new");

-- 4. Renombrar y descartar el tipo viejo.
ALTER TYPE "ROLE" RENAME TO "ROLE_old";
ALTER TYPE "ROLE_new" RENAME TO "ROLE";
DROP TYPE "ROLE_old";

-- 5. El default pasa a ser 'user'.
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'user';

COMMIT;
