# Docker Setup Guide

This guide helps you set up the UniShop project using Docker with MongoDB on a new machine.

## Prerequisites

- Docker Desktop installed on your machine
- Git (to clone the repository)

## Quick Setup (5 minutes)

### 1. Clone the repository
```bash
git clone <repository-url>
cd doan
```

### 2. Create .env file
```bash
cp .env.example .env
```

The .env file is already configured for Docker with MongoDB. No changes needed for local development.

### 3. Start all services
```bash
docker-compose up -d
```

This will start:
- MongoDB (port 27017)
- Backend API (port 8080)
- Frontend (port 3000)

### 4. Access the application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- MongoDB: mongodb://admin:password123@localhost:27017

## Useful Commands

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f mongodb
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Stop services
```bash
docker-compose down
```

### Stop and remove volumes (deletes data)
```bash
docker-compose down -v
```

### Restart services
```bash
docker-compose restart
```

### Rebuild after code changes
```bash
docker-compose up -d --build
```

## Database Management

### Access MongoDB shell
```bash
docker exec -it unishop-mongodb mongosh -u admin -p password123 --authenticationDatabase admin
```

### Backup database
```bash
docker exec unishop-mongodb mongodump -u admin -p password123 --authenticationDatabase admin --db unishop --archive=/data/db/backup.gz
docker cp unishop-mongodb:/data/db/backup.gz ./backup.gz
```

### Restore database
```bash
docker cp ./backup.gz unishop-mongodb:/data/db/backup.gz
docker exec unishop-mongodb mongorestore -u admin -p password123 --authenticationDatabase admin --db unishop --archive=/data/db/backup.gz
```

## Troubleshooting

### Port already in use
If port 27017, 8080, or 3000 is already in use, edit `docker-compose.yml` to change the ports:
```yaml
ports:
  - "27018:27017"  # Change host port
```

### Permission issues
On Linux/Mac, you might need to fix permissions:
```bash
sudo chown -R $USER:$USER .
```

### Container won't start
Check logs to see the error:
```bash
docker-compose logs <service-name>
```

### Reset everything
To completely reset the project:
```bash
docker-compose down -v
docker system prune -a
docker-compose up -d
```

## Development Workflow

### Run backend locally (without Docker)
```bash
# Start only MongoDB
docker-compose up -d mongodb

# Run backend locally
cd backend-go
go run ./cmd/server
```

### Run frontend locally (without Docker)
```bash
# Start MongoDB and backend
docker-compose up -d mongodb backend

# Run frontend locally
npm run dev
```

## Production Deployment

For production, change these values in `.env`:
- Change MongoDB password
- Change JWT_SECRET
- Set NODE_ENV=production
- Use MongoDB Atlas instead of local MongoDB

## Data Persistence

MongoDB data is stored in a Docker volume named `mongodb_data`. This data persists even when containers are stopped or recreated.

To backup your data before switching machines:
```bash
docker exec unishop-mongodb mongodump -u admin -p password123 --authenticationDatabase admin --db unishop --archive=/data/db/backup.gz
docker cp unishop-mongodb:/data/db/backup.gz ./backup.gz
```

To restore on new machine:
```bash
docker cp ./backup.gz unishop-mongodb:/data/db/backup.gz
docker exec unishop-mongodb mongorestore -u admin -p password123 --authenticationDatabase admin --db unishop --archive=/data/db/backup.gz
```
