import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import Wallet from '@/models/Wallet';
import { ethers } from 'ethers';

// API-маршрут для создания кошелька пользователя

// Признак серверной среды - всегда true в API роутах
const isServer = true;

// Функция для создания кошелька, перенесенная прямо в этот файл
function createWallet() {
  const wallet = ethers.Wallet.createRandom();
  return {
    address: wallet.address,
    privateKey: wallet.privateKey,
  };
}

// Функция для получения адреса из приватного ключа
function getAddressFromPrivateKey(privateKey: string): string {
  try {
    const wallet = new ethers.Wallet(privateKey);
    return wallet.address;
  } catch (error) {
    console.error('Error getting address from private key:', error);
    throw new Error('Invalid private key');
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
    
    // Подключаемся к базе данных
    await connectToDatabase();
    
    // Проверяем, существует ли пользователь
    const user = await User.findOne({ _id: session.user.id });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found', success: false }, 
        { status: 404 }
      );
    }
    
    // Проверяем, есть ли уже кошелек у пользователя
    const existingWallet = await Wallet.findOne({ userId: session.user.id });
    
    if (existingWallet) {
      return NextResponse.json(
        { error: 'Wallet already exists for this user', success: false }, 
        { status: 400 }
      );
    }
    
    // Создаем новый кошелек
    const { address, privateKey } = createWallet();
    
    // Проверяем, корректно ли создан кошелек
    if (!address || !privateKey) {
      console.error('Failed to create wallet');
      return NextResponse.json(
        { error: 'Failed to create wallet', success: false }, 
        { status: 500 }
      );
    }
    
    // Проверяем, что адрес может быть получен из приватного ключа
    try {
      const derivedAddress = getAddressFromPrivateKey(privateKey);
      if (derivedAddress.toLowerCase() !== address.toLowerCase()) {
        throw new Error('Address verification failed');
      }
    } catch (error) {
      console.error('Wallet validation failed:', error);
      return NextResponse.json(
        { error: 'Wallet validation failed', success: false }, 
        { status: 500 }
      );
    }
    
    // Сохраняем кошелек в базе данных
    const wallet = new Wallet({
      address: address,
      privateKey: privateKey,
      userId: session.user.id,
      balance: 0
    });
    
    await wallet.save();
    
    // Возвращаем информацию о созданном кошельке (без приватного ключа)
    return NextResponse.json({
      success: true,
      data: {
        address: wallet.address,
        balance: wallet.balance
      }
    });
    
  } catch (error: any) {
    console.error('Error creating wallet:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create wallet', success: false }, 
      { status: 500 }
    );
  }
} 