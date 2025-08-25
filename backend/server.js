import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { Connectdb } from './config/db.js';
// API routes
import userRoutes from './routes/userRoutes.js';
import memberRoutes from './routes/memberRoutes.js';
import roomsRoutes from './routes/roomsRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Compression middleware
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || 'https://yourdomain.com'] 
    : ["http://localhost:5173", "http://localhost:3000"],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

const __dirname = path.resolve();

// Body parser middleware with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API routes
app.use('/api/users', userRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/rooms', roomsRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/attendance', attendanceRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'HH Attendance Tracker API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    frontendServed: process.env.NODE_ENV === "production" ? "checking..." : "development mode"
  });
});

// API status endpoint
app.get('/api/status', (req, res) => {
  res.status(200).json({
    message: '🎉 HH Attendance Tracker API is live!',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      health: '/api/health',
      users: '/api/users/*',
      rooms: '/api/rooms/*', 
      members: '/api/members/*',
      sessions: '/api/sessions/*',
      attendance: '/api/attendance/*'
    }
  });
});

// Production static file serving
if(process.env.NODE_ENV === "production"){
  // Check if frontend dist exists and serve accordingly
  const frontendPath = path.join(__dirname, "..", "frontend", "dist");
  const alternatePath = path.join(__dirname, "frontend", "dist");
  
  let staticPath = frontendPath;
  try {
    // Check if the standard path exists (when deployed from root)
    fs.statSync(frontendPath);
    console.log("✅ Frontend found at:", frontendPath);
  } catch (err) {
    try {
      // Check alternate path (when deployed from backend)
      fs.statSync(alternatePath);
      staticPath = alternatePath;
      console.log("✅ Frontend found at:", alternatePath);
    } catch (err2) {
      console.log("⚠️  Frontend dist not found. API-only mode.");
      staticPath = null;
    }
  }
  
  if (staticPath) {
    // Serve static files with caching headers
    app.use(express.static(staticPath, {
      maxAge: '1y', // Cache static assets for 1 year
      etag: true,
      setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache'); // Don't cache HTML files
        }
      }
    }));
    
    console.log("✅ Running in production mode. Serving frontend...");
    
    // Catch-all handler for SPA routing
    app.get(/^\/(?!api).*/, (req, res) => {
      const indexPath = path.join(staticPath, "index.html");
      res.sendFile(indexPath);
    });
  } else {
    console.log("🔧 Running in API-only mode. Frontend not found.");
  }
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({ message: 'Something went wrong!' });
  } else {
    res.status(500).json({ message: err.message, stack: err.stack });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const startServer = async () => {
  try {
    await Connectdb();
    console.log('✅ MongoDB connected successfully.');
    
    app.listen(PORT, () => {
      console.log(`✅ Server is running in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(`✅ Server listening on port ${PORT}`);
      console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error("❌ FATAL ERROR: Failed to connect to the database.", error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed.');
    process.exit(0);
  });
});

startServer();