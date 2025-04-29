import { NextResponse } from 'next/server';

export async function GET() {
  // Собираем базовую информацию о состоянии приложения
  const healthInfo = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    nextAuthUrl: process.env.NEXTAUTH_URL,
    hostname: process.env.HOSTNAME,
    port: process.env.PORT,
    // Не показываем чувствительные данные
    mongoDbConfigured: Boolean(process.env.MONGODB_URI || process.env.MONGODB_PASSWORD),
  };

  return NextResponse.json(healthInfo);
} 