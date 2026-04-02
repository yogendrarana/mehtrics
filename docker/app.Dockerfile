# syntax=docker/dockerfile:1
FROM oven/bun:1.2-alpine AS base

WORKDIR /app

# ---- Install dependencies ----
FROM base AS deps
COPY package.json bun.lock ./
COPY apps/app/package.json ./apps/app/
COPY apps/www/package.json ./apps/www/
COPY packages/ui/package.json ./packages/ui/
COPY packages/db/package.json ./packages/db/
COPY packages/auth/package.json ./packages/auth/
COPY packages/utils/package.json ./packages/utils/
COPY packages/hooks/package.json ./packages/hooks/
COPY packages/analytics/package.json ./packages/analytics/
COPY packages/env/package.json ./packages/env/

RUN bun install --frozen-lockfile

# ---- Build the app ----
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build main app (default target)
ARG APP=app
RUN bun --filter @mehtrics/${APP} build

# ---- Production runner ----
FROM base AS runner
ENV NODE_ENV=production

COPY --from=builder /app/apps/${APP:-app}/.next/standalone ./
COPY --from=builder /app/apps/${APP:-app}/.next/static ./.next/static
COPY --from=builder /app/apps/${APP:-app}/public ./public

ENV PORT 8080
EXPOSE 8080
CMD ["node", "server.js"]
