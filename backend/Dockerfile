# ╔══════════════════════════════════════════════════════════════════╗
# ║  Ra7ti – Backend (NestJS)                                        ║
# ║  Build context: project root  (docker-compose sets context: .)   ║
# ╚══════════════════════════════════════════════════════════════════╝

# ── Stage 1: deps ────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

# Install native build tools (needed for bcryptjs, etc.)
RUN apk add --no-cache libc6-compat

COPY backend/package*.json ./
RUN npm ci --frozen-lockfile

# ── Stage 2: builder ─────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY backend/ .
# Prisma schema lives in project root /prisma
COPY prisma/ ./prisma/

# Generate client for the target OS (Alpine)
RUN npx prisma generate --schema=./prisma/schema.prisma

# Compile TypeScript
RUN npm run build

# ── Stage 3: runner (production) ─────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Non-root user for security
RUN addgroup -S nestjs && adduser -S nestjs -G nestjs

# Production dependencies only
COPY backend/package*.json ./
RUN npm ci --omit=dev --frozen-lockfile

# Compiled output + Prisma artifacts
COPY --from=builder /app/dist              ./dist
COPY --from=builder /app/prisma            ./prisma
COPY --from=builder /app/node_modules/.prisma  ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma  ./node_modules/@prisma

# Entrypoint script (runs migrations then boots)
COPY backend/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

USER nestjs
EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/v1/health || exit 1

ENTRYPOINT ["/entrypoint.sh"]
