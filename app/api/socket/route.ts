import { NextRequest, NextResponse } from 'next/server';
import { Server as ServerIO } from 'socket.io';
import { Server as HttpServer } from 'http';
import { initSocket } from '@/server/socket.js';

// Глобальный объект для хранения инстанса Socket.IO 
let io: ServerIO | null = null;

// Новая схема конфигурации для роута
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Для App Router нужно использовать Edge API для WebSockets
export async function GET() {
  try {
    // Возвращаем информацию о статусе сокет-сервера
    if (!io) {
      console.error('Socket server is not initialized');
      return NextResponse.json(
        { message: 'Socket server is not initialized' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { 
        message: 'Socket server is running', 
        clients: io.engine.clientsCount,
        serverInfo: {
          hostname: process.env.HOSTNAME,
          port: process.env.PORT,
          nextAuthUrl: process.env.NEXTAUTH_URL
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in socket route:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}

// Функция для инициализации Socket.IO и подключения к HTTP серверу Next.js
export function initSocketServer(httpServer: HttpServer) {
  if (!io) {
    console.log('Initializing Socket.IO server...');
    try {
      // Инициализируем Socket.IO с параметрами
      const corsOptions = {
        origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization'],
        transports: ['websocket', 'polling']
      };
      
      io = initSocket(httpServer, '/api/socket', corsOptions);
      
      // Добавляем обработчики ошибок
      io.engine.on('connection_error', (err) => {
        console.error('Socket.IO connection error:', err);
      });
      
      console.log('Socket.IO server initialized with options:', {
        path: '/api/socket',
        cors: corsOptions
      });
    } catch (error) {
      console.error('Failed to initialize Socket.IO server:', error);
      throw error;
    }
  }
  
  return io;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // In a real implementation, we'd handle socket authentication here
    return NextResponse.json({ 
      message: 'Socket connection request received',
      userId: body.userId || 'anonymous',
      serverInfo: {
        hostname: process.env.HOSTNAME,
        port: process.env.PORT,
        nextAuthUrl: process.env.NEXTAUTH_URL
      }
    });
  } catch (error) {
    console.error('Error in socket POST route:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}