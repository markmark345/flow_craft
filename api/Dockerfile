# syntax=docker/dockerfile:1
# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM golang:1.24-alpine AS builder

# Install git (needed by some go modules)
RUN apk add --no-cache git

WORKDIR /build

# Copy dependency manifests first for layer caching
COPY go.mod go.sum ./
RUN go mod download

# Copy source and build all binaries
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/api-server ./cmd/api-server
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/worker ./cmd/worker
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/migrate ./cmd/migrate

# ─── Stage 2: Run ─────────────────────────────────────────────────────────────
FROM alpine:3.19 AS runner

# ca-certificates required for TLS connections (Temporal, OAuth, external APIs)
RUN apk add --no-cache ca-certificates curl && \
    addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy compiled binaries
COPY --from=builder /out/api-server ./api-server
COPY --from=builder /out/worker     ./worker
COPY --from=builder /out/migrate    ./migrate

# Migrations are read from filesystem at runtime (goose reads files directly)
COPY --from=builder /build/internal/migrations ./internal/migrations

USER appuser

# Default command — overridden by docker-compose per service
CMD ["./api-server"]
