import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import tasksRouter from './routes/tasks.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use(async (_req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('DB connection error:', err.message);
    res.status(500).json({
      message: 'Database connection failed',
      error: err.message,
    });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.use('/api/tasks', tasksRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Unexpected server error' });
});

export default app;
