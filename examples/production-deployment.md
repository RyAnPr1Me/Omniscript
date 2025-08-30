# Production Deployment Guide

This directory contains production deployment configurations and examples for Omniscript applications.

## Docker Deployment

### Basic Application Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy Omniscript source
COPY . .

# Build Omniscript
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S omniscript && \
    adduser -S omniscript -u 1001

# Switch to non-root user
USER omniscript

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

EXPOSE 3000

CMD ["npm", "start"]
```

### Multi-stage Production Dockerfile
```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
COPY src/ ./src/

RUN npm ci
RUN npm run build

# Production stage
FROM node:18-alpine AS production

RUN apk add --no-cache curl

WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built application
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S omniscript && \
    adduser -S omniscript -u 1001 -G omniscript

# Set permissions
RUN chown -R omniscript:omniscript /app
USER omniscript

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${PORT:-3000}/health || exit 1

EXPOSE ${PORT:-3000}

CMD ["node", "dist/cli.js", "run", "dist/app.js"]
```

## Docker Compose Examples

### Single Service
```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:password@db:5432/omniscript
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - db
      - redis
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=omniscript
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### Microservices with Load Balancer
```yaml
# docker-compose.microservices.yml
version: '3.8'

services:
  # Load Balancer
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl/certs
    depends_on:
      - api-gateway
    restart: unless-stopped

  # API Gateway
  api-gateway:
    build: .
    command: ["omni", "run", "examples/microservices.os"]
    environment:
      - NODE_ENV=production
      - SERVICE_NAME=api-gateway
      - PORT=3000
    ports:
      - "3000:3000"
    depends_on:
      - user-service-1
      - user-service-2
      - order-service-1
      - order-service-2
    restart: unless-stopped

  # User Service Instances
  user-service-1:
    build: .
    command: ["omni", "run", "examples/user-service.os"]
    environment:
      - NODE_ENV=production
      - SERVICE_NAME=user-service
      - PORT=3001
      - DATABASE_URL=postgresql://user:password@db:5432/users
    depends_on:
      - db
    restart: unless-stopped

  user-service-2:
    build: .
    command: ["omni", "run", "examples/user-service.os"]
    environment:
      - NODE_ENV=production
      - SERVICE_NAME=user-service
      - PORT=3002
      - DATABASE_URL=postgresql://user:password@db:5432/users
    depends_on:
      - db
    restart: unless-stopped

  # Order Service Instances
  order-service-1:
    build: .
    command: ["omni", "run", "examples/order-service.os"]
    environment:
      - NODE_ENV=production
      - SERVICE_NAME=order-service
      - PORT=3003
      - DATABASE_URL=postgresql://user:password@db:5432/orders
    depends_on:
      - db
    restart: unless-stopped

  order-service-2:
    build: .
    command: ["omni", "run", "examples/order-service.os"]
    environment:
      - NODE_ENV=production
      - SERVICE_NAME=order-service
      - PORT=3004
      - DATABASE_URL=postgresql://user:password@db:5432/orders
    depends_on:
      - db
    restart: unless-stopped

  # Database
  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=omniscript
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  # Monitoring
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    restart: unless-stopped

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana_data:/var/lib/grafana
    restart: unless-stopped

volumes:
  postgres_data:
  grafana_data:
```

## Kubernetes Deployment

### Basic Deployment
```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: omniscript-app
  labels:
    app: omniscript-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: omniscript-app
  template:
    metadata:
      labels:
        app: omniscript-app
    spec:
      containers:
      - name: omniscript-app
        image: omniscript:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: omniscript-secrets
              key: database-url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: omniscript-secrets
              key: jwt-secret
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: omniscript-service
spec:
  selector:
    app: omniscript-app
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: LoadBalancer

---
apiVersion: v1
kind: Secret
metadata:
  name: omniscript-secrets
type: Opaque
stringData:
  database-url: "postgresql://user:password@postgres:5432/omniscript"
  jwt-secret: "your-super-secret-jwt-key"
```

### Microservices with Ingress
```yaml
# k8s/microservices.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: omniscript-ingress
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - api.yourdomain.com
    secretName: omniscript-tls
  rules:
  - host: api.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api-gateway-service
            port:
              number: 80

---
# API Gateway
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
spec:
  replicas: 2
  selector:
    matchLabels:
      app: api-gateway
  template:
    metadata:
      labels:
        app: api-gateway
    spec:
      containers:
      - name: api-gateway
        image: omniscript:latest
        command: ["omni", "run", "examples/microservices.os"]
        ports:
        - containerPort: 3000
        env:
        - name: SERVICE_NAME
          value: "api-gateway"

---
apiVersion: v1
kind: Service
metadata:
  name: api-gateway-service
spec:
  selector:
    app: api-gateway
  ports:
  - port: 80
    targetPort: 3000

---
# User Service
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: user-service
  template:
    metadata:
      labels:
        app: user-service
    spec:
      containers:
      - name: user-service
        image: omniscript:latest
        command: ["omni", "run", "examples/user-service.os"]
        ports:
        - containerPort: 3001

---
apiVersion: v1
kind: Service
metadata:
  name: user-service
spec:
  selector:
    app: user-service
  ports:
  - port: 80
    targetPort: 3001
```

## Environment Configuration

### Production Environment File
```bash
# .env.production
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/omniscript
DATABASE_POOL_MAX=20
DATABASE_POOL_MIN=5

# Redis
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your-redis-password

# Security
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h
CORS_ORIGIN=https://yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Monitoring
METRICS_ENABLED=true
LOG_LEVEL=info
APM_SERVICE_NAME=omniscript-api

# Service Discovery
SERVICE_REGISTRY_URL=http://consul:8500
HEALTH_CHECK_INTERVAL=30000

# SSL/TLS
SSL_CERT_PATH=/etc/ssl/certs/cert.pem
SSL_KEY_PATH=/etc/ssl/private/key.pem

# External Services
SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASSWORD=your-smtp-password

# Storage
S3_BUCKET=your-app-bucket
S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

### Configuration Management
```typescript
// config/production.ts
export const productionConfig = {
  server: {
    port: parseInt(process.env.PORT || '3000'),
    host: process.env.HOST || '0.0.0.0',
    ssl: {
      enabled: process.env.SSL_ENABLED === 'true',
      cert: process.env.SSL_CERT_PATH,
      key: process.env.SSL_KEY_PATH
    }
  },
  
  database: {
    url: process.env.DATABASE_URL,
    pool: {
      min: parseInt(process.env.DATABASE_POOL_MIN || '5'),
      max: parseInt(process.env.DATABASE_POOL_MAX || '20')
    },
    ssl: process.env.NODE_ENV === 'production'
  },
  
  redis: {
    url: process.env.REDIS_URL,
    password: process.env.REDIS_PASSWORD,
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3
  },
  
  security: {
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    },
    cors: {
      origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
      credentials: true
    },
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100')
    }
  },
  
  monitoring: {
    enabled: process.env.METRICS_ENABLED === 'true',
    logLevel: process.env.LOG_LEVEL || 'info',
    apmServiceName: process.env.APM_SERVICE_NAME || 'omniscript-api'
  }
};
```

## CI/CD Pipeline

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Run linting
      run: npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2
    
    - name: Login to DockerHub
      uses: docker/login-action@v2
      with:
        username: ${{ secrets.DOCKERHUB_USERNAME }}
        password: ${{ secrets.DOCKERHUB_TOKEN }}
    
    - name: Build and push
      uses: docker/build-push-action@v3
      with:
        context: .
        push: true
        tags: |
          yourusername/omniscript:latest
          yourusername/omniscript:${{ github.sha }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
    - name: Deploy to Kubernetes
      uses: azure/k8s-deploy@v1
      with:
        manifests: |
          k8s/deployment.yaml
        images: |
          yourusername/omniscript:${{ github.sha }}
        kubectl-version: 'latest'
```

## Monitoring and Logging

### Prometheus Configuration
```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'omniscript-api'
    static_configs:
      - targets: ['api-gateway:3000']
    metrics_path: '/metrics'
    scrape_interval: 5s

  - job_name: 'omniscript-services'
    static_configs:
      - targets: 
        - 'user-service-1:3001'
        - 'user-service-2:3002'
        - 'order-service-1:3003'
        - 'order-service-2:3004'
```

### Logging Configuration
```typescript
// logging.ts
export const loggerConfig = {
  level: process.env.LOG_LEVEL || 'info',
  format: process.env.NODE_ENV === 'production' ? 'json' : 'dev',
  transports: [
    // Console transport
    {
      type: 'console',
      colorize: process.env.NODE_ENV !== 'production'
    },
    
    // File transport for production
    ...(process.env.NODE_ENV === 'production' ? [{
      type: 'file',
      filename: '/var/log/omniscript/app.log',
      maxsize: 100 * 1024 * 1024, // 100MB
      maxFiles: 5
    }] : []),
    
    // Error file transport
    {
      type: 'file',
      level: 'error',
      filename: '/var/log/omniscript/error.log'
    }
  ]
};
```

## Security Best Practices

### Security Checklist
- [ ] Use HTTPS in production
- [ ] Implement proper authentication and authorization
- [ ] Validate and sanitize all inputs
- [ ] Use environment variables for secrets
- [ ] Enable CORS with specific origins
- [ ] Implement rate limiting
- [ ] Use security headers (helmet.js)
- [ ] Keep dependencies updated
- [ ] Use non-root containers
- [ ] Implement proper error handling (no stack traces in production)
- [ ] Enable audit logging
- [ ] Use secrets management (Vault, K8s secrets)

### Security Configuration
```typescript
// security.ts
export const securityConfig = {
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"]
      }
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  },
  
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || false,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP'
  }
};
```

This guide provides comprehensive production deployment configurations for Omniscript applications, covering containerization, orchestration, monitoring, and security best practices.