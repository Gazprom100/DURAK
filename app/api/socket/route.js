import { Server } from 'socket.io';
import { initSocket } from './socket.js';

export function initSocketServer(httpServer) {
  const corsOptions = {
    origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  };

  return initSocket(httpServer, '/api/socket', corsOptions);
} 