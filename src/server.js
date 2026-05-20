import http from 'http';
import app from './app.js';
import connectDB from './config/db.js';
import { initSocket } from './config/socket.js';
import env from './config/env.js';
import logger from './utils/logger.js';

const startServer = async () => {
  // 1. Establish database connection
  await connectDB();

  // 2. Wrap express app in native HTTP server for Socket.io integration
  const server = http.createServer(app);

  // 3. Initialize Socket.io instance
  const io = initSocket(server);
  logger.success('⚡ Real-time Socket.io server initialized');

  // 4. Launch listeners
  server.listen(env.port, () => {
    logger.success(`🚀 Server running in ${env.nodeEnv} mode at http://localhost:${env.port}`);
  });

  // Graceful shutdown handling
  const gracefulShutdown = (signal) => {
    logger.warn(`⚠️ Received ${signal}. Commencing graceful shutdown...`);
    
    server.close(() => {
      logger.info('HTTP server closed.');
      
      // Close Mongoose connection
      import('mongoose').then((mongoose) => {
        mongoose.default.connection.close(false).then(() => {
          logger.success('MongoDB connection closed.');
          process.exit(0);
        });
      });
    });

    // Forced shutdown fallback
    setTimeout(() => {
      logger.error('Forcefully shutting down because graceful shutdown took too long.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
};

// Catch unhandled rejections or runtime exceptions
process.on('unhandledRejection', (reason, promise) => {
  logger.error('💥 Unhandled Rejection at Promise:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('💥 Uncaught Exception thrown:', error);
  process.exit(1);
});

startServer();
