import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { CardSuit, CardRank } from '@/types';

interface CardProps {
  id: string;
  suit: CardSuit;
  rank: CardRank;
  isPlayable: boolean;
  isSelected?: boolean;
  isTrump?: boolean;
  onSelect?: (id: string) => void;
  style?: React.CSSProperties;
}

// Цвета масти
const suitColors = {
  hearts: '#FF5D5D',   // Красный
  diamonds: '#FF5D5D', // Красный
  clubs: '#363853',    // Темно-синий
  spades: '#363853',   // Темно-синий
};

// Эмодзи масти
const suitEmoji = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

// Словесное название рангов
const rankNames = {
  '6': 'Шесть',
  '7': 'Семь',
  '8': 'Восемь',
  '9': 'Девять',
  '10': 'Десять',
  'J': 'Валет',
  'Q': 'Дама',
  'K': 'Король',
  'A': 'Туз',
};

const CardComponent: React.FC<CardProps> = ({
  id,
  suit,
  rank,
  isPlayable,
  isSelected = false,
  isTrump = false,
  onSelect,
  style,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Эффект для анимации карты
  useEffect(() => {
    if (!cardRef.current) return;
    
    const card = cardRef.current;
    
    // Функция для создания 3D эффекта при движении мыши
    const handleMouseMove = (e: MouseEvent) => {
      if (!isPlayable) return;
      
      const { left, top, width, height } = card.getBoundingClientRect();
      const x = e.clientX - left;
      const y = e.clientY - top;
      
      const centerX = width / 2;
      const centerY = height / 2;
      
      const rotateX = ((y - centerY) / 10) * -1;
      const rotateY = (x - centerX) / 10;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
    };
    
    const handleMouseLeave = () => {
      card.style.transform = '';
    };
    
    if (isPlayable) {
      card.addEventListener('mousemove', handleMouseMove);
      card.addEventListener('mouseleave', handleMouseLeave);
    }
    
    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isPlayable]);
  
  // Получение цвета масти
  const color = suitColors[suit] || '#000000';
  
  // Вариант анимации для карты
  const cardVariants = {
    hidden: { 
      scale: 0.8, 
      opacity: 0, 
      rotateY: 180 
    },
    visible: { 
      scale: 1, 
      opacity: 1, 
      rotateY: 0,
      transition: { 
        type: 'spring', 
        stiffness: 300, 
        damping: 15 
      } 
    },
    selected: { 
      y: -30,
      boxShadow: '0 15px 25px rgba(0, 0, 0, 0.2)',
      transition: { 
        type: 'spring', 
        stiffness: 500, 
        damping: 30 
      } 
    },
    hover: {
      scale: 1.05,
      y: -15,
      boxShadow: '0 10px 20px rgba(0, 0, 0, 0.15)',
      transition: { 
        type: 'spring', 
        stiffness: 400, 
        damping: 20 
      }
    },
  };
  
  return (
    <motion.div
      ref={cardRef}
      className={`relative ${isPlayable ? 'cursor-pointer' : 'cursor-default'}`}
      onClick={() => isPlayable && onSelect?.(id)}
      initial="hidden"
      animate={isSelected ? "selected" : "visible"}
      whileHover={isPlayable ? "hover" : undefined}
      variants={cardVariants}
      style={style}
    >
      <div className={`
        card-container
        rounded-2xl 
        bg-white 
        border-2
        ${isSelected ? 'border-blue-500' : 'border-gray-200'}
        shadow-lg 
        w-32 
        h-44
        flex 
        flex-col 
        justify-between 
        p-3
        overflow-hidden
        ${isPlayable ? 'opacity-100' : 'opacity-80'}
        ${isTrump ? 'ring-2 ring-yellow-400' : ''}
      `}>
        {/* Верхний угол карты */}
        <div className="flex justify-start items-center">
          <div className="flex flex-col items-center">
            <span className="text-xl font-bold" style={{ color }}>
              {rank}
            </span>
            <span className="text-xl" style={{ color }}>
              {suitEmoji[suit]}
            </span>
          </div>
        </div>
        
        {/* Центр карты */}
        <div className="flex justify-center items-center flex-grow">
          <span className="text-4xl" style={{ color }}>
            {suitEmoji[suit]}
          </span>
        </div>
        
        {/* Нижний угол карты */}
        <div className="flex justify-end items-center">
          <div className="flex flex-col items-center rotate-180">
            <span className="text-xl font-bold" style={{ color }}>
              {rank}
            </span>
            <span className="text-xl" style={{ color }}>
              {suitEmoji[suit]}
            </span>
          </div>
        </div>
        
        {/* Индикатор козыря */}
        {isTrump && (
          <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full w-6 h-6 flex items-center justify-center text-white text-xs font-bold">
            K
          </div>
        )}
        
        {/* Скрытый лейбл для доступности */}
        <span className="sr-only">
          {rankNames[rank]} {suit}, {isTrump ? 'козырь' : ''}
        </span>
      </div>
    </motion.div>
  );
};

export default CardComponent; 