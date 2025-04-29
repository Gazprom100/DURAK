import { NextResponse } from 'next/server';
import os from 'os';

export async function GET() {
  // Собираем базовую информацию о состоянии приложения
  const healthInfo = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    
    // Информация о среде
    environment: {
      nodeEnv: process.env.NODE_ENV,
      nextAuthUrl: process.env.NEXTAUTH_URL,
      hostname: process.env.HOSTNAME,
      port: process.env.PORT,
      disableMongoDB: process.env.DISABLE_MONGODB === 'true',
    },
    
    // Информация о системе
    system: {
      platform: os.platform(),
      release: os.release(),
      totalMemory: Math.round(os.totalmem() / (1024 * 1024)) + ' MB',
      freeMemory: Math.round(os.freemem() / (1024 * 1024)) + ' MB',
      uptime: Math.round(os.uptime() / 60) + ' minutes',
      loadAvg: os.loadavg(),
    },
    
    // Статус конфигурации
    config: {
      mongoDbConfigured: Boolean(process.env.MONGODB_URI || process.env.MONGODB_PASSWORD),
      serverMode: process.env.DISABLE_MONGODB === 'true' ? 'static-mode' : 'database-mode',
      nextAuth: Boolean(process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_URL),
    },
    
    // Пути API
    availableEndpoints: [
      '/api/health',
      '/api/auth/[...nextauth]',
      '/api/socket',
      '/api/transactions',
      '/api/wallet/create',
      '/api/wallet/deposit',
      '/api/wallet/withdraw',
    ],
  };

  return NextResponse.json(healthInfo);
} 