#!/bin/sh
# Ra7ti – single-container entrypoint
# Runs migrations, then starts backend + frontend in background, nginx in foreground.
set -e

echo "Ra7ti – Starting"

# ── 1. Run Prisma migrations (retry until DB is reachable) ───────────────────
cd /app/backend
echo "Running migrations..."
i=0
while ! npx prisma migrate deploy --schema=./prisma/schema.prisma; do
  i=$((i + 1))
  if [ "$i" -ge 15 ]; then
    echo "Migration failed after 15 attempts – exiting"
    exit 1
  fi
  echo "  attempt $i failed, retrying in 5s..."
  sleep 5
done
echo "Migrations applied."

# ── 2. Start NestJS backend ───────────────────────────────────────────────────
PORT=3000 NODE_ENV=production node /app/backend/dist/main &
echo "Backend started (PID $!)"

# ── 3. Start Next.js frontend ─────────────────────────────────────────────────
PORT=3001 HOSTNAME=127.0.0.1 NODE_ENV=production node /app/frontend/server.js &
echo "Frontend started (PID $!)"

# ── 4. Start nginx in foreground (keeps the container alive) ─────────────────
echo "Starting nginx..."
exec nginx -g 'daemon off;'
