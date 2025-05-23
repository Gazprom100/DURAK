// Файл server.js для корректного запуска Next.js в режиме standalone
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

// Определяем режим запуска из переменных окружения
const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || '0.0.0.0';
const port = parseInt(process.env.PORT || '10000', 10);

// Создаем экземпляр Next.js приложения
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Подготовка приложения к старту
app.prepare().then(() => {
  // Создаем HTTP сервер
  createServer(async (req, res) => {
    try {
      // Разбираем URL запроса
      const parsedUrl = parse(req.url, true);
      
      // Устанавливаем CORS заголовки для безопасности
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      
      // Обрабатываем OPTIONS запросы для CORS preflight
      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
      }
      
      // Передаем запрос обработчику Next.js
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  }).listen(port, hostname, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
    
    // Добавляем обработку сигналов для корректного завершения работы
    ['SIGINT', 'SIGTERM'].forEach((signal) => {
      process.on(signal, () => {
        console.log(`> ${signal} signal received, closing server`);
        process.exit(0);
      });
    });
  });
}); 