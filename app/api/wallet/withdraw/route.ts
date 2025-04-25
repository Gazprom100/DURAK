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

// Константы для настройки сети
const DECIMAL_CHAIN_ID = 75;
const GAS_PRICE = ethers.utils.parseUnits('50000', 'gwei');
const GAS_LIMIT = 21000;

// Функция для получения баланса кошелька
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

// Функция для отправки DEL
async function sendDel(
  toAddress: string,
  amount: number,
  privateKey: string
): Promise<{ txHash: string; explorerUrl: string }> {
  try {
    // Создаем кошелек с приватным ключом
    const wallet = new ethers.Wallet(privateKey, decimalProvider);
    const fromAddress = wallet.address;

    // Получаем текущий nonce
    const nonce = await decimalProvider.getTransactionCount(fromAddress);

    // Создаем транзакцию
    const transaction = {
      from: fromAddress,
      to: ethers.utils.getAddress(toAddress),
      value: ethers.utils.parseEther(amount.toString()),
      gasLimit: GAS_LIMIT,
      gasPrice: GAS_PRICE,
      nonce: nonce,
      chainId: DECIMAL_CHAIN_ID,
    };

    // Подписываем и отправляем транзакцию
    const signedTransaction = await wallet.signTransaction(transaction);
    const txResponse = await decimalProvider.sendTransaction(signedTransaction);
    
    // Ждем подтверждения транзакции (1 блок)
    await txResponse.wait(1);

    const txHash = txResponse.hash;
    const explorerUrl = `https://explorer.decimalchain.com/transactions/${txHash}`;

    return { txHash, explorerUrl };
  } catch (error) {
    console.error('Error sending DEL:', error);
    throw new Error(`Failed to send ${amount} DEL to ${toAddress}: ${error}`);
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
    const { amount, toAddress } = data;
    
    // Проверяем параметры запроса
    const withdrawAmount = parseFloat(amount);
    if (!withdrawAmount || isNaN(withdrawAmount) || withdrawAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount', success: false },
        { status: 400 }
      );
    }
    
    if (!toAddress) {
      return NextResponse.json(
        { error: 'Recipient address is required', success: false },
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
    
    // Проверяем достаточность средств
    const currentBalanceInDB = parseFloat(wallet.balance.toString());
    if (currentBalanceInDB < withdrawAmount) {
      return NextResponse.json(
        { error: 'Insufficient funds', success: false },
        { status: 400 }
      );
    }
    
    // В реальном приложении здесь должна быть отправка средств в блокчейн
    let txHash = '';
    let explorerUrl = '';
    
    try {
      // Если это не тестовая среда, пробуем отправить средства через блокчейн
      if (process.env.NODE_ENV === 'production') {
        const result = await sendDel(toAddress, withdrawAmount, wallet.privateKey);
        txHash = result.txHash;
        explorerUrl = result.explorerUrl;
      } else {
        // В тестовой среде симулируем успешную транзакцию
        txHash = `mock_tx_${Date.now()}`;
        explorerUrl = `https://explorer.decimalchain.com/transactions/${txHash}`;
      }
    } catch (error: any) {
      console.error('Error sending DEL:', error);
      return NextResponse.json(
        { error: `Blockchain transaction failed: ${error.message}`, success: false },
        { status: 500 }
      );
    }
    
    // Обновляем баланс кошелька в локальной базе данных
    wallet.balance = currentBalanceInDB - withdrawAmount;
    await wallet.save();
    
    // Создаем запись о транзакции
    const transaction = new Transaction({
      fromAddress: wallet.address,
      toAddress: toAddress,
      amount: withdrawAmount,
      type: TransactionType.WITHDRAWAL,
      status: 'completed',
      metadata: { txHash, explorerUrl }
    });
    
    await transaction.save();
    
    // После транзакции проверяем баланс в блокчейне
    try {
      const chainBalance = await getBalance(wallet.address);
      if (chainBalance >= 0) {
        console.log(`Chain balance after withdrawal: ${chainBalance}, DB balance: ${wallet.balance}`);
      }
      
      // Здесь можно добавить логику синхронизации, если балансы не совпадают
    } catch (error) {
      console.warn('Failed to verify chain balance:', error);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Withdrawal successful',
      data: {
        txHash,
        explorerUrl,
        newBalance: wallet.balance,
        transaction: {
          id: transaction._id,
          amount: transaction.amount,
          status: transaction.status
        }
      }
    });
    
  } catch (error: any) {
    console.error('Error processing withdrawal:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process withdrawal', success: false },
      { status: 500 }
    );
  }
} 