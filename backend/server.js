import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './src/config/db.js';
import errorHandler from './src/middlewares/error.middleware.js';
import authRoutes from './src/routes/auth.routes.js';
import userRoutes from './src/routes/user.routes.js';
import companyRoutes from './src/routes/company.routes.js';
import roomRoutes from './src/routes/room.routes.js';
import interviewRoutes from './src/routes/interview.routes.js';
import queueRoutes from './src/routes/queue.routes.js';
import homepageSettingsRoutes from './src/routes/homepage.settings.routes.js';
import { socketHandler } from './src/sockets/socketHandler.js';
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
app.use(cookieParser());

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
  }
});

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Socket.io setup
socketHandler(io);
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/entreprises', companyRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/queues', queueRoutes);
app.use('/api/homepage-settings', homepageSettingsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is running!' });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

export default app;