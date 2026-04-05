# syntax=docker/dockerfile:1
FROM oven/bun:alpine AS base
LABEL maintainer="mehtrics"

WORKDIR /app

# ---- Build the app ----
FROM base AS builder
COPY . .
RUN bun install

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
