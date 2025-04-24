'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

type LeaderboardUser = {
  id: string;
  name: string;
  avatar: string;
  wins: number;
  losses: number;
  gamesPlayed: number;
  winRate: number;
  bonusPoints: number;
};

export default function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'wins' | 'winRate' | 'bonusPoints'>('wins');

  // Эмуляция загрузки данных с сервера
  useEffect(() => {
    // В реальном приложении тут был бы fetch запрос к API
    setTimeout(() => {
      const mockData: LeaderboardUser[] = [
        { id: '1', name: 'Чемпион', avatar: 'https://i.pravatar.cc/150?u=1', wins: 158, losses: 42, gamesPlayed: 200, winRate: 79, bonusPoints: 7890 },
        { id: '2', name: 'Мастер Карт', avatar: 'https://i.pravatar.cc/150?u=2', wins: 132, losses: 68, gamesPlayed: 200, winRate: 66, bonusPoints: 4750 },
        { id: '3', name: 'КарточныйДемон', avatar: 'https://i.pravatar.cc/150?u=3', wins: 120, losses: 62, gamesPlayed: 182, winRate: 65.9, bonusPoints: 3600 },
        { id: '4', name: 'Стратег', avatar: 'https://i.pravatar.cc/150?u=4', wins: 110, losses: 70, gamesPlayed: 180, winRate: 61.1, bonusPoints: 3020 },
        { id: '5', name: 'Карточный Волк', avatar: 'https://i.pravatar.cc/150?u=5', wins: 105, losses: 85, gamesPlayed: 190, winRate: 55.3, bonusPoints: 2940 },
        { id: '6', name: 'НеДурак', avatar: 'https://i.pravatar.cc/150?u=6', wins: 98, losses: 72, gamesPlayed: 170, winRate: 57.6, bonusPoints: 2800 },
        { id: '7', name: 'ТузВРукаве', avatar: 'https://i.pravatar.cc/150?u=7', wins: 90, losses: 60, gamesPlayed: 150, winRate: 60, bonusPoints: 2500 },
        { id: '8', name: 'Картёжник', avatar: 'https://i.pravatar.cc/150?u=8', wins: 78, losses: 62, gamesPlayed: 140, winRate: 55.7, bonusPoints: 2100 },
        { id: '9', name: 'Дама Червей', avatar: 'https://i.pravatar.cc/150?u=9', wins: 72, losses: 68, gamesPlayed: 140, winRate: 51.4, bonusPoints: 1950 },
        { id: '10', name: 'ДжокерПро', avatar: 'https://i.pravatar.cc/150?u=10', wins: 65, losses: 45, gamesPlayed: 110, winRate: 59.1, bonusPoints: 1800 },
      ];
      
      setLeaderboardData(mockData);
      setIsLoading(false);
    }, 1500);
  }, []);

  // Сортировка данных
  const sortedData = [...leaderboardData].sort((a, b) => {
    if (sortBy === 'wins') return b.wins - a.wins;
    if (sortBy === 'winRate') return b.winRate - a.winRate;
    return b.bonusPoints - a.bonusPoints;
  });

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="p-4 flex justify-between items-center border-b border-primary/20">
        <Link href="/" className="font-display text-xl text-primary hover:text-primary/80 transition-colors">
          ← На главную
        </Link>
        <h1 className="font-display text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">
          Таблица лидеров
        </h1>
        <div className="w-20"></div> {/* Для центрирования заголовка */}
      </header>
      
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <motion.div
              animate={{ 
                rotate: 360,
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
              className="text-6xl mb-4"
            >
              🏆
            </motion.div>
            <p className="text-text-muted">Загрузка таблицы лидеров...</p>
          </div>
        ) : (
          <>
            <div className="container-glow mb-6">
              <div className="card bg-background-card/90 backdrop-blur-sm p-6">
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => setSortBy('wins')}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      sortBy === 'wins' 
                        ? 'bg-primary text-background-dark' 
                        : 'bg-background-dark text-text-muted hover:text-text-light'
                    }`}
                  >
                    По победам
                  </button>
                  <button
                    onClick={() => setSortBy('winRate')}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      sortBy === 'winRate' 
                        ? 'bg-secondary text-background-dark' 
                        : 'bg-background-dark text-text-muted hover:text-text-light'
                    }`}
                  >
                    По % побед
                  </button>
                  <button
                    onClick={() => setSortBy('bonusPoints')}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      sortBy === 'bonusPoints' 
                        ? 'bg-accent text-background-dark' 
                        : 'bg-background-dark text-text-muted hover:text-text-light'
                    }`}
                  >
                    По очкам
                  </button>
                </div>
              </div>
            </div>
            
            <div className="container-glow">
              <div className="card bg-background-card/90 backdrop-blur-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-primary/20">
                        <th className="p-4 text-left text-text-muted">Место</th>
                        <th className="p-4 text-left text-text-muted">Игрок</th>
                        <th className="p-4 text-right text-text-muted">Победы</th>
                        <th className="p-4 text-right text-text-muted">Игры</th>
                        <th className="p-4 text-right text-text-muted">% побед</th>
                        <th className="p-4 text-right text-text-muted">Очки</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedData.map((user, index) => (
                        <motion.tr
                          key={user.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="border-b border-primary/10 hover:bg-background-dark/50 transition-colors"
                        >
                          <td className="p-4">
                            {index === 0 ? (
                              <span className="text-xl" title="1-е место">🥇</span>
                            ) : index === 1 ? (
                              <span className="text-xl" title="2-е место">🥈</span>
                            ) : index === 2 ? (
                              <span className="text-xl" title="3-е место">🥉</span>
                            ) : (
                              <span className="text-text-muted">{index + 1}</span>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                              </div>
                              <span className="text-text-light">{user.name}</span>
                            </div>
                          </td>
                          <td className="p-4 text-right font-medium text-primary">{user.wins}</td>
                          <td className="p-4 text-right text-text-muted">{user.gamesPlayed}</td>
                          <td className="p-4 text-right font-medium text-secondary">{user.winRate}%</td>
                          <td className="p-4 text-right font-medium text-accent">{user.bonusPoints}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            <div className="mt-8 text-center text-text-muted text-sm">
              <p>Таблица обновляется каждый час. Станьте лучшим игроком и получите особые награды!</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 