@echo off
REM HH Attendance Tracker - Fix Missing Dependencies
echo 🔧 Installing Missing Dependencies for HH Attendance Tracker
echo ============================================================

echo.
echo 📦 Installing Backend Dependencies...
cd backend
call npm install csv-parser xlsx
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies!
    pause
    exit /b 1
)
echo ✅ Dependencies installed successfully!

echo.
echo 🧪 Testing Server Start...
timeout /t 2 /nobreak >nul
call npm start &
set PID=%!
timeout /t 5 /nobreak >nul
taskkill /PID %PID% /F >nul 2>&1

echo.
echo ✅ Dependencies fixed! You can now deploy.
echo.
echo 🚀 Ready to deploy? Run one of these:
echo   - deploy-docker.bat (Docker deployment)
echo   - git push (if using Heroku/Railway)
echo.
pause
