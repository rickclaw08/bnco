# ============================================================================
# TokenTether - Dockerfile
# ============================================================================
#
# Lightweight Node.js container for running TokenTether.
# Uses multi-stage build to keep the final image small.
# ============================================================================

FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for better layer caching
COPY package.json package-lock.json* ./
RUN npm ci --production

# Copy source code
COPY src/ ./src/

# ============================================================================
# Production image
# ============================================================================

FROM node:20-alpine

WORKDIR /app

# Create a non-root user for security
RUN addgroup -g 1001 -S tether && \
    adduser -S tether -u 1001 -G tether

# Copy from builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/package.json ./package.json

# Create data directory for state persistence
RUN mkdir -p /app/data && chown -R tether:tether /app

# Switch to non-root user
USER tether

# Expose proxy and dashboard ports
EXPOSE 18788 18790

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "const http=require('http');http.get('http://localhost:18788/health',(r)=>{process.exit(r.statusCode===200?0:1)}).on('error',()=>process.exit(1))"

CMD ["node", "src/index.js"]
