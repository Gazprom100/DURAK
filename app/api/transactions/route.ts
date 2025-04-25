import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectToDatabase from '@/lib/mongodb';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import Transaction from '@/models/Transaction';
import User from '@/models/User';
import Wallet from '@/models/Wallet';

// GET запрос для получения списка транзакций
export async function GET(req: NextRequest) {
  try {
    // Получаем сессию пользователя
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized', success: false }, 
        { status: 401 }
      );
    }

    await connectToDatabase();
    
    // Получаем кошелек пользователя
    const wallet = await Wallet.findOne({ userId: session.user.id });
    
    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet not found', success: false }, 
        { status: 404 }
      );
    }
    
    const { searchParams } = new URL(req.url);
    
    // Параметры пагинации
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    // Параметры фильтрации
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    // Формируем базовый запрос
    const query: any = {
      $or: [
        { fromAddress: wallet.address },
        { toAddress: wallet.address }
      ]
    };
    
    // Добавляем фильтры, если они указаны
    if (type) query.type = type;
    if (status) query.status = status;
    
    // Счётчик общего количества транзакций
    const total = await Transaction.countDocuments(query);
    
    // Получаем список транзакций
    const transactions = await Transaction.find(query)
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(limit);
    
    return NextResponse.json({
      success: true,
      data: transactions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch transactions', success: false }, 
      { status: 500 }
    );
  }
}

// POST запрос для создания новой транзакции
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

    await connectToDatabase();
    
    // Получаем данные из запроса
    const data = await req.json();
    const { amount, toAddress, type, description } = data;
    
    // Валидация входных данных
    if (!amount || isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount', success: false }, 
        { status: 400 }
      );
    }
    
    if (!type || !['deposit', 'withdrawal', 'transfer'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid transaction type', success: false }, 
        { status: 400 }
      );
    }
    
    // Находим кошелек пользователя
    const wallet = await Wallet.findOne({ userId: session.user.id });
    
    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet not found', success: false }, 
        { status: 404 }
      );
    }
    
    let transaction;
    
    if (type === 'transfer') {
      // Проверяем существование кошелька получателя
      if (!toAddress) {
        return NextResponse.json(
          { error: 'Recipient address is required', success: false }, 
          { status: 400 }
        );
      }
      
      const recipientWallet = await Wallet.findOne({ address: toAddress });
      
      if (!recipientWallet) {
        return NextResponse.json(
          { error: 'Recipient wallet not found', success: false }, 
          { status: 404 }
        );
      }
      
      // Проверяем баланс отправителя
      if (wallet.balance < amount) {
        return NextResponse.json(
          { error: 'Insufficient funds', success: false }, 
          { status: 400 }
        );
      }
      
      // Списываем средства с кошелька отправителя
      wallet.balance = parseFloat(wallet.balance.toString()) - amount;
      await wallet.save();
      
      // Зачисляем средства на кошелек получателя
      recipientWallet.balance = parseFloat(recipientWallet.balance.toString()) + amount;
      await recipientWallet.save();
      
      // Создаем транзакцию
      transaction = await Transaction.create({
        fromAddress: wallet.address,
        toAddress,
        amount,
        type,
        status: 'completed',
        description: description || 'Transfer to another wallet'
      });
    } else if (type === 'deposit') {
      // Для пополнения средств
      wallet.balance = parseFloat(wallet.balance.toString()) + amount;
      await wallet.save();
      
      transaction = await Transaction.create({
        toAddress: wallet.address,
        amount,
        type,
        status: 'completed',
        description: description || 'Deposit to wallet'
      });
    } else if (type === 'withdrawal') {
      // Проверяем баланс
      if (wallet.balance < amount) {
        return NextResponse.json(
          { error: 'Insufficient funds', success: false }, 
          { status: 400 }
        );
      }
      
      // Списываем средства
      wallet.balance = parseFloat(wallet.balance.toString()) - amount;
      await wallet.save();
      
      transaction = await Transaction.create({
        fromAddress: wallet.address,
        amount,
        type,
        status: 'completed',
        description: description || 'Withdrawal from wallet'
      });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Transaction created successfully',
      data: transaction
    });
  } catch (error: any) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create transaction', success: false }, 
      { status: 500 }
    );
  }
}

// PUT запрос для создания новой транзакции (альтернативный метод)
export async function PUT(req: NextRequest) {
  return POST(req);
}

// PATCH запрос для обновления статуса транзакции
export async function PATCH(req: NextRequest) {
  try {
    // Получаем сессию пользователя
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized', success: false }, 
        { status: 401 }
      );
    }

    await connectToDatabase();
    
    // Получаем данные из запроса
    const data = await req.json();
    const { id, status, description } = data;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Transaction ID is required', success: false }, 
        { status: 400 }
      );
    }
    
    // Проверяем наличие параметров для обновления
    if (!status && !description) {
      return NextResponse.json(
        { error: 'No data provided for update', success: false }, 
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
    
    // Проверяем, имеет ли пользователь права на изменение этой транзакции
    // (должен быть владельцем кошелька отправителя)
    if (transaction.fromAddress !== wallet.address) {
      return NextResponse.json(
        { error: 'You do not have permission to update this transaction', success: false }, 
        { status: 403 }
      );
    }
    
    // Обновляем поля транзакции
    if (status) {
      transaction.status = status;
    }
    
    if (description) {
      transaction.description = description;
    }
    
    await transaction.save();
    
    return NextResponse.json({
      success: true,
      message: 'Transaction updated successfully',
      data: transaction
    });
  } catch (error: any) {
    console.error('Error updating transaction:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update transaction', success: false }, 
      { status: 500 }
    );
  }
} 