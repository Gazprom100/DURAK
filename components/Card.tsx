'use client';

import { motion } from 'framer-motion';
import { Card as CardType, CardSuit, CardRank } from '../types';

export type CardProps = CardType & {
  faceDown?: boolean;
  onClick?: () => void;
  isActive?: boolean;
  isTrump?: boolean;
};

export default function Card({ id, suit, rank, faceDown = false, onClick, isActive = false, isTrump = false }: CardProps) {
  const suitEmoji = suit === 'hearts' ? '♥️' : suit === 'diamonds' ? '♦️' : suit === 'clubs' ? '♣️' : '♠️';
  const isRed = suit === 'hearts' || suit === 'diamonds';
  
  if (faceDown) {
    return (
      <motion.div
        whileHover={{ y: -10 }}
        className="relative w-24 h-36 rounded-lg bg-gradient-to-br from-background-card to-background-dark border border-primary/30 shadow-md flex items-center justify-center cursor-pointer"
        onClick={onClick}
      >
        <div className="absolute inset-1 rounded-md bg-[radial-gradient(circle_at_center,rgba(15,224,255,0.1)_0,rgba(15,224,255,0)_70%)]">
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-xl text-primary rotate-45">🃏</div>
          </div>
        </div>
      </motion.div>
    );
  }
  
  return (
    <motion.div
      whileHover={{ y: isActive ? -10 : 0 }}
      className={`relative w-24 h-36 rounded-lg bg-white shadow-md flex flex-col p-2 ${isActive ? 'cursor-pointer' : ''} ${isTrump ? 'ring-2 ring-accent ring-offset-1 ring-offset-background-dark' : ''}`}
      onClick={isActive ? onClick : undefined}
    >
      <div className={`text-lg font-bold ${isRed ? 'text-red-600' : 'text-black'}`}>
        {rank}
      </div>
      <div className={`text-lg ${isRed ? 'text-red-600' : 'text-black'}`}>
        {suitEmoji}
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className={`text-4xl ${isRed ? 'text-red-600' : 'text-black'}`}>
          {suitEmoji}
        </div>
      </div>
      <div className={`text-lg font-bold rotate-180 ${isRed ? 'text-red-600' : 'text-black'}`}>
        {rank}
      </div>
      <div className={`text-lg rotate-180 ${isRed ? 'text-red-600' : 'text-black'}`}>
        {suitEmoji}
      </div>
    </motion.div>
  );
} 