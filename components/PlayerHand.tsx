'use client';

import { motion } from 'framer-motion';
import Card, { CardProps } from './Card';
import { Card as CardType } from '../types';

type PlayerHandProps = {
  cards: CardType[];
  onPlayCard: (cardId: string) => void;
  isActive: boolean;
};

export default function PlayerHand({ cards, onPlayCard, isActive }: PlayerHandProps) {
  return (
    <motion.div 
      className="flex justify-center items-center"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative flex">
        {cards.map((card, index) => (
          <div 
            key={card.id} 
            className="relative"
            style={{ 
              marginLeft: index > 0 ? '-1.5rem' : '0',
              zIndex: index
            }}
          >
            <motion.div
              whileHover={{ y: -20, zIndex: 50 }}
              transition={{ duration: 0.2 }}
            >
              <Card 
                {...card} 
                isActive={isActive}
                onClick={() => onPlayCard(card.id)}
              />
            </motion.div>
          </div>
        ))}
      </div>
    </motion.div>
  );
} 