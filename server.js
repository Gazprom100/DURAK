// Файл server.js для корректного запуска Next.js в режиме standalone с поддержкой Socket.IO
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { parse } from 'url';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Определение __dirname в ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Получение абсолютного пути к standalone директории
const standaloneDir = path.join(__dirname, '.next/standalone');

// Проверка наличия standalone директории (созданной next build с опцией output: standalone)
if (!fs.existsSync(standaloneDir)) {
  console.error('Standalone directory not found. Make sure to build with "output: standalone" option.');
  process.exit(1);
}

// Динамический импорт сервера Next.js из standalone директории
const nextServerPath = path.join(standaloneDir, 'server.js');

async function startServer() {
  try {
    // Импортируем next сервер из standalone директории
    const { default: nextServer } = await import(nextServerPath);
    
    // Определение порта и хоста
    const port = process.env.PORT || 10000;
    const hostname = process.env.HOSTNAME || '0.0.0.0';
    
    // Создаем HTTP сервер
    const httpServer = createServer(async (req, res) => {
      try {
        // Парсим URL для определения пути
        const parsedUrl = parse(req.url, true);
        
        // Передача запроса Next.js серверу
        await nextServer(req, res, parsedUrl);
      } catch (err) {
        console.error('Error handling request:', err);
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    });
    
    // Инициализируем Socket.IO
    const io = new SocketServer(httpServer, {
      path: '/api/socket',
      cors: {
        origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
      }
    });
    
    // Настройка базовых обработчиков Socket.IO
    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);
      
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
    
    // Импортируем функции обработки Socket.IO из соответствующего файла
    try {
      const socketModule = await import('./server/socket.js');
      if (typeof socketModule.default === 'function') {
        socketModule.default(io);
      }
    } catch (err) {
      console.error('Failed to load socket handlers:', err);
    }
    
    // Запускаем сервер
    httpServer.listen(port, hostname, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer(); 