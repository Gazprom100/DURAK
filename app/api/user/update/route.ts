import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';

// Импортируем Map с пользователями и приватными ключами
// На сервере можно напрямую изменять эти данные
import { getUserById, updateUser } from '@/utils/user-store';

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
    
    // Получаем данные для обновления
    const updateData = await req.json();
    
    // Проверяем, что данные содержат допустимые поля
    const allowedFields = ['walletAddress', 'walletCreated', 'walletBalance', 'bonusPoints', 'wins', 'losses', 'gamesPlayed', 'privateKey'];
    
    // Фильтруем только разрешенные поля
    const validUpdateData = Object.keys(updateData)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updateData[key];
        return obj;
      }, {} as Record<string, any>);
    
    if (Object.keys(validUpdateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update', success: false }, 
        { status: 400 }
      );
    }
    
    // Обновляем данные пользователя
    const userId = session.user.id;
    updateUser(userId, validUpdateData);
    
    return NextResponse.json({
      success: true,
      message: 'User data updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating user data:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred', success: false }, 
      { status: 500 }
    );
  }
} 