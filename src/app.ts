import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import watchtowerRoutes from './routes/api';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', watchtowerRoutes);

// Basic health check
app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI as string)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

export default app; 