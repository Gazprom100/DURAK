'use client';

// Указываем Next.js, что эта страница должна быть динамической, а не статической
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// На стороне клиента будут работать все функции, которые взаимодействуют с wallet API

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  const handleDeposit = async () => {
    // In a real implementation, this would connect to a payment gateway
    // For demo purposes, we'll just show a success message
    setIsLoading(true);
    try {
      const response = await fetch('/api/wallet/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: depositAmount }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTransactionStatus({ 
          success: true, 
          message: `Успешно пополнено на ${depositAmount} DEL` 
        });
        // Reset form
        setDepositAmount('');
        
        // Refresh session to update wallet balance
        router.refresh();
      } else {
        setTransactionStatus({ 
          success: false, 
          message: data.error || 'Произошла ошибка при пополнении кошелька' 
        });
      }
    } catch (error) {
      setTransactionStatus({ 
        success: false, 
        message: 'Произошла ошибка при пополнении кошелька' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAddress) {
      setTransactionStatus({ 
        success: false, 
        message: 'Пожалуйста, укажите адрес кошелька для вывода' 
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          amount: withdrawAmount,
          toAddress: withdrawAddress 
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTransactionStatus({ 
          success: true, 
          message: `Успешно выведено ${withdrawAmount} DEL на адрес ${withdrawAddress.substring(0, 8)}...` 
        });
        // Reset form
        setWithdrawAmount('');
        setWithdrawAddress('');
        
        // Refresh session to update wallet balance
        router.refresh();
      } else {
        setTransactionStatus({ 
          success: false, 
          message: data.error || 'Произошла ошибка при выводе средств' 
        });
      }
    } catch (error) {
      setTransactionStatus({ 
        success: false, 
        message: 'Произошла ошибка при выводе средств' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateWallet = async () => {
    setIsCreatingWallet(true);
    setTransactionStatus(null);
    
    try {
      const response = await fetch('/api/wallet/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTransactionStatus({ 
          success: true, 
          message: 'Кошелек успешно создан!' 
        });
        
        // Refresh session to update wallet info
        router.refresh();
      } else {
        setTransactionStatus({ 
          success: false, 
          message: data.error || 'Произошла ошибка при создании кошелька' 
        });
      }
    } catch (error) {
      setTransactionStatus({ 
        success: false, 
        message: 'Произошла ошибка при создании кошелька' 
      });
    } finally {
      setIsCreatingWallet(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-darker text-text-light">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 bg-background-darker text-text-light">
          <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto"
      >
        <div className="mb-10 flex items-center justify-between">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-text-light tracking-tight">
            Профиль игрока
          </h1>
          <Link href="/" className="btn-secondary">
            Вернуться на главную
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Левая колонка - информация пользователя */}
          <div className="md:col-span-1">
            <div className="card h-full">
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary mb-4">
                  <img
                    src={session?.user?.image || `https://i.pravatar.cc/150?u=${session?.user?.id || 'default'}`}
                    alt="Аватар"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h2 className="text-2xl font-display font-bold text-text-light">
                  {session?.user?.name || 'Игрок'}
                </h2>
                <p className="text-text-muted mb-6">
                  {session?.user?.email || 'нет email'}
                </p>
                
                <div className="w-full p-4 rounded-lg bg-background-dark mt-2">
                  <div className="flex justify-between mb-2">
                    <span className="text-text-muted">Бонусные очки:</span>
                    <span className="text-accent font-bold">{session?.user?.bonusPoints || 0}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-text-muted">Игр сыграно:</span>
                    <span className="text-text-light">{session?.user?.gamesPlayed || 0}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-text-muted">Победы:</span>
                    <span className="text-primary">{session?.user?.wins || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-muted">Поражения:</span>
                    <span className="text-secondary">{session?.user?.losses || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Средняя колонка - кошелек и криптовалюта */}
          <div className="md:col-span-2">
            <div className="card overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-text-light">Мой кошелек DecimalChain</h3>
                  <button 
                    onClick={() => setIsWalletOpen(!isWalletOpen)}
                    className={`btn-secondary ${isWalletOpen ? 'bg-background-darker' : ''}`}
                  >
                    {isWalletOpen ? 'Скрыть' : 'Управление'}
                  </button>
                </div>
                
                <div className="bg-background-darker p-4 rounded-lg mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-text-muted">Баланс:</span>
                    <span className="text-accent text-xl font-bold">
                      {session?.user?.walletBalance || '0'} DEL
                    </span>
                  </div>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-text-muted">Адрес кошелька:</span>
                    {session?.user?.walletAddress ? (
                      <span className="text-text-light bg-background-dark px-3 py-1 rounded-md text-sm font-mono">
                        {`${session.user.walletAddress.substring(0, 8)}...${session.user.walletAddress.substring(session.user.walletAddress.length - 8)}`}
                      </span>
                    ) : (
                      <div className="flex items-center">
                        <span className="text-red-500 mr-2">Кошелек не создан</span>
                        <button
                          onClick={handleCreateWallet}
                          disabled={isCreatingWallet}
                          className="btn-primary btn-sm"
                        >
                          {isCreatingWallet ? 'Создание...' : 'Создать'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                {transactionStatus && (
                  <div className={`p-3 rounded-md ${transactionStatus.success ? 'bg-green-500/10 border border-green-500/30 text-green-500' : 'bg-red-500/10 border border-red-500/30 text-red-500'} text-sm mb-4`}>
                    {transactionStatus.message}
                  </div>
                )}
                
                {isWalletOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-border-light mt-4 pt-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Пополнение кошелька */}
                      <div className="bg-background-dark p-4 rounded-lg">
                        <h4 className="text-text-light font-bold mb-3">Пополнить кошелек</h4>
                        <div className="space-y-3">
                          <div>
                            <label htmlFor="deposit-amount" className="block text-sm font-medium text-text-muted mb-1">
                              Сумма (DEL)
                            </label>
                            <div className="flex">
                              <input
                                id="deposit-amount"
                                name="deposit-amount"
                                type="number"
                                value={depositAmount}
                                onChange={(e) => setDepositAmount(e.target.value)}
                                placeholder="0.0"
                                min="0.1"
                                step="0.1"
                                className="appearance-none block w-full px-3 py-2 border border-primary/30 rounded-l-md bg-background-darker text-text-light placeholder-text-muted/50 focus:outline-none focus:ring-primary focus:border-primary"
                              />
                              <span className="inline-flex items-center px-3 py-2 rounded-r-md border border-l-0 border-primary/30 bg-background-darker text-text-muted text-sm">
                                DEL
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={handleDeposit}
                            disabled={!depositAmount || isLoading}
                            className="w-full btn-primary mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isLoading ? 'Загрузка...' : 'Пополнить'}
                          </button>
                        </div>
                      </div>
                      
                      {/* Вывод средств */}
                      <div className="bg-background-dark p-4 rounded-lg">
                        <h4 className="text-text-light font-bold mb-3">Вывод средств</h4>
                        <div className="space-y-3">
                          <div>
                            <label htmlFor="withdraw-amount" className="block text-sm font-medium text-text-muted mb-1">
                              Сумма (DEL)
                            </label>
                            <div className="flex">
                              <input
                                id="withdraw-amount"
                                name="withdraw-amount"
                                type="number"
                                value={withdrawAmount}
                                onChange={(e) => setWithdrawAmount(e.target.value)}
                                placeholder="0.0"
                                min="0.1"
                                step="0.1"
                                className="appearance-none block w-full px-3 py-2 border border-primary/30 rounded-l-md bg-background-darker text-text-light placeholder-text-muted/50 focus:outline-none focus:ring-primary focus:border-primary"
                              />
                              <span className="inline-flex items-center px-3 py-2 rounded-r-md border border-l-0 border-primary/30 bg-background-darker text-text-muted text-sm">
                                DEL
                              </span>
                            </div>
                          </div>
                          <div>
                            <label htmlFor="withdraw-address" className="block text-sm font-medium text-text-muted mb-1">
                              Адрес кошелька
                            </label>
                            <input
                              id="withdraw-address"
                              name="withdraw-address"
                              type="text"
                              value={withdrawAddress}
                              onChange={(e) => setWithdrawAddress(e.target.value)}
                              placeholder="0x..."
                              className="appearance-none block w-full px-3 py-2 border border-primary/30 rounded-md bg-background-darker text-text-light placeholder-text-muted/50 focus:outline-none focus:ring-primary focus:border-primary"
                            />
                          </div>
                          <button
                            onClick={handleWithdraw}
                            disabled={!withdrawAmount || !withdrawAddress || isLoading}
                            className="w-full btn-secondary mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isLoading ? 'Загрузка...' : 'Вывести'}
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 p-4 rounded-lg bg-background-dark">
                      <h4 className="text-text-light font-bold mb-3">О вашем кошельке</h4>
                      <p className="text-text-muted text-sm">
                        Ваш кошелек DecimalChain используется для хранения и управления криптовалютой DEL. 
                        Вы можете пополнять его, делать ставки в играх и выводить выигрыши на внешние кошельки.
                      </p>
                      <p className="text-text-muted text-sm mt-2">
                        При победе в игре вы получите весь пул ставок за вычетом комиссии платформы (20%).
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
              </div>
              
            {/* Последние транзакции будут добавлены в реальной имплементации */}
            <div className="card mt-6">
              <div className="p-6">
                <h3 className="text-xl font-bold text-text-light mb-4">Начать игру с криптовалютой</h3>
                <p className="text-text-muted mb-4">
                  Создайте новую игру со ставкой в DEL и сыграйте против других игроков. 
                  Победитель забирает весь пул ставок!
                </p>
                <Link href="/game?bet=true" className="btn-primary block text-center">
                  Создать игру со ставкой
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
} 