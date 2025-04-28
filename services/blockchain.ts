import { ethers } from 'ethers';
import connectToDatabase from '@/lib/mongodb';
import { Transaction, UserBonus } from '@/models/Bonus';

// Минимальная награда за победу в игре
const MIN_GAME_REWARD = 5;
// Максимальная награда за победу в игре
const MAX_GAME_REWARD = 25;

interface BlockchainConfig {
  rpcUrl: string;
  poolAddress: string;
  poolPrivateKey: string;
}

// Получаем конфигурацию из переменных окружения
function getBlockchainConfig(): BlockchainConfig {
  return {
    rpcUrl: process.env.DECIMAL_CHAIN_RPC_URL || 'https://node.decimalchain.com/web3/',
    poolAddress: process.env.GAME_POOL_ADDRESS || '',
    poolPrivateKey: process.env.GAME_POOL_PRIVATE_KEY || '',
  };
}

// Создаем провайдер и кошелек для DecimalChain
function setupBlockchainWallet() {
  const config = getBlockchainConfig();
  
  if (!config.poolAddress || !config.poolPrivateKey) {
    throw new Error('Blockchain pool wallet not configured');
  }
  
  const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
  const wallet = new ethers.Wallet(config.poolPrivateKey, provider);
  
  return { provider, wallet, config };
}

// Получить баланс игрового пула
export async function getPoolBalance() {
  try {
    const { provider, config } = setupBlockchainWallet();
    const balance = await provider.getBalance(config.poolAddress);
    return ethers.utils.formatEther(balance);
  } catch (error) {
    console.error('Failed to get pool balance:', error);
    throw error;
  }
}

// Начислить бонус пользователю за победу в игре
export async function awardGameWinBonus(userId: string, gameId: string) {
  await connectToDatabase();
  
  try {
    // Генерируем случайную награду в диапазоне
    const rewardAmount = Math.floor(
      Math.random() * (MAX_GAME_REWARD - MIN_GAME_REWARD + 1) + MIN_GAME_REWARD
    );
    
    // Создаем транзакцию в БД
    const transaction = new Transaction({
      userId,
      amount: rewardAmount,
      type: 'game_win',
      status: 'completed',
      description: `Reward for winning game ${gameId}`,
    });
    
    await transaction.save();
    
    // Обновляем баланс пользователя
    const userBonus = await UserBonus.findOneAndUpdate(
      { userId },
      { 
        $inc: { 
          balance: rewardAmount,
          totalEarned: rewardAmount 
        },
        $push: { transactions: transaction._id }
      },
      { upsert: true, new: true }
    );
    
    return { 
      success: true, 
      reward: rewardAmount, 
      balance: userBonus.balance 
    };
  } catch (error) {
    console.error('Failed to award game win bonus:', error);
    throw error;
  }
}

// Вывод бонусов на кошелек пользователя
export async function withdrawBonus(userId: string, walletAddress: string, amount: number) {
  await connectToDatabase();
  
  try {
    // Проверяем баланс пользователя
    const userBonus = await UserBonus.findOne({ userId });
    
    if (!userBonus || userBonus.balance < amount) {
      return { success: false, message: 'Insufficient balance' };
    }
    
    // Создаем транзакцию в БД со статусом pending
    const transaction = new Transaction({
      userId,
      amount,
      type: 'withdrawal',
      status: 'pending',
      description: `Withdrawal to wallet ${walletAddress}`,
    });
    
    await transaction.save();
    
    try {
      // Отправляем средства на кошелек пользователя
      const { wallet } = setupBlockchainWallet();
      
      const tx = await wallet.sendTransaction({
        to: walletAddress,
        value: ethers.utils.parseEther(amount.toString()),
      });
      
      // Обновляем транзакцию с хешем и статусом
      transaction.txHash = tx.hash;
      transaction.status = 'completed';
      await transaction.save();
      
      // Обновляем баланс пользователя
      await UserBonus.findOneAndUpdate(
        { userId },
        { 
          $inc: { 
            balance: -amount, 
            totalSpent: amount 
          },
          $push: { transactions: transaction._id }
        }
      );
      
      return { 
        success: true, 
        txHash: tx.hash, 
        message: 'Withdrawal successful' 
      };
    } catch (blockchainError) {
      // В случае ошибки блокчейна, обновляем статус транзакции
      transaction.status = 'failed';
      await transaction.save();
      
      throw blockchainError;
    }
  } catch (error) {
    console.error('Failed to withdraw bonus:', error);
    throw error;
  }
}

// Получить бонусный баланс пользователя
export async function getUserBonusBalance(userId: string) {
  await connectToDatabase();
  
  try {
    const userBonus = await UserBonus.findOne({ userId });
    
    if (!userBonus) {
      return { balance: 0, totalEarned: 0, totalSpent: 0 };
    }
    
    return {
      balance: userBonus.balance,
      totalEarned: userBonus.totalEarned,
      totalSpent: userBonus.totalSpent,
    };
  } catch (error) {
    console.error('Failed to get user bonus balance:', error);
    throw error;
  }
}

// Получить историю транзакций пользователя
export async function getUserTransactions(userId: string, limit = 10) {
  await connectToDatabase();
  
  try {
    const transactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit);
    
    return transactions;
  } catch (error) {
    console.error('Failed to get user transactions:', error);
    throw error;
  }
}

// Функция для получения баланса кошелька
export async function getWalletBalance(address: string): Promise<number> {
  try {
    // Здесь должен быть запрос к API блокчейна
    // Для демонстрации возвращаем рандомный баланс
    return Math.random() * 100;
  } catch (error) {
    console.error('Error fetching wallet balance:', error);
    return 0;
  }
}

// Функция для совершения транзакции
export async function createTransaction(fromAddress: string, toAddress: string, amount: number): Promise<boolean> {
  try {
    // Здесь должна быть логика отправки транзакции в блокчейн
    // Для демонстрации просто логгируем и возвращаем успех
    console.log(`Transaction: ${fromAddress} -> ${toAddress}, amount: ${amount}`);
    
    // Подключаемся к базе данных
    await connectToDatabase();
    
    // Обновляем информацию о транзакции в базе данных
    // ... (здесь должен быть код для обновления БД)
    
    return true;
  } catch (error) {
    console.error('Error creating transaction:', error);
    return false;
  }
} 