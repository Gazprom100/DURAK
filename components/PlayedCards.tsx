'use client';

import { motion } from 'framer-motion';
import Card from './Card';
import { TableCard } from '../types';

type PlayedCardsProps = {
  tableCards: TableCard[];
};

export default function PlayedCards({ tableCards }: PlayedCardsProps) {
  if (tableCards.length === 0) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <div className="text-text-muted italic">Играйте карту...</div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-wrap justify-center gap-4 py-6 min-h-[200px]">
      {tableCards.map((pair, index) => (
        <div key={`table-${index}`} className="relative flex flex-col items-center">
          {/* Attacking card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Card {...pair.attacking} />
          </motion.div>
          
          {/* Defending card, if exists */}
          {pair.defending && (
            <motion.div
              initial={{ opacity: 0, y: -30, rotate: 0 }}
              animate={{ opacity: 1, y: 15, rotate: 15 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="absolute top-0"
            >
              <Card {...pair.defending} />
            </motion.div>
          )}
        </div>
      ))}
    </div>
  );
} 