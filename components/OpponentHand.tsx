'use client';

import { motion } from 'framer-motion';
import Card from './Card';
import { CardSuit, CardRank } from '../types';

type OpponentHandProps = {
  cardCount: number;
};

export default function OpponentHand({ cardCount }: OpponentHandProps) {
  // Generate an array with cardCount items
  const cards = Array(cardCount).fill(null).map((_, index) => ({
    id: `opponent-${index}`,
    suit: 'hearts' as CardSuit,
    rank: '6' as CardRank,
    power: 0,
  }));

  return (
    <motion.div 
      className="flex justify-center items-center"
      initial={{ y: -100, opacity: 0 }}
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
            <Card 
              {...card} 
              faceDown={true}
            />
          </div>
        ))}
      </div>
    </motion.div>
  );
} 