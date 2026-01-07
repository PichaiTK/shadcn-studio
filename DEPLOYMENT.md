# Deployment Guide

## Quick Start with Docker Compose

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+
- 4GB RAM minimum
- 20GB disk space

### Initial Setup

1. Clone the repository
```bash
git clone https://github.com/yourusername/designconnect-pro.git
cd designconnect-pro
```

2. Run bootstrap script
```bash
chmod +x ops/scripts/bootstrap_myapp.sh
./ops/scripts/bootstrap_myapp.sh
```

3. Access the application
- Frontend: http://localhost
- Backend API: http://localhost:3001
- Grafana: http://localhost:3000 (admin/admin)
- Prometheus: http://localhost:9090

## Manual Deployment

### Backend Setup

```bash
cd server
npm install
npm run build

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Start with PM2
pm2 start dist/main.js --name designconnect-backend
```

### Frontend Setup

```bash
cd frontend
# Serve with nginx or any static server
```

### Database Setup

```bash
# Start MongoDB
docker run -d -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=adminpassword \
  --name designconnect-mongo \
  mongo:7

# Start Redis
docker run -d -p 6379:6379 \
  --name designconnect-redis \
  redis:7-alpine
```

## Production Deployment

### Environment Variables

Create `.env` file with production values:

```env
NODE_ENV=production
MONGODB_URI=mongodb://user:pass@production-host:27017/db
JWT_SECRET=<generate-secure-random-string>
```

### SSL/TLS Configuration

Add SSL certificates to nginx:

```nginx
server {
    listen 443 ssl http2;
    ssl_certificate /etc/ssl/certs/your-cert.pem;
    ssl_certificate_key /etc/ssl/private/your-key.pem;
    
    # ... existing config
}
```

### Monitoring Setup

1. Configure Prometheus targets in `ops/prometheus/prometheus.yml`
2. Import Grafana dashboard from `ops/grafana/dashboards/`
3. Setup alerts for critical metrics

### Backup Configuration

Setup cron job for automated backups:

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /path/to/ops/scripts/backup_mongo.sh
```

## CI/CD Pipeline

The project includes GitHub Actions workflows:

- `ci.yml`: Runs on every push/PR (lint, test, build)
- `deploy.yml`: Deploys to production on main branch

### Required Secrets

Add these to GitHub repository secrets:

- `SSH_PRIVATE_KEY`: SSH key for deployment server
- `SSH_USER`: SSH username
- `SSH_HOST`: Server hostname
- `PRODUCTION_URL`: Production URL for health checks

## Scaling

### Horizontal Scaling

Use PM2 cluster mode:

```javascript
// ecosystem.config.js
{
  instances: "max", // Use all CPU cores
  exec_mode: "cluster"
}
```

### Load Balancing

Add upstream servers in nginx:

```nginx
upstream backend {
    server backend1:3001;
    server backend2:3001;
    server backend3:3001;
}
```

## Troubleshooting

### Check Service Status

```bash
docker-compose ps
pm2 status
```

### View Logs

```bash
docker-compose logs -f
pm2 logs designconnect-backend
```

### Health Checks

```bash
curl http://localhost:3001/api/health
```

## Security Checklist

- [ ] Change default passwords
- [ ] Generate secure JWT secret
- [ ] Enable HTTPS
- [ ] Configure firewall rules
- [ ] Setup rate limiting
- [ ] Enable audit logging
- [ ] Regular security updates
- [ ] Backup encryption
