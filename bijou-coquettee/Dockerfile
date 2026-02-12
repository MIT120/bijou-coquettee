# ============================================
# Stage 1: Builder - Install deps and build
# ============================================
# Using debian-slim instead of alpine - faster native module compilation
FROM node:22-slim AS builder

# Build arguments for environment variables
ARG DATABASE_URL
ARG REDIS_URL
ARG STORE_CORS
ARG ADMIN_CORS
ARG AUTH_CORS
ARG JWT_SECRET
ARG COOKIE_SECRET
ARG NODE_ENV=production

# Set environment variables
ENV DATABASE_URL=$DATABASE_URL
ENV REDIS_URL=$REDIS_URL
ENV STORE_CORS=$STORE_CORS
ENV ADMIN_CORS=$ADMIN_CORS
ENV AUTH_CORS=$AUTH_CORS
ENV JWT_SECRET=$JWT_SECRET
ENV COOKIE_SECRET=$COOKIE_SECRET
ENV NODE_ENV=$NODE_ENV

# Set working directory
WORKDIR /app

# Copy package files first for better layer caching
COPY package*.json ./

# Install all dependencies (dev deps needed for build)
# Use Cloudflare's npm mirror for faster downloads
RUN npm config set registry https://registry.npmmirror.com && \
    npm ci

# Copy source code (this layer will be invalidated on code changes)
COPY . .

# Build the application
# Creates .medusa/server with compiled code and admin at .medusa/server/public/admin
RUN npm run build

# ============================================
# Stage 2: Runtime - Production image
# ============================================
FROM node:22-slim AS runtime

# Build arguments for environment variables
ARG DATABASE_URL
ARG REDIS_URL
ARG STORE_CORS
ARG ADMIN_CORS
ARG AUTH_CORS
ARG JWT_SECRET
ARG COOKIE_SECRET
ARG NODE_ENV=production

# Set environment variables
ENV DATABASE_URL=$DATABASE_URL
ENV REDIS_URL=$REDIS_URL
ENV STORE_CORS=$STORE_CORS
ENV ADMIN_CORS=$ADMIN_CORS
ENV AUTH_CORS=$AUTH_CORS
ENV JWT_SECRET=$JWT_SECRET
ENV COOKIE_SECRET=$COOKIE_SECRET
ENV NODE_ENV=$NODE_ENV

# Set working directory
WORKDIR /app

# Copy only the built application from builder stage
COPY --from=builder /app/.medusa/server ./.medusa/server

# According to Medusa docs: https://docs.medusajs.com/learn/build
# After build, you must:
# 1. Change to .medusa/server directory
# 2. Install dependencies in that directory (it has its own package.json)
# 3. Start from that directory
WORKDIR /app/.medusa/server

# Install production dependencies only
RUN npm config set registry https://registry.npmmirror.com && \
    npm ci --omit=dev

# Expose port
EXPOSE 9000

# Start the application from .medusa/server directory
CMD ["npm", "run", "start"]