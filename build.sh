#!/bin/bash
# Render.com deployment script for HH Attendance Tracker

echo "🚀 Starting HH Attendance Tracker deployment on Render..."

# Set Node.js version (optional)
export NODE_VERSION=18

# Print environment info
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "Working directory: $(pwd)"
echo "Directory contents:"
ls -la

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Backend dependency installation failed"
    exit 1
fi
echo "✅ Backend dependencies installed"

# Move to project root for frontend build
cd ..

# Install frontend dependencies and build
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Frontend dependency installation failed"
    exit 1
fi

echo "🏗️ Building frontend..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed"
    exit 1
fi
echo "✅ Frontend built successfully"

# Move back to backend for server start
cd ../backend

echo "🎯 Deployment completed successfully!"
echo "📁 Frontend build location: ../frontend/dist"
echo "🚀 Starting server..."

# Start the server (Render will handle this)
npm start
