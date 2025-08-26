@echo off
REM Fix PDF Room Name Issue
echo 🔧 Fixing PDF Room Name Display Issue
echo =====================================

echo.
echo 📝 Changes being deployed:
echo   ✅ Enhanced room name detection in PDF export
echo   ✅ Added room data fetching if incomplete
echo   ✅ Better fallback room names
echo   ✅ Added debugging for room data
echo.

echo 📦 Committing changes...
git add .
git commit -m "Fix: Improve room name detection in PDF export with data fetching fallback"

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
echo 🎉 Room Name Fix Deployed!
echo.
echo 📋 What was fixed:
echo   1. ✅ Room data fetching if incomplete
echo   2. ✅ Multiple room name properties checked
echo   3. ✅ Fallback room names for edge cases
echo   4. ✅ Better debugging logs
echo.
echo 🌐 Your app will auto-deploy on Render:
echo   https://hh-attendence.onrender.com
echo.
echo ⏱️  Expected deployment time: 2-3 minutes
echo.
echo 🧪 Test the fix:
echo   1. Go to any attendance session
echo   2. Export PDF
echo   3. Check that room name appears correctly
echo   4. Open browser console to see debug logs
echo.
pause
