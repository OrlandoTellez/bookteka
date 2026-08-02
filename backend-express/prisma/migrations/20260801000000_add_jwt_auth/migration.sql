-- Migrate the legacy Better Auth tables in place when they exist.
-- This migration intentionally preserves users, sessions, accounts and
-- verification records instead of dropping or recreating those tables.

DO $$
BEGIN
  IF to_regclass('public."user"') IS NOT NULL
     AND to_regclass('public.users') IS NULL THEN
    ALTER TABLE "user" RENAME TO "users";
  END IF;
END
$$;

DO $$
BEGIN
  CREATE TYPE "ROLE" AS ENUM ('user', 'admin', 'cajero');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "phone" TEXT,
    "image" TEXT,
    "role" "ROLE" NOT NULL DEFAULT 'cajero',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='emailVerified')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='email_verified') THEN
    ALTER TABLE "users" RENAME COLUMN "emailVerified" TO "email_verified";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='createdAt')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='created_at') THEN
    ALTER TABLE "users" RENAME COLUMN "createdAt" TO "created_at";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='updatedAt')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='users' AND column_name='updated_at') THEN
    ALTER TABLE "users" RENAME COLUMN "updatedAt" TO "updated_at";
  END IF;
END
$$;

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "role" "ROLE" NOT NULL DEFAULT 'cajero';
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");
CREATE INDEX IF NOT EXISTS "users_email_idx" ON "users"("email");
CREATE INDEX IF NOT EXISTS "users_role_idx" ON "users"("role");
CREATE INDEX IF NOT EXISTS "users_deleted_at_idx" ON "users"("deleted_at");

CREATE TABLE IF NOT EXISTS "session" (
    "id" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "token" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='session' AND column_name='expiresAt')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='session' AND column_name='expires_at') THEN
    ALTER TABLE "session" RENAME COLUMN "expiresAt" TO "expires_at";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='session' AND column_name='ipAddress')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='session' AND column_name='ip_address') THEN
    ALTER TABLE "session" RENAME COLUMN "ipAddress" TO "ip_address";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='session' AND column_name='userAgent')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='session' AND column_name='user_agent') THEN
    ALTER TABLE "session" RENAME COLUMN "userAgent" TO "user_agent";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='session' AND column_name='userId')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='session' AND column_name='user_id') THEN
    ALTER TABLE "session" RENAME COLUMN "userId" TO "user_id";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='session' AND column_name='createdAt')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='session' AND column_name='created_at') THEN
    ALTER TABLE "session" RENAME COLUMN "createdAt" TO "created_at";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='session' AND column_name='updatedAt')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='session' AND column_name='updated_at') THEN
    ALTER TABLE "session" RENAME COLUMN "updatedAt" TO "updated_at";
  END IF;
END
$$;

ALTER TABLE "session" ADD COLUMN IF NOT EXISTS "expires_at" TIMESTAMPTZ;
ALTER TABLE "session" ADD COLUMN IF NOT EXISTS "user_id" TEXT;
ALTER TABLE "session" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "session" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "session" ALTER COLUMN "expires_at" SET NOT NULL;
ALTER TABLE "session" ALTER COLUMN "user_id" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "session_token_key" ON "session"("token");
CREATE INDEX IF NOT EXISTS "session_user_id_idx" ON "session"("user_id");

CREATE TABLE IF NOT EXISTS "account" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "id_token" TEXT,
    "scope" TEXT,
    "password" TEXT,
    "access_token_expires_at" TIMESTAMPTZ,
    "refresh_token_expires_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='account' AND column_name='accountId')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='account' AND column_name='account_id') THEN
    ALTER TABLE "account" RENAME COLUMN "accountId" TO "account_id";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='account' AND column_name='providerId')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='account' AND column_name='provider_id') THEN
    ALTER TABLE "account" RENAME COLUMN "providerId" TO "provider_id";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='account' AND column_name='userId')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='account' AND column_name='user_id') THEN
    ALTER TABLE "account" RENAME COLUMN "userId" TO "user_id";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='account' AND column_name='accessToken')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='account' AND column_name='access_token') THEN
    ALTER TABLE "account" RENAME COLUMN "accessToken" TO "access_token";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='account' AND column_name='refreshToken')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='account' AND column_name='refresh_token') THEN
    ALTER TABLE "account" RENAME COLUMN "refreshToken" TO "refresh_token";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='account' AND column_name='idToken')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='account' AND column_name='id_token') THEN
    ALTER TABLE "account" RENAME COLUMN "idToken" TO "id_token";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='account' AND column_name='accessTokenExpiresAt')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='account' AND column_name='access_token_expires_at') THEN
    ALTER TABLE "account" RENAME COLUMN "accessTokenExpiresAt" TO "access_token_expires_at";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='account' AND column_name='refreshTokenExpiresAt')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='account' AND column_name='refresh_token_expires_at') THEN
    ALTER TABLE "account" RENAME COLUMN "refreshTokenExpiresAt" TO "refresh_token_expires_at";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='account' AND column_name='createdAt')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='account' AND column_name='created_at') THEN
    ALTER TABLE "account" RENAME COLUMN "createdAt" TO "created_at";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='account' AND column_name='updatedAt')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='account' AND column_name='updated_at') THEN
    ALTER TABLE "account" RENAME COLUMN "updatedAt" TO "updated_at";
  END IF;
END
$$;

ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "account_id" TEXT;
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "provider_id" TEXT;
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "user_id" TEXT;
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "account" ALTER COLUMN "account_id" SET NOT NULL;
ALTER TABLE "account" ALTER COLUMN "provider_id" SET NOT NULL;
ALTER TABLE "account" ALTER COLUMN "user_id" SET NOT NULL;

CREATE INDEX IF NOT EXISTS "account_user_id_idx" ON "account"("user_id");
CREATE UNIQUE INDEX IF NOT EXISTS "account_provider_id_account_id_key" ON "account"("provider_id", "account_id");

CREATE TABLE IF NOT EXISTS "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='verification' AND column_name='expiresAt')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='verification' AND column_name='expires_at') THEN
    ALTER TABLE "verification" RENAME COLUMN "expiresAt" TO "expires_at";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='verification' AND column_name='createdAt')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='verification' AND column_name='created_at') THEN
    ALTER TABLE "verification" RENAME COLUMN "createdAt" TO "created_at";
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='verification' AND column_name='updatedAt')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='verification' AND column_name='updated_at') THEN
    ALTER TABLE "verification" RENAME COLUMN "updatedAt" TO "updated_at";
  END IF;
END
$$;

ALTER TABLE "verification" ADD COLUMN IF NOT EXISTS "expires_at" TIMESTAMPTZ;
ALTER TABLE "verification" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "verification" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "verification" ALTER COLUMN "expires_at" SET NOT NULL;
CREATE INDEX IF NOT EXISTS "verification_identifier_idx" ON "verification"("identifier");

-- Replace legacy relations with the snake_case relations expected by Prisma.
ALTER TABLE "session" DROP CONSTRAINT IF EXISTS "session_userId_fkey";
ALTER TABLE "session" DROP CONSTRAINT IF EXISTS "session_user_id_fkey";
ALTER TABLE "account" DROP CONSTRAINT IF EXISTS "account_userId_fkey";
ALTER TABLE "account" DROP CONSTRAINT IF EXISTS "account_user_id_fkey";
ALTER TABLE "user_book" DROP CONSTRAINT IF EXISTS "user_book_userId_fkey";

ALTER TABLE "session"
  ADD CONSTRAINT "session_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "account"
  ADD CONSTRAINT "account_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_book"
  ADD CONSTRAINT "user_book_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
