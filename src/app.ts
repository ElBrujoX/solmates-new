import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import apiRoutes from './routes/api';
import { requestLogger } from './middleware/logging';
import logger from './utils/logger';
import { RequestHandler } from 'express-serve-static-core';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';

// Load environment variables
dotenv.config();

const app = express();

// Basic security middleware
app.use(helmet());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['X-API-KEY', 'Content-Type']
}));
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
app.use(express.json());
app.use(rateLimitHeaders);
app.use(globalLimiter);

// Add logging middleware before routes
app.use(requestLogger);

// Routes
app.use('/api', apiRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
  
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((_req: express.Request, res: express.Response) => {
  res.status(404).json({ error: 'Not Found' });
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI as string)
  .then(() => {
    logger.info('Connected to MongoDB');
  })
  .catch((error) => {
    logger.error('MongoDB connection error:', error);
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  });

// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Solmates API',
      version: '1.0.0',
      description: 'Solmates Scam Reports API'
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`
      }
    ]
  },
  apis: ['./src/routes/*.ts']
};

const specs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Serve static files
app.use(express.static('public'));

export default app; 