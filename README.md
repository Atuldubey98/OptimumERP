# Optimum ERP Deployment Guide

## Project Brief

Optimum ERP is a full-stack ERP platform for managing business operations such as users, organizations, invoicing, purchases, expenses, reports, and settings.

Tech stack:
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB
- Scheduler: Background cron service
- Deployment: Docker Compose

## Deployment Steps

1. Prerequisites
- Install Docker
- Install Docker Compose plugin

2. Open project directory
```bash
cd /home/atul/Development/OptimumERP
```

3. Create environment file
- Create .env in project root.
- Use env.txt as reference.
- Set required values for:
  - MONGO_URI
  - SESSION_SECRET
  - NODE_MAILER_USER_NAME
  - NODE_MAILER_APP_PASSWORD
  - NODE_MAILER_HOST
  - VITE_APP_URL
  - VITE_API_URL

4. Start all services
```bash
docker compose up -d --build
```

5. Verify services
```bash
docker compose ps
```

6. Verify backend health
```bash
curl http://localhost:3000/api/v1/health
```

7. Access application
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api/v1

## Common Commands

Restart services:
```bash
docker compose restart
```

Stop services:
```bash
docker compose down
```

View logs:
```bash
docker compose logs -f
```

## Production Notes

- Keep .env secrets private.
- Use HTTPS with reverse proxy for production.
- Back up MongoDB data volume regularly.
- Rotate credentials periodically.
