import 'dotenv/config';                          // Must be first line
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import connectDB from './config/db.js';
import { connectRedis } from './config/redis.js';
import { errorHandler, notFound } from './middlewares/error.middleware.js';
import socketHandler from './socket/socket.handler.js';

import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import eventRoutes from './routes/event.routes.js';
import teamRoutes from './routes/team.routes.js';
import submissionRoutes from './routes/submission.routes.js';
import qrRoutes from './routes/qr.routes.js';
import judgeRoutes from './routes/judge.routes.js';
import adminRoutes from './routes/admin.routes.js';

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Top-level await works natively in ES modules
await connectDB();
await connectRedis();

// Global middlewares
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Attach io to req so any controller can emit events
app.use((req, _res, next) => { req.io = io; next(); });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/judge', judgeRoutes);
app.use('/api/admin', adminRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

socketHandler(io);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));