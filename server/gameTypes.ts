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

export function initSocket(httpServer, path = '/api/socket', cors = {
  origin: "*",
  methods: ["GET", "POST"]
}) 