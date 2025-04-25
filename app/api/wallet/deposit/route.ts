import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import connectToDatabase from '@/lib/mongodb';
import Wallet from '@/models/Wallet';
import Transaction from '@/models/Transaction';
import { TransactionType } from '@/models/Transaction';
import { ethers } from 'ethers';

// Признак серверной среды - всегда true в API роутах
const isServer = true;

// Провайдер для подключения к Decimal Chain
const decimalProvider = new ethers.providers.JsonRpcProvider('https://node.decimalchain.com/web3/');

// Функция для получения баланса кошелька (перенесена в этот файл)
async function getBalance(address: string): Promise<number> {
  try {
    const checksumAddress = ethers.utils.getAddress(address);
    const balanceWei = await decimalProvider.getBalance(checksumAddress);
    return parseFloat(ethers.utils.formatEther(balanceWei));
  } catch (error) {
    console.error('Error fetching balance:', error);
    // Вместо ошибки возвращаем -1, чтобы не прерывать основной поток
    return -1;
  }
}

export async function POST(req: NextRequest) {
  try {
    // Проверяем авторизацию пользователя
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized', success: false }, 
        { status: 401 }
      );
    }
    
    // Получаем данные из запроса
    const data = await req.json();
    const { amount } = data;
    
    // Проверяем корректность суммы
    const depositAmount = parseFloat(amount);
    if (!depositAmount || isNaN(depositAmount) || depositAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount', success: false },
        { status: 400 }
      );
    }
    
    // Подключаемся к базе данных
    await connectToDatabase();
    
    // Находим кошелек пользователя
    const wallet = await Wallet.findOne({ userId: session.user.id });
    
    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet not found', success: false },
        { status: 404 }
      );
    }
    
    // В реальном приложении здесь должна быть интеграция с платежной системой
    // или блокчейном для подтверждения депозита
    // Сейчас просто обновляем баланс в базе данных для демонстрации
    
    // Обновляем баланс кошелька в локальной базе данных
    const currentBalanceInDB = parseFloat(wallet.balance.toString());
    wallet.balance = currentBalanceInDB + depositAmount;
    await wallet.save();
    
    // Проверяем баланс через API блокчейна (для сверки)
    try {
      const chainBalance = await getBalance(wallet.address);
      if (chainBalance >= 0) {
        console.log(`Chain balance: ${chainBalance}, DB balance: ${wallet.balance}`);
      }
      
      // Здесь можно добавить логику синхронизации, если балансы не совпадают
    } catch (error) {
      console.warn('Failed to verify chain balance:', error);
      // Продолжаем выполнение, несмотря на ошибку проверки
    }
    
    // Создаем запись о транзакции
    const transaction = new Transaction({
      toAddress: wallet.address,
      amount: depositAmount,
      type: TransactionType.DEPOSIT,
      status: 'completed',
      metadata: { depositMethod: 'api' }
    });
    
    await transaction.save();
    
    return NextResponse.json({
      success: true,
      message: 'Deposit successful',
      data: {
        newBalance: wallet.balance,
        transaction: {
          id: transaction._id,
          amount: transaction.amount,
          status: transaction.status
        }
      }
    });
    
  } catch (error: any) {
    console.error('Error processing deposit:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process deposit', success: false },
      { status: 500 }
    );
  }
} 