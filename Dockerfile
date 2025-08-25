# HH Attendance Tracker - Production Docker Image
FROM node:18-alpine

# Create app directory
WORKDIR /app

# Add metadata
LABEL maintainer="Hisham"
LABEL description="HH Attendance Tracker - Comprehensive attendance management system"
LABEL version="1.0.0"

# Install system dependencies
RUN apk add --no-cache curl

# Copy package files for better Docker caching
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install backend dependencies
WORKDIR /app/backend
RUN npm install --omit=dev && npm cache clean --force

# Copy and build frontend
WORKDIR /app/frontend
COPY frontend/ ./
RUN npm install && npm run build && npm cache clean --force

# Copy backend source code
WORKDIR /app/backend
COPY backend/ ./

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S attendance -u 1001 -G nodejs

# Change ownership of the app directory
RUN chown -R attendance:nodejs /app
USER attendance

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Start application
WORKDIR /app/backend
CMD ["npm", "start"]
