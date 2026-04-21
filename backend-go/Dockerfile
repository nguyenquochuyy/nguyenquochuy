# ---- Build stage ----
FROM golang:1.23-alpine AS builder

WORKDIR /app

# Layer cache: chỉ re-download khi go.mod/go.sum thay đổi
COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Build nhỏ + strip debug symbols
RUN CGO_ENABLED=0 GOOS=linux go build \
    -ldflags="-s -w" \
    -trimpath \
    -o /app/server ./cmd/server

# ---- Final stage (distroless) ----
FROM gcr.io/distroless/static-debian12:nonroot

COPY --from=builder /app/server /server

EXPOSE 8080

USER nonroot:nonroot

ENTRYPOINT ["/server"]
