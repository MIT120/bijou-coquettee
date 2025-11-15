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

# Build the application
# According to Medusa v2 docs: https://docs.medusajs.com/learn/build
# This creates .medusa/server directory with compiled code and admin dashboard
RUN npm run build 

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
# Note: When NODE_ENV=production, Medusa loads from .env.production
# For Docker, use environment variables instead of .env files

# Start the application from .medusa/server directory
# This follows the Medusa build documentation
CMD ["npm", "run", "start"]

