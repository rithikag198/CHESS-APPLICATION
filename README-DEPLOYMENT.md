# Chess Application - Deployment Guide

This guide covers different deployment options for the Chess Application, from local development to production environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development](#local-development)
3. [Docker Deployment](#docker-deployment)
4. [Cloud Deployment](#cloud-deployment)
5. [Environment Configuration](#environment-configuration)
6. [Monitoring and Maintenance](#monitoring-and-maintenance)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software
- Node.js 18+ (for local development)
- MongoDB 6.0+ (or MongoDB Atlas for cloud)
- Redis 7+ (optional, for session storage)
- Docker & Docker Compose (for containerized deployment)
- Git

### System Requirements
- Minimum 2GB RAM
- 10GB disk space
- Modern web browser (Chrome, Firefox, Safari, Edge)

## Local Development

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chess-application
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB** (if running locally)
   ```bash
   # Using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:6.0
   
   # Or install MongoDB locally
   mongod --dbpath /path/to/your/db
   ```

5. **Start the application**
   ```bash
   # Backend only
   npm start
   
   # Or with nodemon for development
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3001
   - Backend API: http://localhost:3000
   - API Documentation: http://localhost:3000/api-docs

### Development Workflow

```bash
# Install new dependencies
npm install <package-name>

# Run tests
npm test

# Run linting
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

## Docker Deployment

### Using Docker Compose (Recommended)

1. **Clone and prepare**
   ```bash
   git clone <repository-url>
   cd chess-application
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with production values
   ```

3. **Deploy with script**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

4. **Or manually**
   ```bash
   docker-compose up -d --build
   ```

### Manual Docker Commands

```bash
# Build images
docker build -t chess-backend .
docker build -t chess-frontend ./frontend

# Run containers
docker run -d -p 3000:3000 --name chess-backend chess-backend
docker run -d -p 3001:3001 --name chess-frontend chess-frontend

# View logs
docker logs chess-backend
docker logs chess-frontend

# Stop containers
docker stop chess-backend chess-frontend
```

## Cloud Deployment

### Heroku

1. **Prepare for Heroku**
   ```bash
   # Install Heroku CLI
   npm install -g heroku
   
   # Login
   heroku login
   ```

2. **Create app**
   ```bash
   heroku create chess-app-backend
   heroku create chess-app-frontend
   ```

3. **Set environment variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI=mongodb://...
   heroku config:set JWT_SECRET=your-secret-key
   ```

4. **Deploy**
   ```bash
   # Backend
   git subtree push --prefix backend heroku master
   
   # Frontend (build and deploy to static hosting)
   cd frontend
   npm run build
   # Deploy build/ folder to Netlify, Vercel, or Heroku static
   ```

### AWS (EC2 + RDS + ElastiCache)

1. **Launch EC2 instance**
   - Ubuntu 20.04 LTS
   - t3.medium or larger
   - Configure security groups (ports 80, 443, 3000)

2. **Install Docker**
   ```bash
   sudo apt update
   sudo apt install docker.io docker-compose
   sudo systemctl start docker
   sudo systemctl enable docker
   sudo usermod -aG docker $USER
   ```

3. **Set up RDS (MongoDB)**
   - Create MongoDB cluster
   - Configure security groups
   - Get connection string

4. **Set up ElastiCache (Redis)**
   - Create Redis cluster
   - Configure security groups

5. **Deploy application**
   ```bash
   # Clone repository
   git clone <repo-url>
   cd chess-application
   
   # Configure environment
   cp .env.example .env
   # Edit with AWS RDS and ElastiCache URLs
   
   # Deploy
   docker-compose up -d
   ```

### Google Cloud Platform

1. **Use Cloud Run**
   ```bash
   # Build and deploy backend
   gcloud builds submit --tag gcr.io/PROJECT-ID/chess-backend
   gcloud run deploy chess-backend --image gcr.io/PROJECT-ID/chess-backend --platform managed
   
   # Deploy frontend to Firebase Hosting
   firebase deploy
   ```

### Azure

1. **Use Container Instances**
   ```bash
   # Create resource group
   az group create --name chess-app-rg --location eastus
   
   # Deploy containers
   az container create --resource-group chess-app-rg --name chess-backend \
     --image chess-backend:latest --ports 3000 --environment-variables \
     MONGODB_URI=... JWT_SECRET=...
   ```

## Environment Configuration

### Required Environment Variables

```bash
# Server Configuration
NODE_ENV=production
PORT=3000

# Database
MONGODB_URI=mongodb://localhost:27017/chess-app
REDIS_URL=redis://localhost:6379

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=https://yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Email (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Production Security Checklist

- [ ] Change default JWT secret
- [ ] Use HTTPS (SSL/TLS)
- [ ] Enable rate limiting
- [ ] Set up CORS properly
- [ ] Use environment variables for secrets
- [ ] Enable database authentication
- [ ] Set up backup strategy
- [ ] Configure monitoring
- [ ] Update dependencies regularly

## Monitoring and Maintenance

### Health Checks

```bash
# Application health
curl http://localhost:3000/health

# Database connection
curl http://localhost:3000/api/health/db

# Service status
docker-compose ps
```

### Logs

```bash
# Application logs
docker-compose logs -f backend

# Nginx logs
docker-compose logs -f nginx

# MongoDB logs
docker-compose logs -f mongodb
```

### Backup Strategy

```bash
# MongoDB backup
docker-compose exec mongodb mongodump --out /backup/$(date +%Y%m%d)

# Automated backup script
#!/bin/bash
BACKUP_DIR="/backup/$(date +%Y%m%d)"
mkdir -p $BACKUP_DIR
docker-compose exec mongodb mongodump --out $BACKUP_DIR
tar -czf $BACKUP_DIR.tar.gz $BACKUP_DIR
rm -rf $BACKUP_DIR
```

### Scaling

```bash
# Scale backend services
docker-compose up -d --scale backend=3

# Add load balancer
# Configure nginx upstream blocks
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check MongoDB status
   docker-compose logs mongodb
   
   # Verify connection string
   echo $MONGODB_URI
   ```

2. **Port Conflicts**
   ```bash
   # Check port usage
   netstat -tulpn | grep :3000
   
   # Change ports in docker-compose.yml
   ```

3. **Memory Issues**
   ```bash
   # Check memory usage
   docker stats
   
   # Increase swap space
   sudo fallocate -l 2G /swapfile
   sudo chmod 600 /swapfile
   sudo mkswap /swapfile
   sudo swapon /swapfile
   ```

4. **SSL Certificate Issues**
   ```bash
   # Generate new certificates
   openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes
   ```

### Performance Optimization

1. **Database Indexing**
   ```javascript
   // Add indexes to MongoDB
   db.users.createIndex({ email: 1 }, { unique: true })
   db.games.createIndex({ "players.white": 1, "players.black": 1 })
   db.games.createIndex({ status: 1, createdAt: -1 })
   ```

2. **Caching Strategy**
   ```bash
   # Enable Redis caching
   # Configure session storage
   # Cache frequently accessed data
   ```

3. **CDN Configuration**
   - Serve static assets via CDN
   - Enable gzip compression
   - Use HTTP/2

## Deployment Scripts

### Automated Deployment

```bash
#!/bin/bash
# deploy-production.sh

set -e

echo "🚀 Starting production deployment..."

# Pull latest code
git pull origin main

# Run tests
npm test

# Build application
npm run build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d --build

# Health check
sleep 30
curl -f http://localhost:3000/health || exit 1

echo "✅ Production deployment successful!"
```

### Rollback Script

```bash
#!/bin/bash
# rollback.sh

set -e

echo "🔄 Rolling back to previous version..."

# Get previous commit
PREVIOUS_COMMIT=$(git rev-parse HEAD~1)

# Checkout previous version
git checkout $PREVIOUS_COMMIT

# Rebuild and deploy
docker-compose up -d --build

echo "✅ Rollback completed!"
```

## Support

For deployment issues:
1. Check the logs: `docker-compose logs`
2. Verify environment configuration
3. Check system resources
4. Review this troubleshooting guide
5. Create an issue on the repository

---

**Note**: Always test deployment in a staging environment before deploying to production.
