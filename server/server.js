import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './config/db.js';
import { initNodemailer } from './config/nodemailer.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import petRoutes from './routes/petRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import nearbyRoutes from './routes/nearbyRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Get ES Module dirname equivalents
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure socket.io with CORS
export const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Connect to Database & Mailer
connectDB();
initNodemailer();

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Uploaded Files Statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Test route
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', message: 'PawLink API is running and ready!' });
});

// REST API Mappings
app.use('/api/auth', authRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/nearby', nearbyRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// Socket.io Connection Logic
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // User joins a room named after their database ID for targeted alerts
  socket.on('join_user', (userId) => {
    if (userId) {
      socket.join(userId);
      console.log(`User ${userId} joined room.`);
    }
  });

  // Admin registers to join the admin-only alert room
  socket.on('join_admin', () => {
    socket.join('admin_room');
    console.log(`Admin joined admin_room.`);
  });

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Global Error Handler for upload files and routing
app.use((err, req, res, next) => {
  if (err instanceof Error) {
    return res.status(400).json({ success: false, message: err.message });
  }
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(` 🐾 PAWLINK BACKEND RUNNING ON PORT ${PORT}`);
  console.log(` Mode: ES Modules`);
  console.log(` API Endpoint: http://localhost:${PORT}`);
  console.log(`=========================================`);
});
