# HH Attendance Tracker - Deployment Guide

## 🚀 Production Deployment

### Prerequisites
- Node.js 16+ and npm 8+
- MongoDB database
- Domain with SSL certificate (recommended)

### Environment Setup

1. **Backend Environment Variables**
   ```bash
   cp backend/.env.example backend/.env.production
   ```
   
   Update the following in `.env.production`:
   - `MONGODB_URI` - Your production MongoDB connection string
   - `FRONTEND_URL` - Your production domain
   - `JWT_SECRET` - Strong secret key for JWT tokens
   - `DOMAIN` - Your production domain

2. **Frontend Environment Variables**
   ```bash
   cp frontend/.env.example frontend/.env.production
   ```

### Build and Deploy

1. **Build Frontend**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install --production
   ```

3. **Start Production Server**
   ```bash
   cd backend
   npm run prod
   ```

### Server Configuration

#### Nginx Configuration (Recommended)
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/private-key.pem;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### PM2 Process Manager (Recommended)
```bash
# Install PM2 globally
npm install -g pm2

# Start application with PM2
pm2 start backend/server.js --name "hh-attendance-tracker"

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### Docker Deployment

1. **Create Dockerfile** (backend/Dockerfile):
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm install --production

# Copy source code
COPY . .

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Start application
CMD ["npm", "start"]
```

2. **Build and Run Docker Container**:
```bash
cd backend
docker build -t hh-attendance-tracker .
docker run -d -p 5000:5000 --name attendance-app hh-attendance-tracker
```

### Database Setup

1. **MongoDB Production Configuration**:
   ```javascript
   // Enable authentication
   use admin
   db.createUser({
     user: "attendance_admin",
     pwd: "your_secure_password",
     roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase", "readWriteAnyDatabase"]
   })
   ```

2. **Database Indexes** (for performance):
   ```javascript
   // Create indexes for better performance
   db.users.createIndex({ email: 1 }, { unique: true })
   db.members.createIndex({ roomId: 1 })
   db.sessions.createIndex({ roomId: 1, date: -1 })
   db.attendances.createIndex({ sessionId: 1, memberId: 1 })
   ```

### Security Checklist

- ✅ Environment variables configured
- ✅ JWT secrets are strong and secure
- ✅ CORS configured for production domain
- ✅ Rate limiting enabled
- ✅ Helmet security headers configured
- ✅ MongoDB authentication enabled
- ✅ SSL certificate installed
- ✅ Firewall configured (only ports 80, 443, 22 open)
- ✅ Regular security updates scheduled

### Performance Optimization

- ✅ Gzip compression enabled
- ✅ Static file caching configured
- ✅ Database indexes created
- ✅ CDN configured (optional)
- ✅ Monitoring tools installed

### Monitoring and Maintenance

1. **Health Check Endpoint**: `GET /api/health`
2. **Log Files**: Check PM2 logs with `pm2 logs`
3. **Database Backups**: Schedule regular MongoDB backups
4. **SSL Certificate Renewal**: Setup auto-renewal for Let's Encrypt

### Troubleshooting

- **Server not starting**: Check environment variables and MongoDB connection
- **404 errors**: Verify nginx configuration and proxy settings
- **Slow performance**: Check database indexes and server resources
- **CORS errors**: Verify FRONTEND_URL in environment variables

### Support

For issues and updates, check the project repository or contact the development team.
