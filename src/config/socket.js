import { Server } from 'socket.io';
import logger from '../utils/logger.js';
import env from './env.js';

let io = null;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: env.corsOrigin,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    logger.info(`🔌 Socket Connected: ${socket.id}`);

    // Standard events
    socket.on('join_room', (roomId) => {
      socket.join(roomId);
      logger.debug(`Socket ${socket.id} joined room ${roomId}`);
    });

    socket.on('leave_room', (roomId) => {
      socket.leave(roomId);
      logger.debug(`Socket ${socket.id} left room ${roomId}`);
    });

    socket.on('disconnect', () => {
      logger.info(`🔌 Socket Disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io has not been initialized. Call initSocket first.');
  }
  return io;
};
