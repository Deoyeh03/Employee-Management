import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import http from 'http';
import { initSocket } from './socket';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize socket instance
initSocket(server);

const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

import authRoutes from './routes/auth';
import employeeRoutes from './routes/employees';
import attendanceRoutes from './routes/attendance';
import performanceRoutes from './routes/performance';
import overviewRoutes from './routes/overview';
import shiftsRoutes from './routes/shifts';

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/overview', overviewRoutes);
app.use('/api/shifts', shiftsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

server.listen(Number(port), '0.0.0.0', () => {
  console.log(`Server is running on port ${port} at 0.0.0.0`);
});
