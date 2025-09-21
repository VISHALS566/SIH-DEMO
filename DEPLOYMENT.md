# Alumni Platform - Production Deployment Guide

## Overview

This guide covers deploying the Alumni Platform to production using Docker, Docker Compose, and various cloud providers.

## Prerequisites

- Docker and Docker Compose installed
- Domain name configured
- SSL certificates (Let's Encrypt recommended)
- Cloud provider account (DigitalOcean, AWS, Google Cloud, etc.)

## Environment Variables

Create a `.env` file in the project root with the following variables:

```bash
# Django Settings
SECRET_KEY=your-super-secret-production-key-here
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
DATABASE_URL=postgresql://username:password@db:5432/alumni_db

# Redis Settings
REDIS_URL=redis://redis:6379

# Email Settings
EMAIL_HOST=smtp.your-provider.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@yourdomain.com
EMAIL_HOST_PASSWORD=your-app-password

# AWS S3 Settings (for file storage)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_STORAGE_BUCKET_NAME=your-s3-bucket-name
AWS_S3_REGION_NAME=us-east-1

# Stripe Settings
STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-publishable-key
STRIPE_SECRET_KEY=sk_live_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# CORS Settings
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Premium Features
PREMIUM_FEATURES_ENABLED=True
```

## Deployment Options

### Option 1: Docker Compose (Recommended for VPS)

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd alumni-platform
   ```

2. **Configure environment:**
   ```bash
   cp env.example .env
   # Edit .env with your production values
   ```

3. **Deploy with Docker Compose:**
   ```bash
   docker-compose up -d
   ```

4. **Run initial setup:**
   ```bash
   docker-compose exec backend python manage.py migrate
   docker-compose exec backend python manage.py createsuperuser
   docker-compose exec backend python manage.py collectstatic --noinput
   ```

### Option 2: DigitalOcean App Platform

1. **Create app.yaml:**
   ```yaml
   name: alumni-platform
   services:
   - name: backend
     source_dir: /backend
     github:
       repo: your-username/alumni-platform
       branch: main
     run_command: daphne -b 0.0.0.0 -p 8080 alumni_backend.asgi:application
     environment_slug: python
     instance_count: 1
     instance_size_slug: basic-xxs
     envs:
     - key: SECRET_KEY
       value: your-secret-key
     - key: DATABASE_URL
       value: ${db.DATABASE_URL}
     - key: REDIS_URL
       value: ${redis.REDIS_URL}
   
   - name: frontend
     source_dir: /
     github:
       repo: your-username/alumni-platform
       branch: main
     run_command: npm start
     environment_slug: node-js
     instance_count: 1
     instance_size_slug: basic-xxs
     envs:
     - key: VITE_API_BASE_URL
       value: https://backend.${APP_DOMAIN}/api
   
   databases:
   - name: db
     engine: PG
     version: "15"
   
   - name: redis
     engine: REDIS
     version: "7"
   ```

2. **Deploy to DigitalOcean:**
   ```bash
   doctl apps create --spec app.yaml
   ```

### Option 3: AWS ECS

1. **Create ECS task definition:**
   ```json
   {
     "family": "alumni-platform",
     "networkMode": "awsvpc",
     "requiresCompatibilities": ["FARGATE"],
     "cpu": "512",
     "memory": "1024",
     "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
     "containerDefinitions": [
       {
         "name": "backend",
         "image": "your-account.dkr.ecr.region.amazonaws.com/alumni-backend:latest",
         "portMappings": [
           {
             "containerPort": 8000,
             "protocol": "tcp"
           }
         ],
         "environment": [
           {
             "name": "SECRET_KEY",
             "value": "your-secret-key"
           }
         ],
         "secrets": [
           {
             "name": "DATABASE_URL",
             "valueFrom": "arn:aws:secretsmanager:region:account:secret:alumni/database"
           }
         ],
         "logConfiguration": {
           "logDriver": "awslogs",
           "options": {
             "awslogs-group": "/ecs/alumni-platform",
             "awslogs-region": "us-east-1",
             "awslogs-stream-prefix": "backend"
           }
         }
       }
     ]
   }
   ```

2. **Deploy to ECS:**
   ```bash
   aws ecs register-task-definition --cli-input-json file://task-definition.json
   aws ecs create-service --cluster alumni-cluster --service-name alumni-service --task-definition alumni-platform
   ```

### Option 4: Google Cloud Run

1. **Create cloudbuild.yaml:**
   ```yaml
   steps:
   - name: 'gcr.io/cloud-builders/docker'
     args: ['build', '-t', 'gcr.io/$PROJECT_ID/alumni-backend', './backend']
   - name: 'gcr.io/cloud-builders/docker'
     args: ['push', 'gcr.io/$PROJECT_ID/alumni-backend']
   - name: 'gcr.io/cloud-builders/gcloud'
     args: ['run', 'deploy', 'alumni-backend', '--image', 'gcr.io/$PROJECT_ID/alumni-backend', '--region', 'us-central1', '--platform', 'managed']
   ```

2. **Deploy to Cloud Run:**
   ```bash
   gcloud builds submit --config cloudbuild.yaml
   ```

## SSL Configuration

### Using Let's Encrypt with Certbot

1. **Install Certbot:**
   ```bash
   sudo apt-get update
   sudo apt-get install certbot python3-certbot-nginx
   ```

2. **Generate SSL certificate:**
   ```bash
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

3. **Update nginx.conf:**
   ```nginx
   server {
       listen 443 ssl http2;
       server_name yourdomain.com www.yourdomain.com;
       
       ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
       
       # Include your location blocks here
   }
   
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;
       return 301 https://$server_name$request_uri;
   }
   ```

## Database Setup

### PostgreSQL Production Configuration

1. **Create production database:**
   ```sql
   CREATE DATABASE alumni_db;
   CREATE USER alumni_user WITH PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE alumni_db TO alumni_user;
   ```

2. **Configure PostgreSQL for production:**
   ```postgresql
   # postgresql.conf
   shared_preload_libraries = 'pg_stat_statements'
   max_connections = 200
   shared_buffers = 256MB
   effective_cache_size = 1GB
   maintenance_work_mem = 64MB
   checkpoint_completion_target = 0.9
   wal_buffers = 16MB
   default_statistics_target = 100
   ```

## Monitoring and Logging

### Application Monitoring

1. **Install monitoring tools:**
   ```bash
   # Install Prometheus and Grafana
   docker run -d --name prometheus -p 9090:9090 prom/prometheus
   docker run -d --name grafana -p 3001:3000 grafana/grafana
   ```

2. **Configure Django logging:**
   ```python
   LOGGING = {
       'version': 1,
       'disable_existing_loggers': False,
       'handlers': {
           'file': {
               'level': 'INFO',
               'class': 'logging.handlers.RotatingFileHandler',
               'filename': '/app/logs/django.log',
               'maxBytes': 1024*1024*15,  # 15MB
               'backupCount': 10,
           },
           'console': {
               'level': 'INFO',
               'class': 'logging.StreamHandler',
           },
       },
       'loggers': {
           'django': {
               'handlers': ['file', 'console'],
               'level': 'INFO',
               'propagate': True,
           },
       },
   }
   ```

### Health Checks

1. **Add health check endpoint:**
   ```python
   # In your Django views
   from django.http import JsonResponse
   from django.db import connection
   from django.core.cache import cache
   
   def health_check(request):
       try:
           # Check database
           connection.ensure_connection()
           
           # Check cache
           cache.set('health_check', 'ok', 10)
           cache.get('health_check')
           
           return JsonResponse({'status': 'healthy'})
       except Exception as e:
           return JsonResponse({'status': 'unhealthy', 'error': str(e)}, status=500)
   ```

## Backup Strategy

### Database Backups

1. **Automated PostgreSQL backups:**
   ```bash
   #!/bin/bash
   # backup.sh
   BACKUP_DIR="/backups"
   DATE=$(date +%Y%m%d_%H%M%S)
   
   pg_dump -h localhost -U alumni_user alumni_db > $BACKUP_DIR/alumni_db_$DATE.sql
   
   # Keep only last 7 days of backups
   find $BACKUP_DIR -name "alumni_db_*.sql" -mtime +7 -delete
   ```

2. **Schedule with cron:**
   ```bash
   # Add to crontab
   0 2 * * * /path/to/backup.sh
   ```

### Media Files Backup

1. **S3 backup script:**
   ```bash
   #!/bin/bash
   # s3_backup.sh
   aws s3 sync /app/media s3://your-backup-bucket/media/$(date +%Y%m%d)/
   ```

## Performance Optimization

### Database Optimization

1. **Add database indexes:**
   ```python
   # In your models
   class Meta:
       indexes = [
           models.Index(fields=['email']),
           models.Index(fields=['user_type']),
           models.Index(fields=['created_at']),
       ]
   ```

2. **Configure connection pooling:**
   ```python
   DATABASES = {
       'default': {
           'ENGINE': 'django.db.backends.postgresql',
           'NAME': 'alumni_db',
           'USER': 'alumni_user',
           'PASSWORD': 'password',
           'HOST': 'localhost',
           'PORT': '5432',
           'OPTIONS': {
               'MAX_CONNS': 20,
               'MIN_CONNS': 5,
           }
       }
   }
   ```

### Caching Strategy

1. **Redis caching:**
   ```python
   CACHES = {
       'default': {
           'BACKEND': 'django_redis.cache.RedisCache',
           'LOCATION': 'redis://127.0.0.1:6379/1',
           'OPTIONS': {
               'CLIENT_CLASS': 'django_redis.client.DefaultClient',
           }
       }
   }
   ```

## Security Checklist

- [ ] Change default secret key
- [ ] Enable HTTPS with valid SSL certificate
- [ ] Configure proper CORS settings
- [ ] Set up rate limiting
- [ ] Enable Django security middleware
- [ ] Configure secure headers
- [ ] Set up database backups
- [ ] Enable monitoring and alerting
- [ ] Configure firewall rules
- [ ] Regular security updates

## Troubleshooting

### Common Issues

1. **WebSocket connection fails:**
   - Check nginx WebSocket configuration
   - Verify Redis is running
   - Check firewall settings

2. **Static files not loading:**
   - Run `python manage.py collectstatic`
   - Check nginx static file configuration
   - Verify file permissions

3. **Database connection errors:**
   - Check database credentials
   - Verify database is running
   - Check network connectivity

### Log Analysis

```bash
# View application logs
docker-compose logs -f backend

# View nginx logs
docker-compose logs -f nginx

# View database logs
docker-compose logs -f db
```

## Maintenance

### Regular Tasks

1. **Weekly:**
   - Check application logs for errors
   - Monitor disk space usage
   - Review security updates

2. **Monthly:**
   - Update dependencies
   - Review performance metrics
   - Test backup restoration

3. **Quarterly:**
   - Security audit
   - Performance optimization review
   - Disaster recovery testing

## Support

For deployment issues:
- Check the logs first
- Review this documentation
- Create an issue in the repository
- Contact the development team

---

**Note:** This guide assumes basic knowledge of Docker, Linux administration, and cloud platforms. Adjust the configurations based on your specific requirements and infrastructure.
