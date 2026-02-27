# syntax=docker/dockerfile:1
# ─── Stage 1: Install dependencies ───────────────────────────────────────────
FROM node:20-alpine AS deps

RUN corepack enable && corepack prepare pnpm@9.12.3 --activate

WORKDIR /app

# Copy manifests only — layer caches node_modules when no dep changes
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ─── Stage 2: Build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9.12.3 --activate

WORKDIR /app

# NEXT_PUBLIC_* vars are baked into the bundle at build time
# Override via --build-arg for production deployments behind a reverse proxy
ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm build

# ─── Stage 3: Run (minimal standalone image) ──────────────────────────────────
FROM node:20-alpine AS runner

ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# next build --output standalone copies only the required server files + node_modules
COPY --from=builder /app/.next/standalone ./
# Static assets must be placed alongside the standalone server
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

USER appuser

EXPOSE 3000

CMD ["node", "server.js"]
