import { nanoid } from 'nanoid';
import { 
  Card, 
  CardSuit, 
  CardRank, 
  Player, 
  TableCard, 
  GameState,
  GameSettings,
  ChatMessage
} from '../types';

/**
 * Ранги карт по силе (от слабой к сильной)
 */
const RANKS_POWER: Record<CardRank, number> = {
  '6': 1,
  '7': 2,
  '8': 3,
  '9': 4,
  '10': 5,
  'J': 6,
  'Q': 7,
  'K': 8,
  'A': 9
};

/**
 * Генерирует уникальный ID для игры
 */
export function generateGameId(): string {
  return nanoid(8);
}

/**
 * Генерирует стандартную колоду из 36 карт
 */
export function generateDeck(deckType: 'standard36' | 'standard52' = 'standard36'): Card[] {
  const suits: CardSuit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
  let ranks: CardRank[];
  
  if (deckType === 'standard36') {
    ranks = ['6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  } else {
    // Для колоды в 52 карты добавим типы 2-5
    ranks = ['6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'] as CardRank[];
  }
  
  const deck: Card[] = [];
  
  // Создаем все карты
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({
        id: nanoid(),
        suit,
        rank,
        power: RANKS_POWER[rank]
      });
    }
  }
  
  // Перемешиваем колоду
  return shuffleDeck(deck);
}

/**
 * Перемешивает колоду карт
 */
export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  
  // Алгоритм Фишера-Йейтса для перемешивания
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

/**
 * Раздает карты из колоды
 */
export function dealCards(deck: Card[], count: number): { cards: Card[], remainingDeck: Card[] } {
  if (deck.length < count) {
    // Если в колоде недостаточно карт, берем все, что есть
    count = deck.length;
  }
  
  const cards = deck.slice(0, count);
  const remainingDeck = deck.slice(count);
  
  return { cards, remainingDeck };
}

/**
 * Создает новую игру
 */
export function createGame(
  creatorId: string, 
  creatorName: string,
  settings: Partial<GameSettings> = {}
): GameState {
  // Устанавливаем настройки игры по умолчанию
  const gameSettings: GameSettings = {
    cardsPerPlayer: settings.cardsPerPlayer || 6,
    deckType: settings.deckType || 'standard36',
    timePerMove: settings.timePerMove || 30,
    allowTransfer: settings.allowTransfer !== undefined ? settings.allowTransfer : true,
    allowPeek: settings.allowPeek !== undefined ? settings.allowPeek : false,
    bonusBet: settings.bonusBet || 0
  };
  
  // Генерируем колоду
  const deck = generateDeck(gameSettings.deckType);
  
  // Раздаем карты первому игроку
  const { cards, remainingDeck } = dealCards(deck, gameSettings.cardsPerPlayer);
  
  // Выбираем козырь (последняя карта колоды)
  const trumpCard = remainingDeck[remainingDeck.length - 1];
  const trump = trumpCard.suit;
  
  // Создаем игрока
  const creator: Player = {
    id: creatorId,
    name: creatorName,
    cards,
    isAttacker: true,
    isConnected: true
  };
  
  // Создаем игру
  const game: GameState = {
    id: generateGameId(),
    players: [creator],
    currentPlayer: creatorId,
    trump,
    deck: remainingDeck,
    tableCards: [],
    status: 'waiting',
    createdAt: new Date(),
    updatedAt: new Date(),
    gameCompleted: false,
    settings: gameSettings,
    chat: [],
    bonusPool: gameSettings.bonusBet * 2 // Первоначальный бонусный пул
  };
  
  return game;
}

/**
 * Добавляет игрока в игру
 */
export function addPlayerToGame(
  game: GameState,
  playerId: string,
  playerName: string
): GameState {
  if (game.players.length >= 2) {
    throw new Error('Game is full');
  }
  
  if (game.status !== 'waiting') {
    throw new Error('Game has already started');
  }
  
  // Раздаем карты новому игроку
  const { cards, remainingDeck } = dealCards(
    game.deck, 
    game.settings?.cardsPerPlayer || 6
  );
  
  // Создаем игрока
  const newPlayer: Player = {
    id: playerId,
    name: playerName,
    cards,
    isAttacker: false,  // Новый игрок всегда начинает как защищающийся
    isConnected: true
  };
  
  // Обновляем игру
  const updatedGame: GameState = {
    ...game,
    players: [...game.players, newPlayer],
    deck: remainingDeck,
    status: 'active',
    updatedAt: new Date()
  };
  
  return updatedGame;
}

/**
 * Проверяет, может ли карта быть сыграна в текущей ситуации
 */
export function canPlayCard(
  game: GameState, 
  playerId: string, 
  cardId: string
): boolean {
  // Проверяем, активна ли игра
  if (game.status !== 'active') {
    return false;
  }
  
  // Проверяем, ход ли игрока
  if (game.currentPlayer !== playerId) {
    return false;
  }
  
  // Находим игрока
  const playerIndex = game.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) {
    return false;
  }
  
  const player = game.players[playerIndex];
  
  // Находим карту
  const cardIndex = player.cards.findIndex(c => c.id === cardId);
  if (cardIndex === -1) {
    return false;
  }
  
  const card = player.cards[cardIndex];
  
  // Проверяем, может ли карта быть сыграна
  if (player.isAttacker) {
    // Если игрок атакует
    
    // Если на столе нет карт, можно сыграть любую карту
    if (game.tableCards.length === 0) {
      return true;
    }
    
    // Если на столе есть карты, можно сыграть только карту такого же ранга
    if (game.settings?.allowTransfer) {
      // Проверяем, есть ли на столе карты такого же ранга
      const ranksOnTable = new Set([
        ...game.tableCards.map(tc => tc.attacking.rank),
        ...game.tableCards.filter(tc => tc.defending).map(tc => tc.defending!.rank)
      ]);
      
      return ranksOnTable.has(card.rank);
    }
    
    return false;
  } else {
    // Если игрок защищается
    
    // Находим первую незащищенную атаку
    const undefendedAttack = game.tableCards.find(tc => !tc.defending);
    if (!undefendedAttack) {
      return false;
    }
    
    const attackingCard = undefendedAttack.attacking;
    
    // Проверяем, может ли карта побить атакующую
    if (card.suit === attackingCard.suit) {
      // Если масти одинаковые, сравниваем силу
      return card.power > attackingCard.power;
    } else if (card.suit === game.trump) {
      // Если карта козырная, а атакующая нет, то можно побить
      return attackingCard.suit !== game.trump;
    }
    
    // Во всех остальных случаях нельзя побить
    return false;
  }
}

/**
 * Играет картой
 */
export function playCard(
  game: GameState, 
  playerId: string, 
  cardId: string
): GameState {
  // Проверяем, можно ли сыграть карту
  if (!canPlayCard(game, playerId, cardId)) {
    throw new Error('Cannot play this card');
  }
  
  // Находим игрока
  const playerIndex = game.players.findIndex(p => p.id === playerId);
  const player = game.players[playerIndex];
  
  // Находим карту
  const cardIndex = player.cards.findIndex(c => c.id === cardId);
  const card = player.cards[cardIndex];
  
  // Удаляем карту из руки игрока
  const updatedPlayer: Player = {
    ...player,
    cards: [...player.cards.slice(0, cardIndex), ...player.cards.slice(cardIndex + 1)]
  };
  
  let updatedTableCards = [...game.tableCards];
  
  if (player.isAttacker) {
    // Если игрок атакует, добавляем новую карту на стол
    updatedTableCards.push({ attacking: card });
  } else {
    // Если игрок защищается, находим первую незащищенную атаку
    const undefendedIndex = updatedTableCards.findIndex(tc => !tc.defending);
    updatedTableCards[undefendedIndex] = {
      ...updatedTableCards[undefendedIndex],
      defending: card
    };
  }
  
  // Обновляем игру
  const updatedPlayers = [
    ...game.players.slice(0, playerIndex),
    updatedPlayer,
    ...game.players.slice(playerIndex + 1)
  ];
  
  // Проверяем, закончилась ли игра
  let gameStatus = game.status;
  let gameCompleted = game.gameCompleted;
  let winner = game.winner;
  
  if (updatedPlayer.cards.length === 0 && game.deck.length === 0) {
    // Если у игрока не осталось карт и колода пуста, он победил
    gameStatus = 'complete';
    gameCompleted = true;
    winner = playerId;
  }
  
  const updatedGame: GameState = {
    ...game,
    players: updatedPlayers,
    tableCards: updatedTableCards,
    status: gameStatus,
    gameCompleted,
    winner,
    updatedAt: new Date()
  };
  
  return updatedGame;
}

/**
 * Взять карты со стола (защищающийся не смог отбиться)
 */
export function takeCards(game: GameState, playerId: string): GameState {
  // Проверяем, активна ли игра
  if (game.status !== 'active') {
    throw new Error('Game is not active');
  }
  
  // Проверяем, ход ли игрока
  if (game.currentPlayer !== playerId) {
    throw new Error('Not your turn');
  }
  
  // Находим игрока
  const playerIndex = game.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) {
    throw new Error('Player not found');
  }
  
  const player = game.players[playerIndex];
  
  // Проверяем, защищается ли игрок
  if (player.isAttacker) {
    throw new Error('Attacker cannot take cards');
  }
  
  // Собираем все карты со стола
  const cardsToTake: Card[] = [
    ...game.tableCards.map(tc => tc.attacking),
    ...game.tableCards.filter(tc => tc.defending).map(tc => tc.defending!)
  ];
  
  // Добавляем карты игроку
  const updatedPlayer: Player = {
    ...player,
    cards: [...player.cards, ...cardsToTake]
  };
  
  // Меняем активного игрока и роли
  const opponentIndex = game.players.findIndex(p => p.id !== playerId);
  const opponent = game.players[opponentIndex];
  
  // Раздаем карты, если колода не пуста
  let { cards: playerNewCards, remainingDeck } = dealCards(
    game.deck, 
    Math.max(0, (game.settings?.cardsPerPlayer || 6) - updatedPlayer.cards.length)
  );
  
  // Обновляем карты игрока
  updatedPlayer.cards = [...updatedPlayer.cards, ...playerNewCards];
  
  // Раздаем карты оппоненту
  const { cards: opponentNewCards, remainingDeck: finalDeck } = dealCards(
    remainingDeck, 
    Math.max(0, (game.settings?.cardsPerPlayer || 6) - opponent.cards.length)
  );
  
  const updatedOpponent: Player = {
    ...opponent,
    cards: [...opponent.cards, ...opponentNewCards],
    isAttacker: !opponent.isAttacker
  };
  
  updatedPlayer.isAttacker = !updatedPlayer.isAttacker;
  
  // Обновляем игру
  const updatedPlayers = playerIndex === 0
    ? [updatedPlayer, updatedOpponent]
    : [updatedOpponent, updatedPlayer];
  
  const updatedGame: GameState = {
    ...game,
    players: updatedPlayers,
    currentPlayer: opponent.id, // Передаем ход оппоненту
    tableCards: [], // Очищаем стол
    deck: finalDeck,
    updatedAt: new Date()
  };
  
  return updatedGame;
}

/**
 * Завершает ход (все атаки отбиты)
 */
export function endTurn(game: GameState, playerId: string): GameState {
  // Проверяем, активна ли игра
  if (game.status !== 'active') {
    throw new Error('Game is not active');
  }
  
  // Проверяем, ход ли игрока
  if (game.currentPlayer !== playerId) {
    throw new Error('Not your turn');
  }
  
  // Находим игрока
  const playerIndex = game.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) {
    throw new Error('Player not found');
  }
  
  const player = game.players[playerIndex];
  
  // Проверяем условия для завершения хода
  if (player.isAttacker) {
    // Атакующий может завершить ход только если на столе есть карты
    if (game.tableCards.length === 0) {
      throw new Error('No cards on table');
    }
  } else {
    // Защищающийся может завершить ход только если все атаки отбиты
    if (game.tableCards.some(tc => !tc.defending)) {
      throw new Error('Not all attacks defended');
    }
  }
  
  // Меняем активного игрока и роли
  const opponentIndex = (playerIndex + 1) % game.players.length;
  const opponent = game.players[opponentIndex];
  
  // Раздаем карты, если колода не пуста
  let { cards: playerNewCards, remainingDeck } = dealCards(
    game.deck, 
    Math.max(0, (game.settings?.cardsPerPlayer || 6) - player.cards.length)
  );
  
  // Обновляем карты игрока
  const updatedPlayer: Player = {
    ...player,
    cards: [...player.cards, ...playerNewCards],
    isAttacker: !player.isAttacker
  };
  
  // Раздаем карты оппоненту
  const { cards: opponentNewCards, remainingDeck: finalDeck } = dealCards(
    remainingDeck, 
    Math.max(0, (game.settings?.cardsPerPlayer || 6) - opponent.cards.length)
  );
  
  const updatedOpponent: Player = {
    ...opponent,
    cards: [...opponent.cards, ...opponentNewCards],
    isAttacker: !opponent.isAttacker
  };
  
  // Обновляем игру
  const updatedPlayers = [
    ...game.players.slice(0, playerIndex),
    updatedPlayer,
    ...game.players.slice(playerIndex + 1)
  ];
  updatedPlayers[opponentIndex] = updatedOpponent;
  
  // Проверяем, закончилась ли игра
  let gameStatus = game.status;
  let gameCompleted = game.gameCompleted;
  let winner = game.winner;
  
  // Игра заканчивается, если у кого-то нет карт и колода пуста
  if (updatedPlayer.cards.length === 0 && finalDeck.length === 0) {
    gameStatus = 'complete' as any;
    gameCompleted = true;
    winner = playerId;
  } else if (updatedOpponent.cards.length === 0 && finalDeck.length === 0) {
    gameStatus = 'complete' as any;
    gameCompleted = true;
    winner = opponent.id;
  }
  
  const updatedGame: GameState = {
    ...game,
    players: updatedPlayers,
    currentPlayer: opponent.id, // Передаем ход оппоненту
    tableCards: [], // Очищаем стол
    deck: finalDeck,
    status: gameStatus,
    gameCompleted,
    winner,
    updatedAt: new Date()
  };
  
  return updatedGame;
}

/**
 * Добавляет сообщение в чат игры
 */
export function addChatMessage(
  game: GameState,
  userId: string,
  username: string,
  message: string
): GameState {
  const newMessage: ChatMessage = {
    id: nanoid(),
    userId,
    username,
    message,
    timestamp: new Date()
  };
  
  const updatedGame: GameState = {
    ...game,
    chat: [...(game.chat || []), newMessage],
    updatedAt: new Date()
  };
  
  return updatedGame;
}

/**
 * Возвращает карты, которые могут быть сыграны игроком
 */
export function getPlayableCards(game: GameState, playerId: string): Card[] {
  // Находим игрока
  const player = game.players.find(p => p.id === playerId);
  if (!player) {
    return [];
  }
  
  // Проверяем, ход ли игрока
  if (game.currentPlayer !== playerId || game.status !== 'active') {
    return [];
  }
  
  // Получаем карты, которыми можно сыграть
  return player.cards.filter(card => canPlayCard(game, playerId, card.id));
} 