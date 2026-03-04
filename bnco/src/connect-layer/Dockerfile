# bnco Connect Layer - Multi-stage Dockerfile
# Node 20 Alpine for minimal image size

# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Stage 2: Build (copy source)
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .

# Stage 3: Production
FROM node:20-alpine AS production
WORKDIR /app

# Security: run as non-root
RUN addgroup -g 1001 -S bnco && \
    adduser -S bnco -u 1001 -G bnco

# Copy production deps and source
COPY --from=deps --chown=bnco:bnco /app/node_modules ./node_modules
COPY --from=build --chown=bnco:bnco /app/src ./src
COPY --from=build --chown=bnco:bnco /app/package.json ./package.json
COPY --from=build --chown=bnco:bnco /app/migrations ./migrations

# Ensure all files are readable
RUN chmod -R a+r /app/src /app/migrations /app/package.json

# Set environment defaults
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

USER bnco

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

CMD ["node", "src/index.js"]
