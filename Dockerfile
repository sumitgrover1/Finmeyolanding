# syntax=docker/dockerfile:1

# Multi-stage build producing Next.js's standalone server — the final image
# carries only what is needed to run, not the toolchain.
#
# No database client, no migrations, no seed step. This app talks to the main
# site over HTTPS and holds nothing of its own, which is why the build is three
# short stages rather than five.

FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Baked in, because Next inlines NEXT_PUBLIC_* at build time. Changing which
# site this points at is a rebuild, not a restart — see docker-compose.yml,
# where they are build args for exactly that reason.
ARG NEXT_PUBLIC_API_BASE
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_COOKIE_DOMAIN
ENV NEXT_PUBLIC_API_BASE=$NEXT_PUBLIC_API_BASE
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_COOKIE_DOMAIN=$NEXT_PUBLIC_COOKIE_DOMAIN
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3100
ENV HOSTNAME=0.0.0.0

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3100

# Node's own fetch, so the image needs no curl or wget. It checks this app
# only: a health check that failed because the main site was down would get
# the container restarted for a problem restarting it cannot fix.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3100)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
