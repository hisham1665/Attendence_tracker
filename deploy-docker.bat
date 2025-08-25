@echo off
REM HH Attendance Tracker - Windows Docker Deployment Script
echo 🚀 Building and Deploying HH Attendance Tracker with Docker
echo ============================================================

REM Step 1: Build Frontend
echo.
echo 📦 Step 1: Building Frontend...
cd frontend
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Frontend build failed!
    pause
    exit /b 1
)
echo ✅ Frontend build successful!
cd ..

REM Step 1.5: Install Backend Dependencies
echo.
echo 📦 Step 1.5: Installing Backend Dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Backend dependency installation failed!
    pause
    exit /b 1
)
echo ✅ Backend dependencies installed!
cd ..

REM Step 2: Build Docker Image
echo.
echo 🐳 Step 2: Building Docker Image...
docker build -f Dockerfile.simple -t hh-attendance-tracker .
if %errorlevel% neq 0 (
    echo ❌ Docker build failed!
    pause
    exit /b 1
)
echo ✅ Docker image built successfully!

REM Step 3: Stop existing container
echo.
echo 🛑 Stopping existing container...
docker stop hh-attendance-app 2>nul
docker rm hh-attendance-app 2>nul

REM Step 4: Run Docker Container
echo.
echo 🚀 Step 3: Starting Docker Container...
docker run -d ^
    --name hh-attendance-app ^
    -p 5000:5000 ^
    -e NODE_ENV=production ^
    -e MONGODB_URI=mongodb://host.docker.internal:27017/attendance_tracker ^
    -e JWT_SECRET=your_super_secure_jwt_secret_key_here ^
    -e FRONTEND_URL=http://localhost:5000 ^
    hh-attendance-tracker

if %errorlevel% neq 0 (
    echo ❌ Container failed to start!
    pause
    exit /b 1
)
echo ✅ Container started successfully!

REM Step 5: Wait and health check
echo.
echo 🏥 Checking Application Health...
timeout /t 5 /nobreak >nul

curl -f http://localhost:5000/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Application is healthy and running!
    echo.
    echo 🎉 Deployment Successful!
    echo 📱 Access your app at: http://localhost:5000
    echo 📊 Health check: http://localhost:5000/api/health
    echo 🐳 View logs: docker logs hh-attendance-app
    echo 🛑 Stop app: docker stop hh-attendance-app
) else (
    echo ⚠️  Application started but health check failed
    echo 🔍 Check logs: docker logs hh-attendance-app
)

echo.
echo 📋 Container Status:
docker ps --filter name=hh-attendance-app

echo.
echo Press any key to exit...
pause >nul
