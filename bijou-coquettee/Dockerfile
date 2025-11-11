# Use Node.js 20 LTS
FROM node:22-alpine

# Set working directory
WORKDIR /app

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

# Start the application
CMD ["npm", "run", "start"]

