-- Add the legacy ROLE value only when it is not already present.
ALTER TYPE "ROLE" ADD VALUE IF NOT EXISTS 'user';
