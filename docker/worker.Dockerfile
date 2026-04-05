# syntax=docker/dockerfile:1
FROM oven/bun:alpine AS base
LABEL maintainer="mehtrics"

WORKDIR /app

# ---- Runner ----
FROM base AS runner
ENV NODE_ENV=production

COPY . .
RUN bun install

WORKDIR /app/packages/worker

# Default to event worker
CMD ["bun", "src/event-worker.ts"]
