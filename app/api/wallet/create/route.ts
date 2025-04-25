import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import { createWallet } from '@/utils/decimal';

// API-маршрут для создания кошелька пользователя

// Признак серверной среды - всегда true в API роутах
const isServer = true;

export async function POST(req: NextRequest) {
  try {
    // Получаем сессию пользователя
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized', success: false }, 
        { status: 401 }
      );
    }

    // Проверяем, есть ли уже кошелек у пользователя
    if (session.user.walletCreated && session.user.walletAddress) {
      return NextResponse.json(
        { error: 'Wallet already exists', success: false, walletAddress: session.user.walletAddress }, 
        { status: 400 }
      );
    }

    // Создаем мок-кошелек для работы в серверном окружении
    const wallet = await createWallet();
    
    // Добавляем информацию о кошельке в "базу данных" (в реальном приложении это будет БД)
    // Для этого вызываем специальный API-маршрут для обновления пользователя
    const updateResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/user/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Передаем текущую сессию через заголовки для аутентификации на сервере
        'x-auth-token': session.user.id,
      },
      body: JSON.stringify({
        walletAddress: wallet.address,
        walletCreated: true,
        privateKey: wallet.privateKey, // В реальном приложении этот ключ должен быть зашифрован
      }),
    });

    if (!updateResponse.ok) {
      throw new Error('Failed to update user with wallet information');
    }

    return NextResponse.json({
      success: true,
      message: 'Wallet created successfully',
      walletAddress: wallet.address,
    });
  } catch (error: any) {
    console.error('Error creating wallet:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while creating wallet', success: false }, 
      { status: 500 }
    );
  }
} 