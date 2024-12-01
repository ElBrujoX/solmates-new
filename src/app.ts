import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import watchtowerRoutes from './routes/api';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
app.use('/api', watchtowerRoutes);

// Basic health check
app.get('/', (req, res) => {
  res.json({ status: 'API is running' });
});

// Connect to MongoDB with more detailed error handling
mongoose.connect(process.env.MONGODB_URI as string, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  dbName: 'solmates',
})
.then(() => {
  console.log('Connected to MongoDB');
  // Log connection details (without sensitive info)
  const conn = mongoose.connection;
  console.log(`MongoDB Connected: ${conn.host}`);
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Add error handlers
mongoose.connection.on('error', err => {
  console.error('MongoDB error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

export default app; 