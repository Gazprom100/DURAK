import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectToDatabase from '@/lib/mongodb';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import Transaction from '@/models/Transaction';
import Wallet from '@/models/Wallet';

// GET запрос для получения данных транзакции по ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Получаем сессию пользователя
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized', success: false }, 
        { status: 401 }
      );
    }

    // Подключение к базе данных
    await connectToDatabase();
    
    // Получаем ID транзакции из параметров
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Transaction ID is required', success: false }, 
        { status: 400 }
      );
    }
    
    // Находим транзакцию
    const transaction = await Transaction.findById(id);
    
    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found', success: false }, 
        { status: 404 }
      );
    }
    
    // Получаем кошелек пользователя, чтобы проверить права доступа
    const wallet = await Wallet.findOne({ userId: session.user.id });
    
    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet not found', success: false }, 
        { status: 404 }
      );
    }
    
    // Проверяем, относится ли транзакция к кошельку пользователя
    if (transaction.fromAddress !== wallet.address && transaction.toAddress !== wallet.address) {
      return NextResponse.json(
        { error: 'You do not have permission to view this transaction', success: false }, 
        { status: 403 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: transaction
    });
  } catch (error: any) {
    console.error('Error fetching transaction:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch transaction', success: false }, 
      { status: 500 }
    );
  }
}

// DELETE запрос для отмены транзакции (если это возможно)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Получаем сессию пользователя
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized', success: false }, 
        { status: 401 }
      );
    }

    // Подключение к базе данных
    await connectToDatabase();
    
    // Получаем ID транзакции из параметров
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Transaction ID is required', success: false }, 
        { status: 400 }
      );
    }
    
    // Находим транзакцию
    const transaction = await Transaction.findById(id);
    
    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found', success: false }, 
        { status: 404 }
      );
    }
    
    // Получаем кошелек пользователя
    const wallet = await Wallet.findOne({ userId: session.user.id });
    
    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet not found', success: false }, 
        { status: 404 }
      );
    }
    
    // Проверяем, является ли пользователь отправителем транзакции
    if (transaction.fromAddress !== wallet.address) {
      return NextResponse.json(
        { error: 'You can only cancel transactions from your own wallet', success: false }, 
        { status: 403 }
      );
    }
    
    // Проверяем, можно ли отменить транзакцию 
    // (только если статус "pending" или создана не более 24 часов назад)
    if (transaction.status !== 'pending') {
      const createdTime = new Date(transaction.createdAt).getTime();
      const currentTime = new Date().getTime();
      const hoursDiff = (currentTime - createdTime) / (1000 * 60 * 60);
      
      if (hoursDiff > 24) {
        return NextResponse.json(
          { error: 'Cannot cancel transactions older than 24 hours', success: false }, 
          { status: 400 }
        );
      }
    }
    
    // Обновляем статус транзакции на "cancelled"
    transaction.status = 'cancelled';
    await transaction.save();
    
    // Возвращаем средства отправителю, если они были списаны
    const senderWallet = await Wallet.findOne({ address: transaction.fromAddress });
    if (senderWallet) {
      senderWallet.balance = parseFloat(senderWallet.balance.toString()) + parseFloat(transaction.amount.toString());
      await senderWallet.save();
    }
    
    // Если была транзакция между кошельками, отнимаем средства у получателя
    const recipientWallet = await Wallet.findOne({ address: transaction.toAddress });
    if (recipientWallet) {
      const newBalance = parseFloat(recipientWallet.balance.toString()) - parseFloat(transaction.amount.toString());
      // Проверяем, чтобы баланс не стал отрицательным
      recipientWallet.balance = Math.max(0, newBalance);
      await recipientWallet.save();
    }
    
    return NextResponse.json({
      success: true,
      message: 'Transaction cancelled successfully',
      data: transaction
    });
  } catch (error: any) {
    console.error('Error cancelling transaction:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cancel transaction', success: false }, 
      { status: 500 }
    );
  }
} 