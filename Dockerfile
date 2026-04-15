# ╔══════════════════════════════════════════════════════════════════════╗
# ║  Ra7ti – Single-container SaaS                                       ║
# ║  nginx (port 80) → /api/* → NestJS (3000)                           ║
# ║                            /* → Next.js  (3001)                     ║
# ╚══════════════════════════════════════════════════════════════════════╝

# ── Stage 1: build backend ───────────────────────────────────────────────────
FROM node:20-alpine AS backend-builder
WORKDIR /backend
RUN apk add --no-cache libc6-compat openssl

COPY backend/package*.json ./
# Coolify sets NODE_ENV=production which causes npm to skip devDependencies.
# Override so @nestjs/cli, typescript, etc. are installed for the build.
RUN NODE_ENV=development npm install

COPY backend/ .
RUN npx prisma generate
RUN npm run build

# ── Stage 2: build frontend ──────────────────────────────────────────────────
FROM node:20-alpine AS frontend-builder
WORKDIR /frontend
RUN apk add --no-cache libc6-compat
ENV NEXT_TELEMETRY_DISABLED=1

COPY frontend/package*.json ./
# Same issue: override NODE_ENV so tailwindcss, postcss, typescript etc. install
RUN NODE_ENV=development npm install

COPY frontend/ .
# /api/v1 is relative – nginx on the same container routes it to the backend
ARG NEXT_PUBLIC_API_URL=/api/v1
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
RUN NODE_ENV=development npm run build

# ── Stage 3: production runner ───────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# nginx for reverse-proxying frontend ↔ backend
RUN apk add --no-cache nginx openssl

# ── Backend (prod deps only) ──────────────────────────────────────────────────
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --omit=dev --frozen-lockfile
COPY --from=backend-builder /backend/dist                  ./dist
COPY --from=backend-builder /backend/prisma                ./prisma
COPY --from=backend-builder /backend/node_modules/.prisma  ./node_modules/.prisma
COPY --from=backend-builder /backend/node_modules/@prisma  ./node_modules/@prisma

# ── Frontend (standalone Next.js output) ──────────────────────────────────────
WORKDIR /app/frontend
COPY --from=frontend-builder /frontend/public              ./public
COPY --from=frontend-builder /frontend/.next/standalone    ./
COPY --from=frontend-builder /frontend/.next/static        ./.next/static

# ── nginx config ──────────────────────────────────────────────────────────────
COPY docker/nginx/app.conf /etc/nginx/http.d/default.conf

# ── Entrypoint ────────────────────────────────────────────────────────────────
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80

HEALTHCHECK --interval=20s --timeout=5s --start-period=60s --retries=3 \
  CMD wget -qO- http://localhost/api/v1/health || exit 1

ENTRYPOINT ["/entrypoint.sh"]
