# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Stage 2: Build Backend
FROM node:18-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ .

# Stage 3: Production Runtime
FROM node:18-alpine
WORKDIR /app

# Install nginx
RUN apk add --no-cache nginx curl

# Copy backend from backend-builder
COPY --from=backend-builder /app/backend ./backend

# Copy frontend build from frontend-builder
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose ports
EXPOSE 80 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000 || exit 1

# Start both nginx and backend server
CMD ["sh", "-c", "nginx -g 'daemon off;' & node backend/src/server.js"]