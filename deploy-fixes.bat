@echo off
REM Quick Fix Deployment for Rate Limiting and PDF Issues
echo 🔧 Deploying fixes for Rate Limiting and PDF Export
echo ================================================

echo.
echo 📝 Changes being deployed:
echo   ✅ Fixed Express rate limiting (trust proxy enabled)
echo   ✅ Enhanced PDF export with better error handling
echo   ✅ Added debugging for PDF generation
echo.

echo 📦 Committing changes...
git add .
git commit -m "Fix: Enable trust proxy for rate limiting and enhance PDF export with error handling"

if %errorlevel% neq 0 (
    echo ❌ Git commit failed!
    pause
    exit /b 1
)

echo ✅ Changes committed successfully!

echo.
echo 🚀 Pushing to repository...
git push origin main

if %errorlevel% neq 0 (
    echo ❌ Git push failed!
    pause
    exit /b 1
)

echo ✅ Changes pushed successfully!

echo.
echo 🎉 Deployment Complete!
echo.
echo 📋 What was fixed:
echo   1. ✅ Rate limiting error - Added 'trust proxy' setting
echo   2. ✅ PDF export - Enhanced error handling and debugging
echo   3. ✅ Better fallback for missing data in PDF
echo.
echo 🌐 Your app will auto-deploy on Render:
echo   https://hh-attendence.onrender.com
echo.
echo ⏱️  Expected deployment time: 2-3 minutes
echo.
echo 🧪 Test the fixes:
echo   - Check health endpoint: /api/health
echo   - Try PDF export in attendance page
echo   - Verify rate limiting works without errors
echo.
pause
