import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import apiRoutes from './routes/api';
import { requestLogger } from './middleware/logging';
import logger from './utils/logger';
import { RequestHandler } from 'express-serve-static-core';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

const app = express();

// Basic security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Global rate limit per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: { error: 'Too many requests from this IP' },
  handler: (req, res) => {
    logger.warn('Rate limit exceeded', {
      ip: req.ip,
      path: req.path
    });
    res.status(429).json({ error: 'Too many requests from this IP, please try again later' });
  }
});

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // limit each IP to 50 auth requests per hour
  message: { error: 'Too many authentication attempts' },
  handler: (req, res) => {
    logger.warn('Auth rate limit exceeded', {
      ip: req.ip,
      path: req.path
    });
    res.status(429).json({ error: 'Too many authentication attempts, please try again later' });
  }
});

// Different rate limits for different endpoints
const analyticsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many analytics requests' }
});

const reportsLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50,
  message: { error: 'Too many report requests' }
});

// Add rate limit headers
const rateLimitHeaders: RequestHandler = (req, res, next) => {
  if (req.rateLimit) {
    res.header('X-RateLimit-Limit', req.rateLimit.limit.toString());
    res.header('X-RateLimit-Remaining', req.rateLimit.remaining.toString());
    res.header('X-RateLimit-Reset', new Date(req.rateLimit.resetTime || Date.now()).toISOString());
  }
  next();
};

// Apply middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(rateLimitHeaders);

// Apply rate limits
app.use(globalLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/analytics', analyticsLimiter);
app.use('/api/reports', reportsLimiter);

// Add logging middleware before routes
app.use(requestLogger);

// Routes
app.use('/api', apiRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

// Basic error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Connect to MongoDB with error handling
mongoose.connect(process.env.MONGODB_URI as string)
  .then(() => {
    logger.info('Connected to MongoDB');
  })
  .catch((error) => {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Add error handlers for uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  logger.error('Unhandled Rejection:', error);
  process.exit(1);
});

export default app; 