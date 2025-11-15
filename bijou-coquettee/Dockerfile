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
# Creates .medusa/server with compiled code and admin at .medusa/server/public/admin
RUN npm run build

# Verify admin build exists
RUN test -f .medusa/server/public/admin/index.html || (echo "Admin build missing!" && exit 1)

# According to Medusa docs: https://docs.medusajs.com/learn/build
# After build, you must:
# 1. Change to .medusa/server directory
# 2. Install dependencies in that directory (it has its own package.json)
# 3. Start from that directory
WORKDIR /app/.medusa/server

# Install production dependencies in the build directory
RUN npm install

# Expose port
EXPOSE 9000

# Start the application from .medusa/server directory
CMD ["npm", "run", "start"]
