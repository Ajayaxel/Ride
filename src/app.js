import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

// Environment loader & middleware handlers
import env from './config/env.js';
import router from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';

// Setup __dirname equivalent in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Global request logger
if (env.nodeEnv === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Security & Parsing Middlewares
app.use(cors({
  origin: env.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Serve static directory for uploaded content
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Root Route health test
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to the Ride Application Backend API API.',
    version: '1.0.0',
    documentation: '/api/v1/health',
  });
});

// API Routes Mount
app.use('/api/v1', router);

// Error fallback routes
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
