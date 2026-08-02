#!/bin/sh
set -e

echo "⏳ Esperando a PostgreSQL..."
until pg_isready -h db -U bookteka -d bookteka_db 2>/dev/null; do
  sleep 1
done
echo "✅ PostgreSQL listo"

echo "⏳ Corriendo Prisma migrations..."
npx prisma migrate deploy
echo "✅ Prisma migrations listas"

echo "🚀 Iniciando servidor..."
exec "$@"
