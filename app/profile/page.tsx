'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bonuses, setBonuses] = useState([
    { id: 1, name: 'Ещё одна карта', description: 'Возьмите дополнительную карту в начале игры', cost: 50, owned: false },
    { id: 2, name: 'Выбор козыря', description: 'Возможность выбрать козырную масть', cost: 100, owned: false },
    { id: 3, name: 'Знание карт', description: 'Видеть 2 карты противника', cost: 150, owned: false },
    { id: 4, name: 'Защита', description: 'Одна карта не может быть побита противником', cost: 200, owned: false },
  ]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  const purchaseBonus = (id: number) => {
    setBonuses(prev => 
      prev.map(bonus => 
        bonus.id === id 
          ? { ...bonus, owned: true } 
          : bonus
      )
    );
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-4xl animate-pulse">🃏</div>
        <p className="mt-4 text-text-muted">Загрузка профиля...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="p-4 flex justify-between items-center border-b border-primary/20">
        <Link href="/" className="font-display text-xl text-primary hover:text-primary/80 transition-colors">
          ← На главную
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="text-text-muted hover:text-text-light transition-colors"
        >
          Выйти
        </button>
      </header>
      
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="container-glow lg:col-span-1"
          >
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
                
                <Link href="/game" className="button-primary mt-8 w-full text-center">
                  Начать новую игру
                </Link>
              </div>
            </div>
          </motion.div>
          
          {/* Bonuses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="container-glow lg:col-span-2"
          >
            <div className="card h-full">
              <h2 className="text-2xl font-display font-bold text-text-light mb-6">
                Бонусы и преимущества
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bonuses.map((bonus) => (
                  <div
                    key={bonus.id}
                    className={`p-4 rounded-lg border ${
                      bonus.owned
                        ? 'border-accent bg-accent/10'
                        : 'border-primary/20 bg-background-dark'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-display font-medium text-text-light">
                        {bonus.name}
                      </h3>
                      <div className={`px-2 py-1 rounded text-xs ${
                        bonus.owned ? 'bg-accent/20 text-accent' : 'bg-primary/20 text-primary'
                      }`}>
                        {bonus.owned ? 'Приобретено' : `${bonus.cost} очков`}
                      </div>
                    </div>
                    <p className="text-text-muted text-sm mb-3">{bonus.description}</p>
                    
                    {!bonus.owned && (
                      <button
                        onClick={() => purchaseBonus(bonus.id)}
                        disabled={(session?.user?.bonusPoints || 0) < bonus.cost}
                        className="w-full py-2 text-center text-sm rounded-md bg-primary/20 text-primary hover:bg-primary/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {(session?.user?.bonusPoints || 0) < bonus.cost
                          ? 'Недостаточно очков'
                          : 'Приобрести бонус'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-8 p-4 rounded-lg bg-background-dark">
                <h3 className="text-lg font-display font-medium text-text-light mb-2">
                  Как получить больше бонусных очков
                </h3>
                <ul className="list-disc list-inside text-text-muted space-y-1">
                  <li>Выигрывайте игры (+50 очков за победу)</li>
                  <li>Выполняйте ежедневные задания (+10-30 очков)</li>
                  <li>Приглашайте друзей (+100 очков за каждого друга)</li>
                  <li>Участвуйте в турнирах (до +500 очков за победу в турнире)</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 