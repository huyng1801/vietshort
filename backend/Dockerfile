# Multi-stage Dockerfile for NestJS Backend

# ======================================
# Base stage
# ======================================
FROM node:20-alpine AS base

# Install system dependencies including OpenSSL for Prisma
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    ffmpeg \
    curl \
    openssl \
    openssl-dev \
    libc6-compat \
    && rm -rf /var/cache/apk/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# ======================================
# Development stage
# ======================================
FROM base AS development

# Install all dependencies (including dev)
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Start development server
CMD ["npm", "run", "start:dev"]

# ======================================
# Build stage
# ======================================
FROM base AS builder

# Install all dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build application
RUN npm run build

# ======================================
# Production dependencies stage
# ======================================
FROM base AS deps

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Generate Prisma client for production
RUN npx prisma generate

# ======================================
# Production stage
# ======================================
FROM node:20-alpine AS production

# Install runtime dependencies including OpenSSL for Prisma
RUN apk add --no-cache \
    ffmpeg \
    curl \
    netcat-openbsd \
    openssl \
    openssl-dev \
    libc6-compat \
    && rm -rf /var/cache/apk/*

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Set working directory
WORKDIR /app

# Copy built application
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=deps --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma

# Copy entrypoint script
COPY --chown=nestjs:nodejs docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

# Create uploads directory
RUN mkdir -p uploads && chown nestjs:nodejs uploads

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Start with entrypoint script
ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["node", "dist/main"]