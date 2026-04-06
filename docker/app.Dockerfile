# syntax=docker/dockerfile:1
ARG APP=app
FROM oven/bun:alpine AS base
LABEL maintainer="mehtrics"

WORKDIR /app

# ---- Install dependencies ----
FROM base AS deps
COPY package.json bun.lock ./
COPY apps/app/package.json ./apps/app/
COPY packages/ui/package.json ./packages/ui/
COPY packages/db/package.json ./packages/db/
COPY packages/auth/package.json ./packages/auth/
COPY packages/utils/package.json ./packages/utils/
COPY packages/hooks/package.json ./packages/hooks/
COPY packages/env/package.json ./packages/env/
COPY packages/worker/package.json ./packages/worker/
COPY packages/redis/package.json ./packages/redis/

RUN bun install

# ---- Build the app ----
FROM base AS builder
# Copy root node_modules from deps stage (hoisted packages)
COPY --from=deps /app/node_modules ./node_modules
# Copy full source
COPY . .
# Re-run bun install so workspace-level node_modules (e.g. apps/app/node_modules/.bin/next) are created
RUN bun install

# Build main app (default target)
ARG APP
ENV NODE_OPTIONS="--max-old-space-size=2048"
ENV SKIP_ENV_VALIDATION=1
RUN bun --filter @mehtrics/${APP} build

# ---- Production runner ----
FROM base AS runner
ARG APP
ENV NODE_ENV=production

COPY --from=builder /app/apps/${APP}/.next/standalone ./
COPY --from=builder /app/apps/${APP}/.next/static ./apps/${APP}/.next/static
COPY --from=builder /app/apps/${APP}/public ./apps/${APP}/public

ENV PORT=8080
EXPOSE 8080
CMD ["node", "apps/app/server.js"]
