import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import { getUserByName, updateUser } from '@/utils/user-store';

// Признак серверной среды - всегда true в API роутах
const isServer = true;

export async function POST(req: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized', success: false }, 
        { status: 401 }
      );
    }

    // Get request data
    const { amount } = await req.json();
    
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount', success: false }, 
        { status: 400 }
      );
    }

    // Проверяем создан ли кошелек пользователя
    const username = session.user.name || '';
    const user = getUserByName(username);
    
    if (!user || !user.walletCreated) {
      return NextResponse.json(
        { error: 'Wallet not created', success: false }, 
        { status: 400 }
      );
    }

    // В реальном приложении тут была бы интеграция с платежной системой
    // Для демо просто обновляем баланс пользователя
    
    // Обновляем баланс пользователя
    const currentBalance = parseFloat(user.walletBalance);
    const newBalance = currentBalance + parseFloat(amount);
    
    // Обновляем данные пользователя
    updateUser(user.id, {
      walletBalance: newBalance.toString()
    });
    
    return NextResponse.json({
      success: true,
      message: `Deposit of ${amount} DEL was processed successfully`,
      newBalance: newBalance.toString(),
    });
  } catch (error: any) {
    console.error('Error processing deposit:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred', success: false }, 
      { status: 500 }
    );
  }
} 