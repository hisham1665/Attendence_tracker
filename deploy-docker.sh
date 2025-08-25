#!/bin/bash

# HH Attendance Tracker - Docker Deployment Script
echo "🚀 Building and Deploying HH Attendance Tracker with Docker"
echo "============================================================"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Build Frontend
echo -e "\n${BLUE}📦 Step 1: Building Frontend...${NC}"
cd frontend
if npm run build; then
    echo -e "${GREEN}✅ Frontend build successful!${NC}"
else
    echo -e "${RED}❌ Frontend build failed!${NC}"
    exit 1
fi
cd ..

# Step 2: Build Docker Image
echo -e "\n${BLUE}🐳 Step 2: Building Docker Image...${NC}"
if docker build -f Dockerfile.simple -t hh-attendance-tracker .; then
    echo -e "${GREEN}✅ Docker image built successfully!${NC}"
else
    echo -e "${RED}❌ Docker build failed!${NC}"
    exit 1
fi

# Step 3: Run Docker Container
echo -e "\n${BLUE}🚀 Step 3: Starting Docker Container...${NC}"

# Stop existing container if running
docker stop hh-attendance-app 2>/dev/null
docker rm hh-attendance-app 2>/dev/null

# Run new container
if docker run -d \
    --name hh-attendance-app \
    -p 5000:5000 \
    -e NODE_ENV=production \
    -e MONGODB_URI=mongodb://host.docker.internal:27017/attendance_tracker \
    -e JWT_SECRET=your_super_secure_jwt_secret_key_here \
    -e FRONTEND_URL=http://localhost:5000 \
    hh-attendance-tracker; then
    echo -e "${GREEN}✅ Container started successfully!${NC}"
else
    echo -e "${RED}❌ Container failed to start!${NC}"
    exit 1
fi

# Step 4: Health Check
echo -e "\n${BLUE}🏥 Step 4: Checking Application Health...${NC}"
sleep 5

if curl -f http://localhost:5000/api/health >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Application is healthy and running!${NC}"
    echo -e "\n${GREEN}🎉 Deployment Successful!${NC}"
    echo -e "${BLUE}📱 Access your app at: http://localhost:5000${NC}"
    echo -e "${BLUE}📊 Health check: http://localhost:5000/api/health${NC}"
    echo -e "${BLUE}🐳 View logs: docker logs hh-attendance-app${NC}"
    echo -e "${BLUE}🛑 Stop app: docker stop hh-attendance-app${NC}"
else
    echo -e "${YELLOW}⚠️  Application started but health check failed${NC}"
    echo -e "${BLUE}🔍 Check logs: docker logs hh-attendance-app${NC}"
fi

echo -e "\n${BLUE}📋 Container Status:${NC}"
docker ps --filter name=hh-attendance-app
