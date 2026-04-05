# syntax=docker/dockerfile:1
FROM oven/bun:alpine AS base

LABEL maintainer="mehtrics"

WORKDIR /app

# ---- Install dependencies ----
FROM base AS deps
COPY package.json bun.lock ./
COPY packages/worker/package.json ./packages/worker/
COPY packages/redis/package.json ./packages/redis/
COPY packages/db/package.json ./packages/db/
COPY packages/utils/package.json ./packages/utils/
COPY packages/env/package.json ./packages/env/

RUN bun install --frozen-lockfile

# ---- Runner ----
FROM base AS runner
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY packages/worker ./packages/worker
COPY packages/redis ./packages/redis
COPY packages/db ./packages/db
COPY packages/utils ./packages/utils
COPY packages/env ./packages/env
COPY package.json ./

WORKDIR /app/packages/worker

# Default to event worker
CMD ["bun", "src/event-worker.ts"]
