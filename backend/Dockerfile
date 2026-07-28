# Build Stage & Runtime for Node.js Backend API
FROM node:20-alpine AS production

WORKDIR /app

# Install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application source code
COPY . .

# Expose backend port
EXPOSE 5000

# Health check endpoint verification
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

# Start the production server
CMD ["node", "server.js"]
