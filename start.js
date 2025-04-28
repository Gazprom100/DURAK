import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { initSocketServer } from './app/api/socket/route';

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || '0.0.0.0';
const port = process.env.PORT || 3000;

// Инициализация Next.js
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  // Создаем HTTP сервер
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  // Инициализируем Socket.IO с обработкой ошибок
  try {
    initSocketServer(server);
    console.log('Socket.IO initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Socket.IO, continuing without socket support:', error);
    // Продолжаем работу сервера даже без Socket.IO
  }

  // Запускаем сервер
  server.listen(port, hostname, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
}); 