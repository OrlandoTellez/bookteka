-- Normalize the Better Auth credentials provider name used by the JWT login code.
UPDATE "account"
SET "provider_id" = 'credentials'
WHERE "provider_id" = 'credential';

-- Legacy Better Auth sessions use opaque tokens, while the new flow stores
-- JWT refresh tokens with three dot-separated segments. Remove only the
-- legacy sessions so they cannot be mistaken for valid JWT sessions.
DELETE FROM "session"
WHERE "token" !~ '^[^.]+\.[^.]+\.[^.]+$';
