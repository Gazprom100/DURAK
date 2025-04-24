'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Card from '@/components/Card';
import GameTable from '@/components/GameTable';
import PlayerHand from '@/components/PlayerHand';
import OpponentHand from '@/components/OpponentHand';
import DeckPile from '@/components/DeckPile';
import PlayedCards from '@/components/PlayedCards';
import BonusControls from '@/components/BonusControls';
import { 
  Card as CardType, 
  CardSuit, 
  CardRank, 
  GameState, 
  Player, 
  TableCard, 
  Bonus 
} from '@/types';

export default function Game() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(true);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [bonuses, setBonuses] = useState<Bonus[]>([
    { id: 1, name: 'Ещё одна карта', description: 'Возьмите дополнительную карту', isAvailable: true },
    { id: 2, name: 'Выбор козыря', description: 'Поменять козырную масть', isAvailable: false },
    { id: 3, name: 'Знание карт', description: 'Видеть 2 карты противника', isAvailable: true },
    { id: 4, name: 'Защита', description: 'Одна карта не может быть побита', isAvailable: false },
  ]);
  const [showSuitSelector, setShowSuitSelector] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [result, setResult] = useState<'victory' | 'defeat' | null>(null);
  
  // Проверка авторизации
  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [authStatus, router]);
  
  // Simulate game connection
  useEffect(() => {
    if (authStatus !== 'authenticated') return;
    
    const timer = setTimeout(() => {
      setIsConnecting(false);
      // Mock game state for UI demonstration
      setGameState({
        status: 'active',
        players: [
          {
            id: 'player1',
            name: session?.user?.name || 'Вы',
            cards: [
              { id: '1', suit: 'hearts', rank: '10', value: 10 },
              { id: '2', suit: 'diamonds', rank: 'K', value: 13 },
              { id: '3', suit: 'clubs', rank: '6', value: 6 },
              { id: '4', suit: 'spades', rank: 'A', value: 14 },
              { id: '5', suit: 'hearts', rank: 'Q', value: 12 },
              { id: '6', suit: 'diamonds', rank: '7', value: 7 },
            ],
            isAttacker: true,
          },
          {
            id: 'player2',
            name: 'Соперник',
            cards: Array(5).fill(null).map((_, i) => ({
              id: `opponent-${i}`,
              suit: ['hearts', 'diamonds', 'clubs', 'spades'][Math.floor(Math.random() * 4)] as CardSuit,
              rank: ['6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'][Math.floor(Math.random() * 9)] as CardRank,
              value: Math.floor(Math.random() * 9) + 6,
            })),
            isAttacker: false,
            revealedCards: [],
          },
        ],
        currentPlayer: 'player1',
        trump: 'hearts',
        deck: Array(20).fill(null).map((_, i) => ({
          id: `deck-${i}`,
          suit: ['hearts', 'diamonds', 'clubs', 'spades'][Math.floor(Math.random() * 4)] as CardSuit,
          rank: ['6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'][Math.floor(Math.random() * 9)] as CardRank,
          value: Math.floor(Math.random() * 9) + 6,
        })),
        tableCards: [
          {
            attacking: { id: '7', suit: 'clubs', rank: '9', value: 9 },
            defending: { id: '8', suit: 'hearts', rank: '9', value: 9 }
          },
          {
            attacking: { id: '9', suit: 'diamonds', rank: '6', value: 6 },
          }
        ],
        gameCompleted: false,
      });
      
      // Загрузка бонусов из сессии пользователя (в реальной игре)
      if (session?.user) {
        // Имитация получения бонусов
        const userBonuses = [
          { id: 1, name: 'Ещё одна карта', description: 'Возьмите дополнительную карту', isAvailable: true },
          { id: 2, name: 'Выбор козыря', description: 'Поменять козырную масть', isAvailable: true },
          { id: 3, name: 'Знание карт', description: 'Видеть 2 карты противника', isAvailable: true },
          { id: 4, name: 'Защита', description: 'Одна карта не может быть побита', isAvailable: true },
        ];
        setBonuses(userBonuses);
      }
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [authStatus, session]);
  
  // Handle playing a card
  const handlePlayCard = (cardId: string) => {
    if (!gameState) return;
    
    // For demo, update the game state to simulate playing a card
    const updatedPlayers = [...gameState.players];
    const playerIndex = updatedPlayers.findIndex(p => p.id === 'player1');
    
    if (playerIndex !== -1) {
      const playerCards = [...updatedPlayers[playerIndex].cards];
      const cardIndex = playerCards.findIndex(c => c.id === cardId);
      
      if (cardIndex !== -1) {
        const playedCard = playerCards[cardIndex];
        playerCards.splice(cardIndex, 1);
        updatedPlayers[playerIndex].cards = playerCards;
        
        // Add the card to the table
        const updatedTableCards = [...gameState.tableCards];
        if (gameState.players[playerIndex].isAttacker) {
          updatedTableCards.push({ attacking: playedCard });
        } else {
          // Find the first undefended attack
          const undefendedIndex = updatedTableCards.findIndex(tc => !tc.defending);
          if (undefendedIndex !== -1) {
            updatedTableCards[undefendedIndex].defending = playedCard;
          }
        }
        
        let updatedGameState = {
          ...gameState,
          players: updatedPlayers,
          tableCards: updatedTableCards,
        };
        
        // Проверка на окончание игры (если у игрока нет карт)
        if (playerCards.length === 0 && gameState.deck.length === 0) {
          updatedGameState = {
            ...updatedGameState,
            winner: 'player1',
            gameCompleted: true,
            status: 'complete',
          };
          setResult('victory');
          setGameEnded(true);
          
          // В реальной игре здесь бы обновляли статистику и бонусы игрока через API
        }
        
        setGameState(updatedGameState);
      }
    }
  };
  
  // Обработчик использования бонуса
  const handleUseBonus = (bonusId: number) => {
    if (!gameState) return;
    
    // Обновляем состояние бонусов - делаем использованный бонус недоступным
    setBonuses(prev => 
      prev.map(bonus => 
        bonus.id === bonusId ? { ...bonus, isAvailable: false } : bonus
      )
    );
    
    // Применяем эффект бонуса
    switch (bonusId) {
      case 1: // "Ещё одна карта"
        if (gameState.deck.length > 0) {
          const updatedPlayers = [...gameState.players];
          const playerIndex = updatedPlayers.findIndex(p => p.id === 'player1');
          
          if (playerIndex !== -1) {
            const card = gameState.deck[0];
            const updatedDeck = [...gameState.deck.slice(1)];
            updatedPlayers[playerIndex].cards.push(card);
            
            setGameState({
              ...gameState,
              players: updatedPlayers,
              deck: updatedDeck,
            });
          }
        }
        break;
      
      case 2: // "Выбор козыря"
        setShowSuitSelector(true);
        break;
      
      case 3: // "Знание карт"
        // Показываем две карты противника
        const updatedPlayers = [...gameState.players];
        const opponentIndex = updatedPlayers.findIndex(p => p.id === 'player2');
        
        if (opponentIndex !== -1) {
          const opponentCards = updatedPlayers[opponentIndex].cards;
          
          if (opponentCards.length >= 2) {
            // Показываем первые две карты
            updatedPlayers[opponentIndex].revealedCards = opponentCards.slice(0, 2);
            
            setGameState({
              ...gameState,
              players: updatedPlayers,
            });
          }
        }
        break;
      
      case 4: // "Защита"
        // Делаем последнюю атакующую карту защищенной
        if (gameState.tableCards.length > 0) {
          const updatedTableCards = [...gameState.tableCards];
          const lastIndex = updatedTableCards.length - 1;
          
          if (!updatedTableCards[lastIndex].defending) {
            updatedTableCards[lastIndex].isProtected = true;
            
            setGameState({
              ...gameState,
              tableCards: updatedTableCards,
            });
          }
        }
        break;
    }
  };
  
  // Обработчик изменения козырной масти
  const handleChangeTrump = (suit: CardSuit) => {
    if (!gameState) return;
    
    setGameState({
      ...gameState,
      trump: suit,
    });
    setShowSuitSelector(false);
  };
  
  // Обработчик окончания хода
  const handleEndTurn = () => {
    if (!gameState) return;
    
    // Имитируем ход противника
    const opponentMove = () => {
      // Случайно выбираем карту противника для игры
      const updatedPlayers = [...gameState.players];
      const opponentIndex = 1; // Индекс противника
      
      if (updatedPlayers[opponentIndex].cards.length > 0) {
        const randomCardIndex = Math.floor(Math.random() * updatedPlayers[opponentIndex].cards.length);
        const playedCard = updatedPlayers[opponentIndex].cards[randomCardIndex];
        
        updatedPlayers[opponentIndex].cards.splice(randomCardIndex, 1);
        
        // Добавляем карту на стол
        const updatedTableCards = [...gameState.tableCards];
        
        if (gameState.players[opponentIndex].isAttacker) {
          updatedTableCards.push({ attacking: playedCard });
        } else {
          // Находим первую незащищенную атаку
          const undefendedIndex = updatedTableCards.findIndex(tc => !tc.defending && !tc.isProtected);
          if (undefendedIndex !== -1) {
            updatedTableCards[undefendedIndex].defending = playedCard;
          }
        }
        
        // Обновляем игровое состояние
        let updatedGameState = {
          ...gameState,
          players: updatedPlayers,
          tableCards: updatedTableCards,
          currentPlayer: 'player1', // Возвращаем ход игроку
        };
        
        // Проверка на окончание игры
        if (updatedPlayers[opponentIndex].cards.length === 0 && gameState.deck.length === 0) {
          updatedGameState = {
            ...updatedGameState,
            winner: 'player2',
            gameCompleted: true,
            status: 'complete',
          };
          setResult('defeat');
          setGameEnded(true);
        }
        
        setGameState(updatedGameState);
      }
    };
    
    // Имитируем задержку хода противника
    setGameState({
      ...gameState,
      currentPlayer: 'player2', // Передаем ход противнику
    });
    
    setTimeout(opponentMove, 1500);
  };
  
  // Обработчик взятия карт
  const handleTakeCards = () => {
    if (!gameState) return;
    
    // Собираем все карты со стола
    const allCards = gameState.tableCards.flatMap(pair => {
      const cards = [pair.attacking];
      if (pair.defending) cards.push(pair.defending);
      return cards;
    });
    
    // Добавляем карты игроку
    const updatedPlayers = [...gameState.players];
    const playerIndex = updatedPlayers.findIndex(p => p.id === 'player1');
    
    if (playerIndex !== -1) {
      updatedPlayers[playerIndex].cards = [
        ...updatedPlayers[playerIndex].cards,
        ...allCards
      ];
      
      // Меняем роли игроков
      updatedPlayers[playerIndex].isAttacker = false;
      updatedPlayers[1 - playerIndex].isAttacker = true;
      
      setGameState({
        ...gameState,
        players: updatedPlayers,
        tableCards: [],
        currentPlayer: 'player2', // Передаем ход противнику
      });
      
      // Имитируем задержку хода противника
      setTimeout(() => {
        // Противник начинает новую атаку
        const opponentCardIndex = Math.floor(Math.random() * updatedPlayers[1 - playerIndex].cards.length);
        if (updatedPlayers[1 - playerIndex].cards.length > 0) {
          const playedCard = updatedPlayers[1 - playerIndex].cards[opponentCardIndex];
          updatedPlayers[1 - playerIndex].cards.splice(opponentCardIndex, 1);
          
          setGameState({
            ...gameState,
            players: updatedPlayers,
            tableCards: [{ attacking: playedCard }],
            currentPlayer: 'player1', // Возвращаем ход игроку
          });
        }
      }, 1500);
    }
  };
  
  if (authStatus === 'loading' || isConnecting) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="text-6xl mb-8"
        >
          🃏
        </motion.div>
        <h2 className="font-display text-2xl mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
          {authStatus === 'loading' ? 'Авторизация...' : 'Подключение к игре...'}
        </h2>
        <div className="w-64 h-2 bg-background-card rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-primary via-secondary to-accent"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 2 }}
          />
        </div>
      </div>
    );
  }
  
  if (!gameState) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="font-display text-2xl mb-6 text-text-light">Ошибка подключения</h2>
        <Link href="/" className="button-primary">
          Вернуться на главную
        </Link>
      </div>
    );
  }
  
  // Окно результата игры
  if (gameEnded) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="text-9xl mb-8"
        >
          {result === 'victory' ? '🏆' : '😢'}
        </motion.div>
        
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="font-display text-4xl mb-6 text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent"
        >
          {result === 'victory' ? 'Победа!' : 'Поражение!'}
        </motion.h2>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mb-8"
        >
          <p className="text-xl text-text-light mb-2">
            {result === 'victory' 
              ? 'Поздравляем! Вы выиграли эту партию.' 
              : 'К сожалению, вы проиграли эту партию.'}
          </p>
          <p className="text-text-muted">
            {result === 'victory' 
              ? 'Вы получили +50 бонусных очков!' 
              : 'Не отчаивайтесь, в следующий раз повезет больше.'}
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="flex gap-4"
        >
          <Link href="/game" className="button-primary">
            Играть снова
          </Link>
          <Link href="/" className="button-secondary">
            На главную
          </Link>
        </motion.div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Game header */}
      <header className="p-4 flex justify-between items-center border-b border-primary/20">
        <Link href="/" className="font-display text-xl text-primary hover:text-primary/80 transition-colors">
          ← Выйти
        </Link>
        <div className="flex gap-4 items-center">
          <div className="px-4 py-2 rounded-full bg-background-card border border-primary/30 text-sm text-text-muted">
            Козырь: <span className="text-primary">{gameState.trump === 'hearts' ? '♥️' : gameState.trump === 'diamonds' ? '♦️' : gameState.trump === 'clubs' ? '♣️' : '♠️'}</span>
          </div>
          <div className="px-4 py-2 rounded-full bg-background-card border border-accent/30 text-sm text-text-muted">
            Карт в колоде: <span className="text-accent">{gameState.deck.length}</span>
          </div>
        </div>
      </header>
      
      {/* Game table */}
      <div className="flex-1 flex flex-col items-center justify-between p-4 sm:p-8">
        {/* Opponent */}
        <div className="w-full">
          <div className="mb-2 font-display text-text-muted text-center">
            {gameState.players[1].name}
            {!gameState.players[1].isAttacker && gameState.status === 'active' && (
              <span className="ml-2 text-secondary">Защищается</span>
            )}
            {gameState.players[1].isAttacker && gameState.status === 'active' && (
              <span className="ml-2 text-primary">Атакует</span>
            )}
          </div>
          <div className="flex justify-center">
            <OpponentHand cardCount={gameState.players[1].cards.length} />
          </div>
          
          {/* Показываем открытые карты противника */}
          {gameState.players[1].revealedCards && gameState.players[1].revealedCards.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex justify-center gap-2"
            >
              <div className="bg-background-dark border border-secondary/30 rounded-lg p-2">
                <div className="text-xs text-secondary mb-1 text-center">Вы видите эти карты противника:</div>
                <div className="flex gap-2">
                  {gameState.players[1].revealedCards.map((card) => (
                    <div key={card.id} className="transform scale-75 origin-center">
                      <Card {...card} />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
        
        {/* Table area */}
        <div className="flex-1 w-full max-w-4xl flex items-center justify-center relative my-8">
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <DeckPile cardCount={gameState.deck.length} trumpSuit={gameState.trump} />
          </div>
          
          <div className="flex-1 flex justify-center">
            <PlayedCards tableCards={gameState.tableCards} />
          </div>
          
          {/* Селектор козырной масти */}
          {showSuitSelector && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-background-dark/80 backdrop-blur-sm rounded-xl z-10"
            >
              <div className="bg-background-card border border-secondary p-6 rounded-xl shadow-neon-pink">
                <h3 className="text-xl font-display text-center mb-4 text-text-light">
                  Выберите новую козырную масть
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => handleChangeTrump('hearts')}
                    className="p-4 bg-background-dark hover:bg-background-dark/70 rounded-lg flex flex-col items-center transition-colors"
                  >
                    <span className="text-4xl text-red-600">♥️</span>
                    <span className="mt-2 text-text-light">Черви</span>
                  </button>
                  <button 
                    onClick={() => handleChangeTrump('diamonds')}
                    className="p-4 bg-background-dark hover:bg-background-dark/70 rounded-lg flex flex-col items-center transition-colors"
                  >
                    <span className="text-4xl text-red-600">♦️</span>
                    <span className="mt-2 text-text-light">Бубны</span>
                  </button>
                  <button 
                    onClick={() => handleChangeTrump('clubs')}
                    className="p-4 bg-background-dark hover:bg-background-dark/70 rounded-lg flex flex-col items-center transition-colors"
                  >
                    <span className="text-4xl text-black">♣️</span>
                    <span className="mt-2 text-text-light">Трефы</span>
                  </button>
                  <button 
                    onClick={() => handleChangeTrump('spades')}
                    className="p-4 bg-background-dark hover:bg-background-dark/70 rounded-lg flex flex-col items-center transition-colors"
                  >
                    <span className="text-4xl text-black">♠️</span>
                    <span className="mt-2 text-text-light">Пики</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
        
        {/* Player hand */}
        <div className="w-full">
          <div className="mb-2 font-display text-text-muted text-center">
            {gameState.players[0].name}
            {!gameState.players[0].isAttacker && gameState.status === 'active' && (
              <span className="ml-2 text-secondary">Защищается</span>
            )}
            {gameState.players[0].isAttacker && gameState.status === 'active' && (
              <span className="ml-2 text-primary">Атакует</span>
            )}
          </div>
          <div className="flex justify-center">
            <PlayerHand 
              cards={gameState.players[0].cards} 
              onPlayCard={handlePlayCard}
              isActive={gameState.currentPlayer === 'player1'} 
            />
          </div>
        </div>
      </div>
      
      {/* Game controls */}
      <footer className="p-4 border-t border-primary/20 flex justify-center gap-4">
        <button 
          className="button-primary" 
          onClick={handleEndTurn}
          disabled={gameState.currentPlayer !== 'player1'}
        >
          Бито
        </button>
        <button 
          className="button-secondary"
          onClick={handleTakeCards}
          disabled={gameState.currentPlayer !== 'player1' || gameState.players[0].isAttacker}
        >
          Взять
        </button>
        
        {/* Бонусы */}
        <BonusControls onUseBonus={handleUseBonus} playerBonuses={bonuses} />
      </footer>
    </div>
  );
} 