import React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

// Card types
export type CardSuit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type CardRank = '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export type Card = {
  id: string;
  suit: CardSuit;
  rank: CardRank;
  value: number;
};

// Player types
export type Player = {
  id: string;
  name: string;
  cards: Card[];
  isAttacker: boolean;
  isConnected?: boolean;
  revealedCards?: Card[]; // Для бонуса "Знание карт"
};

// Game state types
export type TableCard = {
  attacking: Card;
  defending?: Card;
  isProtected?: boolean; // Для бонуса "Защита"
};

export type GameState = {
  id?: string;
  status: 'waiting' | 'active' | 'complete';
  players: Player[];
  currentPlayer: string;
  trump: CardSuit;
  deck: Card[];
  tableCards: TableCard[];
  winner?: string;
  gameCompleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

// Bonus types
export type Bonus = {
  id: number;
  name: string;
  description: string;
  isAvailable: boolean;
};

// Socket event types
export type GameCreatedEvent = {
  gameId: string;
  game: GameState;
};

export type GameJoinedEvent = {
  gameId: string;
  game: GameState;
};

export type GameUpdatedEvent = {
  gameId: string;
  players: {
    id: string;
    name: string;
    cardCount: number;
    isAttacker: boolean;
  }[];
  tableCards?: TableCard[];
  currentPlayer?: string;
  status: 'waiting' | 'active' | 'complete';
};

export type HandUpdatedEvent = {
  cards: Card[];
  canPlay: boolean;
};

// Module declarations
declare module 'framer-motion';
declare module 'next/font/google';
declare module 'next/server';
declare module 'socket.io';
declare module 'socket.io-client';
declare module 'net'; 