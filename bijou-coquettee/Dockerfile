# Use Node.js 22 LTS
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Build-time arguments (if needed for build process)
# These can be passed via Railway build args or will use defaults
ARG NODE_ENV=production
ARG BUILD_DATE
ARG VCS_REF

# Set build-time environment variables
ENV NODE_ENV=${NODE_ENV}

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production=false

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port (Medusa default is 9000)
EXPOSE 9000

# Runtime environment variables are provided by Railway automatically
# These are set at container startup, not during build:
# - DATABASE_URL
# - JWT_SECRET
# - COOKIE_SECRET
# - STORE_CORS
# - ADMIN_CORS
# - AUTH_CORS
# - STORE_URL
# - Any other variables configured in Railway dashboard

# Start the application
CMD ["npm", "run", "start"]

