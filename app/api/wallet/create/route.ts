import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions, getUserPrivateKey } from '@/app/api/auth/[...nextauth]/auth';
import { createWallet } from '@/utils/decimal';
import { getUserByName, updateUser } from '@/utils/user-store';

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
    
    // Получаем пользователя по имени
    const username = session.user.name || '';
    const user = getUserByName(username);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found', success: false }, 
        { status: 404 }
      );
    }
    
    // Напрямую обновляем данные пользователя в хранилище
    updateUser(user.id, {
      walletAddress: wallet.address,
      walletCreated: true,
      privateKey: wallet.privateKey, // В реальном приложении этот ключ должен быть зашифрован
    });

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