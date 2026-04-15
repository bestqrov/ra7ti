# ╔══════════════════════════════════════════════════════════════════════╗
# ║  Ra7ti – Single-container SaaS                                       ║
# ║  nginx (port 80) → /api/* → NestJS (3000)                           ║
# ║                            /* → Next.js  (3001)                     ║
# ╚══════════════════════════════════════════════════════════════════════╝

# ── Stage 1: frontend deps ───────────────────────────────────────────────────
FROM node:20-alpine AS frontend-deps
WORKDIR /frontend
RUN apk add --no-cache libc6-compat
COPY frontend/package*.json ./
RUN npm ci --frozen-lockfile

# ── Stage 2: build backend ───────────────────────────────────────────────────
FROM node:20-alpine AS backend-builder
WORKDIR /backend
RUN apk add --no-cache libc6-compat openssl
# npm install (not ci) ensures devDeps like @nestjs/cli are always resolved
COPY backend/package*.json ./
RUN npm install
COPY backend/ .
COPY prisma/ ./prisma/
RUN npx prisma generate --schema=./prisma/schema.prisma
RUN npm run build

# ── Stage 3: build frontend ──────────────────────────────────────────────────
FROM node:20-alpine AS frontend-builder
WORKDIR /frontend
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=frontend-deps /frontend/node_modules ./node_modules
COPY frontend/ .
# /api/v1 is a relative path – nginx routes it to the backend on the same domain
ARG NEXT_PUBLIC_API_URL=/api/v1
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
RUN npm run build

# ── Stage 4: production runner ───────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# nginx + supervisor for multi-process
RUN apk add --no-cache nginx supervisor openssl

# ── Backend ──────────────────────────────────────────────────────────────────
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --omit=dev --frozen-lockfile
COPY --from=backend-builder /backend/dist            ./dist
COPY --from=backend-builder /backend/prisma          ./prisma
COPY --from=backend-builder /backend/node_modules/.prisma ./node_modules/.prisma
COPY --from=backend-builder /backend/node_modules/@prisma ./node_modules/@prisma

# ── Frontend ─────────────────────────────────────────────────────────────────
WORKDIR /app/frontend
COPY --from=frontend-builder /frontend/public             ./public
COPY --from=frontend-builder /frontend/.next/standalone   ./
COPY --from=frontend-builder /frontend/.next/static       ./.next/static

# ── Config files ─────────────────────────────────────────────────────────────
COPY docker/nginx/app.conf    /etc/nginx/http.d/default.conf
COPY docker/supervisord.conf  /etc/supervisord.conf

# ── Entrypoint ───────────────────────────────────────────────────────────────
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80

HEALTHCHECK --interval=20s --timeout=5s --start-period=60s --retries=3 \
  CMD wget -qO- http://localhost/api/v1/health || exit 1

ENTRYPOINT ["/entrypoint.sh"]
