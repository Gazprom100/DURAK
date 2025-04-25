import { NextRequest, NextResponse } from 'next/server';
import { Server as ServerIO } from 'socket.io';
import type { NextApiRequest } from 'next';
import type { Socket as NetSocket } from 'net';
import { Server as HttpServer } from 'http';

// Глобальный объект для хранения инстанса Socket.IO 
let io: ServerIO | null = null;

// Для App Router нужно использовать Edge API для WebSockets
export async function GET() {
  // Возвращаем информацию о статусе сокет-сервера
  if (!io) {
    return NextResponse.json(
      { message: 'Socket server is not initialized' },
      { status: 503 }
    );
  }
  
  return NextResponse.json(
    { message: 'Socket server is running', clients: io.engine.clientsCount },
    { status: 200 }
  );
}

// Функция для инициализации Socket.IO и подключения к HTTP серверу Next.js
export function initSocketServer(httpServer: HttpServer) {
  if (!io) {
    console.log('Initializing Socket.IO server...');
    io = new ServerIO(httpServer, {
      path: '/api/socket',
      cors: {
        origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
      },
      addTrailingSlash: false,
    });
    
    // Логика подключения из server/socket.ts будет перенесена сюда
    setupSocketHandlers(io);
    
    console.log('Socket.IO server initialized');
  }
  
  return io;
}

// Обработчики событий Socket.IO
function setupSocketHandlers(io: ServerIO) {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Существующие обработчики из server/socket.ts
    // будут перенесены сюда при интеграции
    
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
}

// Для обратной совместимости со старым кодом
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  const body = await req.json();
  
  // In a real implementation, we'd handle socket authentication here
  return NextResponse.json({ 
    message: 'Socket connection request received',
    userId: body.userId || 'anonymous' 
  });
} 