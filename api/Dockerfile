FROM golang:1.24-alpine AS base
WORKDIR /app

# Allow overriding Go proxy settings for slow/blocked networks.
ARG GOPROXY=https://proxy.golang.org,https://goproxy.io,direct
ARG GOSUMDB=sum.golang.org
ENV GOPROXY=$GOPROXY
ENV GOSUMDB=$GOSUMDB

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
