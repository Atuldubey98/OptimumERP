FROM node:20-alpine

# Install nginx
RUN apk add --no-cache nginx bash

WORKDIR /app

# Backend deps
COPY backend/package*.json ./backend/
RUN cd backend && npm ci

# Frontend deps + build
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm ci

COPY frontend ./frontend
RUN cd frontend && npm run build

COPY backend ./backend

# Nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy frontend build to nginx
RUN mkdir -p /usr/share/nginx/html
RUN cp -r frontend/dist/* /usr/share/nginx/html/

EXPOSE 80 3000

# Start BOTH backend & nginx
CMD sh -c "cd /app/backend && npm start & nginx -g 'daemon off;'"