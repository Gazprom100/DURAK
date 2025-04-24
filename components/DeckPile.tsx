'use client';

import { motion } from 'framer-motion';
import Card from './Card';
import { CardSuit, CardRank } from '../types';

type DeckPileProps = {
  cardCount: number;
  trumpSuit: CardSuit;
};

export default function DeckPile({ cardCount, trumpSuit }: DeckPileProps) {
  const suitEmoji = trumpSuit === 'hearts' ? '♥️' : trumpSuit === 'diamonds' ? '♦️' : trumpSuit === 'clubs' ? '♣️' : '♠️';
  const isRed = trumpSuit === 'hearts' || trumpSuit === 'diamonds';
  
  return (
    <div className="relative">
      {/* Deck count indicator */}
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-background-card px-3 py-1 rounded-full border border-primary/30 text-xs text-center text-text-muted">
        {cardCount}
      </div>
      
      {/* Stacked cards */}
      {Array(Math.min(5, cardCount)).fill(null).map((_, index) => (
        <div 
          key={`deck-${index}`}
          className="absolute"
          style={{ 
            top: `${index * 2}px`, 
            left: `${index * 2}px`, 
            zIndex: index 
          }}
        >
          <Card 
            id={`deck-${index}`}
            suit={trumpSuit} 
            rank={"6" as CardRank}
            value={6}
            faceDown={true}
          />
        </div>
      ))}
      
      {/* Trump card indicator */}
      {cardCount > 0 && (
        <div className="absolute -right-6 -bottom-6 bg-white w-10 h-10 rounded-full flex items-center justify-center border-2 border-accent shadow-neon-green">
          <span className={`text-xl ${isRed ? 'text-red-600' : 'text-black'}`}>
            {suitEmoji}
          </span>
        </div>
      )}
    </div>
  );
} 