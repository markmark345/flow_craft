FROM golang:1.21-alpine AS base
WORKDIR /app

# Install git for go modules
RUN apk add --no-cache git

# Download dependencies first for caching
COPY go.mod go.sum ./
RUN go mod download

# Copy source
COPY . .

# Build binaries (optional for faster start)
RUN go build -o /bin/api ./cmd/api-server && \
    go build -o /bin/worker ./cmd/worker

# Default to api server; compose overrides per service
CMD ["go", "run", "./cmd/api-server"]
