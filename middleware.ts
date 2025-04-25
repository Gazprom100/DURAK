import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware для отслеживания и обработки запросов
export async function middleware(request: NextRequest) {
  // Добавление заголовков для решения проблем с CORS
  const response = NextResponse.next();
  
  // Устанавливаем CORS заголовки
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Настраиваем заголовки для кэширования и безопасности
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  response.headers.set('Surrogate-Control', 'no-store');
  
  // Добавляем заголовки безопасности
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  return response;
}

// Настраиваем middleware для выполнения на всех маршрутах
export const config = {
  matcher: [
    /*
     * Матчим все маршруты, кроме:
     * - API маршрутов (которые начинаются с /api)
     * - Статических файлов (изображений, шрифтов, видео и т.д.)
     * - Внутренних маршрутов Next.js (_next/)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 