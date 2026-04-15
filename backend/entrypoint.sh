#!/bin/sh
# Ra7ti Backend – container entrypoint
# Runs Prisma migrations then starts the NestJS application.
set -e

echo ""
echo "╔══════════════════════════════════════╗"
echo "║        Ra7ti API  –  Starting        ║"
echo "╚══════════════════════════════════════╝"
echo ""

# ── 1. Wait for PostgreSQL ────────────────────────────────────────────────────
echo "⏳  Waiting for PostgreSQL..."
until echo "SELECT 1" | npx prisma db execute --stdin > /dev/null 2>&1; do
  echo "   postgres not ready – retrying in 2s…"
  sleep 2
done
echo "✅  PostgreSQL is ready."

# ── 2. Run migrations ─────────────────────────────────────────────────────────
echo "🔄  Running database migrations…"
npx prisma migrate deploy
echo "✅  Migrations applied."

# ── 3. Start application ─────────────────────────────────────────────────────
echo "🚀  Starting NestJS on port ${PORT:-3000}…"
exec node dist/main
