# Use Node.js 22 LTS
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Build-time arguments (if needed for build process)
# These can be passed via Railway build args or will use defaults
ARG NODE_ENV=production
ARG DATABASE_URL
ARG JWT_SECRET
ARG COOKIE_SECRET
ARG STORE_CORS
ARG ADMIN_CORS
ARG AUTH_CORS
ARG STORE_URL

# Set build-time environment variables
ENV NODE_ENV=${NODE_ENV}
ENV DATABASE_URL=${DATABASE_URL}
ENV JWT_SECRET=${JWT_SECRET}
ENV COOKIE_SECRET=${COOKIE_SECRET}
ENV STORE_CORS=${STORE_CORS}
ENV ADMIN_CORS=${ADMIN_CORS}
ENV AUTH_CORS=${AUTH_CORS}
ENV STORE_URL=${STORE_URL}

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production=false

# Copy source code
COPY . .

# Build the application (this builds the admin panel)
# Medusa v2 builds admin to .medusa/admin directory
RUN echo "Building Medusa application and admin panel..." && \
    npm run build && \
    echo "Build completed. Verifying admin build..."

# Verify admin build exists (Medusa v2 admin build output location)
# The admin build should be in .medusa/admin directory with index.html
RUN if [ ! -f ".medusa/admin/index.html" ]; then \
      echo "ERROR: Admin build file .medusa/admin/index.html not found!" && \
      echo "Checking build output structure:" && \
      find .medusa -type f -name "*.html" 2>/dev/null | head -5 || echo "No HTML files found" && \
      ls -la .medusa 2>/dev/null || echo "No .medusa directory found" && \
      echo "Full directory structure:" && \
      ls -laR .medusa 2>/dev/null | head -20 || true && \
      exit 1; \
    else \
      echo "✓ Admin build verified: .medusa/admin/index.html exists" && \
      echo "Admin build directory contents:" && \
      ls -la .medusa/admin | head -10; \
    fi

# Expose port (Medusa default is 9000)
EXPOSE 9000

# Runtime environment variables are provided by DigitalOcean automatically
# These are set at container startup, not during build:
# - DATABASE_URL (required)
# - REDIS_URL (REQUIRED for production - prevents MemoryStore warning)
# - JWT_SECRET (required)
# - COOKIE_SECRET (required)
# - STORE_CORS (required)
# - ADMIN_CORS (required)
# - AUTH_CORS (required)
# - STORE_URL (optional but recommended)
# - NODE_ENV=production (should be set)
#
# IMPORTANT: REDIS_URL must be set at runtime to avoid MemoryStore warning.
# If REDIS_URL is missing or invalid, Medusa will fall back to MemoryStore
# which is not suitable for production.

# Start the application
CMD ["npm", "run", "start"]

