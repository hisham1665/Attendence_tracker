import express from 'express';
// ...existing code...
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import cors from 'cors';
import { Connectdb } from './config/db.js';
// API routes
import userRoutes from './routes/userRoutes.js';
import memberRoutes from './routes/memberRoutes.js';
import roomsRoutes from './routes/roomsRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';

dotenv.config();
const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

const __dirname = path.resolve();
app.use(express.json());



app.use('/api/users', userRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/rooms', roomsRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/attendance', attendanceRoutes);


if(process.env.NODE_ENV === "production"){
  app.use(express.static(path.join(__dirname, "frontend/dist")))
  console.log("Running in production. Serving frontend...");
  app.get(/^\/(?!api).*/, (req, res) => {
    console.log("Catch-all route hit:", req.originalUrl);
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
}
const startServer = async () => {
  try {
    await Connectdb();
    console.log('✅ Mongoose connected successfully.');
    app.listen(5000, () => {
      console.log("✅ Server is ready and listening at http://localhost:5000");
    });
  } catch (error) {
    console.error("❌ FATAL ERROR: Failed to connect to the database. Server will not start.", error);
    process.exit(1);
  }
};
startServer();