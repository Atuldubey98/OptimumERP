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

2. Clone repository
```bash
git clone https://github.com/Atuldubey98/OptimumERP.git
```

3. Open project directory
```bash
cd OptimumERP
```

4. Create environment file
- Create .env in project root.
- Use env.txt as reference.
- Add only these keys in .env:

```dotenv
MONGO_URI=mongodb://mongo:27017/mernapp?replicaSet=rs0
SESSION_SECRET=SESSION_SECRET
VITE_API_URL=http://localhost:3000
IMPORT_CRON_SCHEDULE=*/5 * * * *
LOG_FILE_PATH=./logs/app.log
DEFAULT_USER_PLAN=platinum
NETWORK_STORAGE_PATH=./uploads
```

5. Start all services
```bash
docker compose up -d --build
```

6. Verify services
```bash
docker compose ps
```

7. Verify backend health
```bash
curl http://localhost:3000/api/v1/health
```

8. Access application
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
