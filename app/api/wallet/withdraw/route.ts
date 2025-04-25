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
    const { amount, toAddress } = await req.json();
    
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount', success: false }, 
        { status: 400 }
      );
    }
    
    if (!toAddress) {
      return NextResponse.json(
        { error: 'Withdrawal address is required', success: false }, 
        { status: 400 }
      );
    }

    // Проверяем создан ли кошелек пользователя и достаточно ли средств
    const username = session.user.name || '';
    const user = getUserByName(username);
    
    if (!user || !user.walletCreated) {
      return NextResponse.json(
        { error: 'Wallet not created', success: false }, 
        { status: 400 }
      );
    }
    
    // Проверяем баланс
    const currentBalance = parseFloat(user.walletBalance);
    const withdrawalAmount = parseFloat(amount);
    
    if (currentBalance < withdrawalAmount) {
      return NextResponse.json(
        { error: 'Insufficient funds', success: false }, 
        { status: 400 }
      );
    }

    // Обновляем баланс пользователя
    const newBalance = currentBalance - withdrawalAmount;
    
    // Обновляем данные пользователя
    updateUser(user.id, {
      walletBalance: newBalance.toString()
    });
    
    return NextResponse.json({
      success: true,
      message: `Withdrawal of ${amount} DEL to ${toAddress.substring(0, 8)}... was processed successfully`,
      newBalance: newBalance.toString(),
      txHash: `mock-withdrawal-${Date.now()}`
    });
  } catch (error: any) {
    console.error('Error processing withdrawal:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred', success: false }, 
      { status: 500 }
    );
  }
} 