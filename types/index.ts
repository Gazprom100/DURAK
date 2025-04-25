// Типы игральных карт
export type CardSuit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type CardRank = '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

// Карта
export interface Card {
  id: string;
  suit: CardSuit;
  rank: CardRank;
  power: number; // Сила карты для сравнения
}

// Карта на столе
export interface TableCard {
  attacking: Card;
  defending?: Card;
}

// Игрок
export interface Player {
  id: string;
  name: string;
  cards: Card[];
  isAttacker: boolean; // Является ли атакующим
  isConnected: boolean; // Подключен ли к игре
  score?: number; // Общий счет игрока
  avatar?: string; // URL аватара
  experience?: number; // Опыт игрока
  bonusBalance?: number; // Баланс бонусов
}

// Рейтинговая информация
export interface PlayerRating {
  userId: string;
  username: string;
  rating: number; 
  wins: number;
  losses: number;
  avatar?: string;
  experience: number;
  level: number;
}

// Чат-сообщение
export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: Date;
}

// Настройки игры
export interface GameSettings {
  cardsPerPlayer: number; // Карт на игрока (обычно 6)
  deckType: 'standard36' | 'standard52'; // Тип колоды
  timePerMove: number; // Время на ход в секундах
  allowTransfer: boolean; // Разрешить перевод (подкидывать карты того же достоинства)
  allowPeek: boolean; // Разрешить подглядывать в колоду
  bonusBet: number; // Ставка бонусами
}

// Состояние игры
export interface GameState {
  id: string;
  players: Player[];
  currentPlayer: string; // ID текущего игрока
  trump: CardSuit; // Козырная масть
  deck: Card[]; // Колода
  tableCards: TableCard[]; // Карты на столе
  status: 'waiting' | 'active' | 'complete'; // Статус игры
  createdAt: Date;
  updatedAt: Date;
  gameCompleted: boolean;
  settings?: GameSettings; // Настройки игры
  chat?: ChatMessage[]; // Чат игры
  remainingTime?: number; // Оставшееся время для хода
  winner?: string; // ID победителя
  bonusPool?: number; // Размер бонусного пула
}

// События WebSocket
export enum SocketEvent {
  // Базовые события
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  ERROR = 'error',
  
  // События создания/подключения к игре
  CREATE_GAME = 'create-game',
  GAME_CREATED = 'game-created',
  JOIN_GAME = 'join-game',
  GAME_JOINED = 'game-joined',
  PLAYER_JOINED = 'player-joined',
  PLAYER_LEFT = 'player-left',
  
  // События игрового процесса
  GAME_UPDATED = 'game-updated',
  HAND_UPDATED = 'hand-updated',
  PLAY_CARD = 'play-card',
  TAKE_CARDS = 'take-cards',
  END_TURN = 'end-turn',
  GAME_OVER = 'game-over',
  
  // События чата
  SEND_MESSAGE = 'send-message',
  NEW_MESSAGE = 'new-message',
  
  // События бонусов
  BET_PLACED = 'bet-placed',
  BONUS_AWARDED = 'bonus-awarded',
  
  // События таймера
  TIMER_UPDATE = 'timer-update',
  TIMER_EXPIRED = 'timer-expired',
  
  // Дополнительные события
  REQUEST_HINT = 'request-hint',
  HINT_PROVIDED = 'hint-provided',
  PLAYER_READY = 'player-ready',
  GAME_STARTED = 'game-started',
  REMATCH_REQUESTED = 'rematch-requested',
  REMATCH_ACCEPTED = 'rematch-accepted',
}

// Расширенная информация о игре для лобби
export interface GameLobbyInfo {
  id: string;
  createdBy: string;
  playerCount: number;
  maxPlayers: number;
  status: 'waiting' | 'active' | 'complete';
  settings: GameSettings;
  bonusBet: number;
  createdAt: Date;
}

// Игровые статистики
export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  winRate: number;
  averageCardsPlayed: number;
  highestScore: number;
  bonusesEarned: number;
  bonusesSpent: number;
  favoriteCards: { suit: CardSuit; rank: CardRank; count: number }[];
} 