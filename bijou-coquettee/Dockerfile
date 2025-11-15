# Use Node.js 22 LTS
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (dev deps needed for build)
RUN npm ci --include=dev

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Verify admin build exists
RUN test -f .medusa/server/public/admin/index.html || (echo "Admin build missing!" && exit 1)

# Expose port
EXPOSE 9000

# Start from root - medusa start will use the build in .medusa/server
CMD ["npx", "medusa", "start"]
