#!/bin/sh
# Ra7ti – Single-container entrypoint
# Runs Prisma migrations then starts all services via supervisord.
set -e

echo ""
echo "╔══════════════════════════════════════╗"
echo "║        Ra7ti  –  Starting            ║"
echo "╚══════════════════════════════════════╝"
echo ""

# ── 1. Wait for PostgreSQL ────────────────────────────────────────────────────
echo "⏳  Waiting for PostgreSQL..."
cd /app/backend
until echo "SELECT 1" | npx prisma db execute --stdin --schema=./prisma/schema.prisma > /dev/null 2>&1; do
  echo "   postgres not ready – retrying in 2s…"
  sleep 2
done
echo "✅  PostgreSQL is ready."

# ── 2. Run migrations ─────────────────────────────────────────────────────────
echo "🔄  Running database migrations…"
npx prisma migrate deploy --schema=./prisma/schema.prisma
echo "✅  Migrations applied."

# ── 3. Start all services via supervisord ────────────────────────────────────
echo "🚀  Starting backend, frontend, and nginx…"
exec supervisord -c /etc/supervisord.conf
