import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CardComponent from './CardComponent';
import { Card, TableCard, Player } from '@/types';

interface GameTableProps {
  tableCards: TableCard[];
  players: Player[];
  currentPlayerId: string;
  myPlayerId: string;
  trumpCard?: Card;
  deck: Card[];
  onCardPlay: (cardId: string) => void;
  onTakeCards: () => void;
  onEndTurn: () => void;
}

const GameTable: React.FC<GameTableProps> = ({
  tableCards,
  players,
  currentPlayerId,
  myPlayerId,
  trumpCard,
  deck,
  onCardPlay,
  onTakeCards,
  onEndTurn,
}) => {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationText, setNotificationText] = useState('');
  
  // Получаем текущего игрока и оппонента
  const myPlayer = players.find(p => p.id === myPlayerId);
  const opponent = players.find(p => p.id !== myPlayerId);
  
  // Флаг, определяющий мой ход или нет
  const isMyTurn = currentPlayerId === myPlayerId;
  
  // Проверяем, атакующий ли я
  const amIAttacker = myPlayer?.isAttacker || false;
  
  // Эффект для уведомлений о ходе
  useEffect(() => {
    if (isMyTurn) {
      setNotificationText(amIAttacker ? 'Ваш ход! Атакуйте!' : 'Ваш ход! Защищайтесь!');
      setShowNotification(true);
      
      const timer = setTimeout(() => {
        setShowNotification(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isMyTurn, amIAttacker, currentPlayerId]);
  
  // Обработка выбора карты
  const handleCardSelect = (cardId: string) => {
    if (!isMyTurn) return;
    
    setSelectedCardId(cardId);
  };
  
  // Обработка игры картой
  const handleCardPlay = () => {
    if (selectedCardId && isMyTurn) {
      onCardPlay(selectedCardId);
      setSelectedCardId(null);
    }
  };
  
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between bg-gradient-to-br from-emerald-800 to-emerald-900 rounded-3xl shadow-2xl overflow-hidden p-6">
      {/* Стол для карт */}
      <div className="absolute inset-0 z-0">
        {/* Декоративные элементы стола */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-emerald-700 rounded-full opacity-30"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] border-2 border-yellow-400 border-dashed rounded-full opacity-20"></div>
      </div>
      
      {/* Область оппонента */}
      <div className="relative z-10 w-full">
        <AnimatePresence>
          {opponent && (
            <motion.div 
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex flex-col items-center"
            >
              <div className="bg-gray-900 bg-opacity-80 rounded-full px-4 py-2 mb-2 text-white">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                    {opponent.name.substring(0, 1)}
                  </div>
                  <span>{opponent.name}</span>
                  <span className="text-xs bg-gray-700 rounded-full px-2 py-1">
                    {opponent.cards.length} карт
                  </span>
                  {!isMyTurn && currentPlayerId === opponent.id && (
                    <span className="animate-pulse text-yellow-400">Ходит...</span>
                  )}
                </div>
              </div>
              
              {/* Карты оппонента (рубашкой вверх) */}
              <div className="flex justify-center overflow-visible">
                {Array.from({ length: opponent.cards.length }, (_, i) => (
                  <motion.div 
                    key={`opponent-card-${i}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    style={{ marginLeft: i > 0 ? '-80px' : '0' }}
                    className="relative"
                  >
                    <div className="w-24 h-36 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-lg shadow-lg border-2 border-indigo-300 flex items-center justify-center">
                      <div className="text-white text-opacity-30 text-4xl font-bold rotate-45">
                        D
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Центральная область стола с картами */}
      <div className="relative z-10 flex-1 w-full flex flex-col items-center justify-center">
        {/* Колода и козырь */}
        <div className="absolute top-4 right-4 flex items-center">
          {deck.length > 0 && (
            <div className="relative mr-4">
              <div className="w-24 h-36 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-lg shadow-lg border-2 border-indigo-300 flex items-center justify-center">
                <span className="text-white font-bold">{deck.length}</span>
              </div>
            </div>
          )}
          
          {trumpCard && (
            <div className="transform rotate-90">
              <CardComponent
                id={trumpCard.id}
                suit={trumpCard.suit}
                rank={trumpCard.rank}
                isPlayable={false}
                isTrump={true}
              />
            </div>
          )}
        </div>
        
        {/* Игровой стол с картами */}
        <div className="grid grid-cols-3 gap-8 p-4 bg-emerald-700 bg-opacity-30 rounded-2xl">
          {tableCards.length === 0 ? (
            <div className="col-span-3 text-white text-opacity-50 text-center py-12">
              {isMyTurn && amIAttacker ? 'Ваш ход. Выберите карту для атаки.' : 'Ожидание хода...'}
            </div>
          ) : (
            tableCards.map((tableCard, index) => (
              <div key={`table-card-${index}`} className="flex flex-col items-center">
                {/* Атакующая карта */}
                <CardComponent
                  id={tableCard.attacking.id}
                  suit={tableCard.attacking.suit}
                  rank={tableCard.attacking.rank}
                  isPlayable={false}
                  style={{ marginBottom: tableCard.defending ? '-30px' : '0' }}
                />
                
                {/* Защищающая карта */}
                {tableCard.defending && (
                  <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <CardComponent
                      id={tableCard.defending.id}
                      suit={tableCard.defending.suit}
                      rank={tableCard.defending.rank}
                      isPlayable={false}
                    />
                  </motion.div>
                )}
              </div>
            ))
          )}
        </div>
        
        {/* Кнопки действий */}
        <div className="absolute bottom-4 right-4 flex space-x-3">
          {isMyTurn && (
            <>
              {!amIAttacker && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg shadow-lg"
                  onClick={onTakeCards}
                >
                  Взять карты
                </motion.button>
              )}
              
              {((amIAttacker && tableCards.length > 0) || 
               (!amIAttacker && tableCards.every(tc => tc.defending))) && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-lg"
                  onClick={onEndTurn}
                >
                  Завершить ход
                </motion.button>
              )}
              
              {selectedCardId && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg shadow-lg"
                  onClick={handleCardPlay}
                >
                  Сыграть выбранной картой
                </motion.button>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Область игрока */}
      <div className="relative z-10 w-full">
        <AnimatePresence>
          {myPlayer && (
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex flex-col items-center"
            >
              <div className="flex justify-center overflow-visible mb-4">
                {myPlayer.cards.map((card, index) => (
                  <motion.div 
                    key={`my-card-${index}`}
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    style={{ marginLeft: index > 0 ? '-40px' : '0', zIndex: index }}
                  >
                    <CardComponent
                      id={card.id}
                      suit={card.suit}
                      rank={card.rank}
                      isPlayable={isMyTurn}
                      isSelected={selectedCardId === card.id}
                      isTrump={card.suit === trumpCard?.suit}
                      onSelect={handleCardSelect}
                    />
                  </motion.div>
                ))}
              </div>
              
              <div className="bg-gray-900 bg-opacity-80 rounded-full px-4 py-2 text-white">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                    {myPlayer.name.substring(0, 1)}
                  </div>
                  <span>{myPlayer.name}</span>
                  <span className="text-xs bg-gray-700 rounded-full px-2 py-1">
                    {myPlayer.cards.length} карт
                  </span>
                  {isMyTurn && (
                    <span className="animate-pulse text-yellow-400">Ваш ход</span>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Уведомление о ходе */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-80 text-white px-6 py-3 rounded-lg shadow-lg z-20"
          >
            {notificationText}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GameTable; 