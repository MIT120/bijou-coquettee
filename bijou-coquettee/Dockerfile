# Use Node.js 22 LTS
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Build-time arguments (if needed for build process)
ARG NODE_ENV=production

# Set NODE_ENV for build process
ENV NODE_ENV=${NODE_ENV}

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies needed for build)
RUN npm ci --include=dev

# Copy source code
COPY . .

# Build the application (this builds the admin panel)
# Medusa v2 builds admin to .medusa/admin directory
RUN npm run build

# Verify admin build exists and show structure
RUN echo "Checking for admin build..." && \
    if [ -d ".medusa/admin" ]; then \
      echo "✓ Admin build found in .medusa/admin" && \
      ls -la .medusa/admin/ | head -20; \
    elif [ -f ".medusa/admin/index.html" ]; then \
      echo "✓ Admin index.html found"; \
    else \
      echo "✗ Admin build not found! Listing .medusa directory:" && \
      ls -la .medusa/ 2>/dev/null || echo "No .medusa directory found" && \
      exit 1; \
    fi

# Expose port (Medusa default is 9000)
EXPOSE 9000

# Runtime environment variables should be set in DigitalOcean:
# - DATABASE_URL (required)
# - REDIS_URL (required for production - fixes MemoryStore warning)
# - JWT_SECRET (required)
# - COOKIE_SECRET (required)
# - STORE_CORS (required)
# - ADMIN_CORS (required)
# - AUTH_CORS (required)
# - STORE_URL (optional)

# Start the application
CMD ["npm", "run", "start"]

