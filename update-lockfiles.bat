@echo off
REM Update package-lock.json after adding dependencies
echo 🔧 Updating package-lock.json for Docker compatibility
echo ====================================================

echo.
echo 📦 Updating Backend package-lock.json...
cd backend

REM Remove old package-lock.json and node_modules to force clean install
if exist package-lock.json del package-lock.json
if exist node_modules rmdir /s /q node_modules

REM Clean install to generate new package-lock.json
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to update package-lock.json!
    pause
    exit /b 1
)

echo ✅ Backend package-lock.json updated!
cd ..

echo.
echo 📦 Updating Frontend package-lock.json...
cd frontend

REM Update frontend package-lock.json if needed
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to update frontend package-lock.json!
    pause
    exit /b 1
)

echo ✅ Frontend package-lock.json updated!
cd ..

echo.
echo ✅ All package-lock.json files updated!
echo 🐳 Docker builds should now work properly.
echo.
echo 🚀 Ready to build Docker image:
echo   - docker build -f Dockerfile.simple -t attendance-tracker .
echo   - OR run: ./deploy-docker.bat
echo.
pause
