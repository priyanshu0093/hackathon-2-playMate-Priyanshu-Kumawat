import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { initSocket } from './socket/index.js';

// Modular Route Handlers
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import turfRoutes from './routes/turfRoutes.js';
import matchRoutes from './routes/matchRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';

// Middlewares
import { optionalAuthenticate } from './middleware/auth.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 5001;

// Allowed CORS origins (Vite frontend on 5173/5174/3000)
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:5174,http://localhost:3000').split(',');

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(null, true); // Dev permissive
      }
    },
    credentials: true, // Allow cookies to be sent across origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static uploads serving for avatars and turf photographs
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB Atlas / Local MongoDB
connectDB();

// Initialize Socket.IO with HTTP server
initSocket(httpServer, allowedOrigins);

// ==========================================
// Scoped Real-Time Server-Sent Events (SSE)
// ==========================================
const sseClients = new Set();

setInterval(() => {
  for (const client of sseClients) {
    try {
      client.res.write(': heartbeat\n\n');
    } catch {
      sseClients.delete(client);
    }
  }
}, 25000);

app.get('/api/turfs/stream', optionalAuthenticate, (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
    'Access-Control-Allow-Origin': '*'
  });

  const client = {
    id: `sse_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    res,
    city: req.query.city ? String(req.query.city).toLowerCase() : null,
    userId: req.user ? req.user.id : null,
    userRole: req.user ? req.user.role : null
  };

  sseClients.add(client);

  res.write(`event: CONNECTED\ndata: ${JSON.stringify({ status: 'connected', clientId: client.id })}\n\n`);

  req.on('close', () => {
    sseClients.delete(client);
  });
});

app.get('/api/events', optionalAuthenticate, (req, res) => {
  res.redirect('/api/turfs/stream');
});

// ==========================================
// API Routes
// ==========================================
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/turfs', turfRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: 'MongoDB Atlas / Local',
    socket: 'active',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Centralized error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start HTTP Server only when run directly (not when imported for testing)
const isMainModule = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isMainModule) {
  httpServer.listen(PORT, () => {
    console.log(`[PlayMate Backend] Server + Socket.IO running on http://localhost:${PORT}`);
  });
}

export { app, httpServer };
export default app;
