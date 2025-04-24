import { Server as SocketIOServer } from 'socket.io';
import { Server as NetServer, Socket } from 'net';
import { NextApiRequest } from 'next';
import { NextApiResponse } from 'next';
import { 
  Card, 
  CardSuit, 
  CardRank, 
  Player, 
  GameState as Game,
  TableCard
} from '../types';

type Games = {
  [key: string]: Game;
};

// In-memory store for active games
const games: Games = {};

export const initSocket = (req: NextApiRequest, res: NextApiResponse & { socket: Socket & { server: NetServer } }) => {
  if (!(res.socket.server as any).io) {
    const io = new SocketIOServer(res.socket.server as any);
    (res.socket.server as any).io = io;

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      // Create a new game
      socket.on('create-game', (username: string) => {
        const gameId = generateGameId();
        const playerId = socket.id;
        
        // Initialize a new game with a deck of cards
        const deck = generateDeck();
        const trumpCard = deck[Math.floor(Math.random() * deck.length)];
        const trump = trumpCard.suit;
        
        games[gameId] = {
          id: gameId,
          players: [
            {
              id: playerId,
              name: username,
              cards: dealCards(deck, 6),
              isAttacker: true,
              isConnected: true,
            },
          ],
          currentPlayer: playerId,
          trump,
          deck,
          tableCards: [],
          status: 'waiting',
          createdAt: new Date(),
          updatedAt: new Date(),
          gameCompleted: false
        };
        
        socket.join(gameId);
        socket.emit('game-created', { gameId, game: sanitizeGame(games[gameId], playerId) });
      });

      // Join an existing game
      socket.on('join-game', (data: { gameId: string, username: string }) => {
        const { gameId, username } = data;
        const playerId = socket.id;
        
        if (!games[gameId]) {
          socket.emit('error', { message: 'Game not found' });
          return;
        }
        
        const game = games[gameId];
        
        if (game.players.length >= 2) {
          socket.emit('error', { message: 'Game is full' });
          return;
        }
        
        // Add the player to the game
        game.players.push({
          id: playerId,
          name: username,
          cards: dealCards(game.deck, 6),
          isAttacker: false,
          isConnected: true,
        });
        
        // Update game status
        game.status = 'active';
        game.updatedAt = new Date();
        
        socket.join(gameId);
        
        // Notify all players about the update
        io.to(gameId).emit('game-updated', {
          gameId,
          players: game.players.map(p => ({ id: p.id, name: p.name, cardCount: p.cards.length, isAttacker: p.isAttacker })),
          status: game.status,
        });
        
        // Send game state to the new player
        socket.emit('game-joined', { gameId, game: sanitizeGame(game, playerId) });
        
        // Notify other players
        socket.to(gameId).emit('player-joined', { playerId, name: username });
      });

      // Play a card
      socket.on('play-card', (data: { gameId: string, cardId: string }) => {
        const { gameId, cardId } = data;
        const playerId = socket.id;
        
        if (!games[gameId]) {
          socket.emit('error', { message: 'Game not found' });
          return;
        }
        
        const game = games[gameId];
        const playerIndex = game.players.findIndex(p => p.id === playerId);
        
        if (playerIndex === -1) {
          socket.emit('error', { message: 'Player not found in game' });
          return;
        }
        
        // Check if it's the player's turn
        if (game.currentPlayer !== playerId) {
          socket.emit('error', { message: 'Not your turn' });
          return;
        }
        
        const player = game.players[playerIndex];
        const cardIndex = player.cards.findIndex(c => c.id === cardId);
        
        if (cardIndex === -1) {
          socket.emit('error', { message: 'Card not found' });
          return;
        }
        
        // Logic for playing a card (simplified)
        const card = player.cards[cardIndex];
        
        // Remove the card from the player's hand
        player.cards.splice(cardIndex, 1);
        
        // Add the card to the table
        if (player.isAttacker) {
          game.tableCards.push({ attacking: card });
        } else {
          // Find the first undefended attack
          const undefendedIndex = game.tableCards.findIndex(tc => !tc.defending);
          if (undefendedIndex !== -1) {
            game.tableCards[undefendedIndex].defending = card;
          }
        }
        
        game.updatedAt = new Date();
        
        // Broadcast the updated game state
        io.to(gameId).emit('game-updated', {
          gameId,
          players: game.players.map(p => ({ id: p.id, name: p.name, cardCount: p.cards.length, isAttacker: p.isAttacker })),
          tableCards: game.tableCards,
          currentPlayer: game.currentPlayer,
          status: game.status,
        });
        
        // Send personalized state to each player
        game.players.forEach(p => {
          const socketId = p.id;
          io.to(socketId).emit('hand-updated', { 
            cards: p.cards,
            canPlay: game.currentPlayer === p.id,
          });
        });
      });

      // End turn
      socket.on('end-turn', (data: { gameId: string }) => {
        const { gameId } = data;
        const playerId = socket.id;
        
        if (!games[gameId]) {
          socket.emit('error', { message: 'Game not found' });
          return;
        }
        
        const game = games[gameId];
        
        // Switch the current player
        const currentPlayerIndex = game.players.findIndex(p => p.id === playerId);
        const nextPlayerIndex = (currentPlayerIndex + 1) % game.players.length;
        
        game.currentPlayer = game.players[nextPlayerIndex].id;
        
        // Clear the table
        game.tableCards = [];
        
        // Update player roles (attacker/defender)
        game.players.forEach(p => {
          p.isAttacker = !p.isAttacker;
        });
        
        // Deal cards to players who have less than 6
        game.players.forEach(player => {
          const cardsNeeded = Math.max(0, 6 - player.cards.length);
          if (cardsNeeded > 0 && game.deck.length > 0) {
            player.cards.push(...dealCards(game.deck, cardsNeeded));
          }
        });
        
        game.updatedAt = new Date();
        
        // Broadcast the updated game state
        io.to(gameId).emit('game-updated', {
          gameId,
          players: game.players.map(p => ({ id: p.id, name: p.name, cardCount: p.cards.length, isAttacker: p.isAttacker })),
          tableCards: game.tableCards,
          currentPlayer: game.currentPlayer,
          status: game.status,
        });
        
        // Send personalized state to each player
        game.players.forEach(p => {
          const socketId = p.id;
          io.to(socketId).emit('hand-updated', { 
            cards: p.cards,
            canPlay: game.currentPlayer === p.id,
          });
        });
        
        // Check if game is over
        const playersWithNoCards = game.players.filter(p => p.cards.length === 0);
        if (playersWithNoCards.length > 0 && game.deck.length === 0) {
          const winner = playersWithNoCards[0].id;
          game.status = 'complete';
          game.gameCompleted = true;
          
          io.to(gameId).emit('game-over', { winner });
        }
      });

      // Disconnect
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        
        // Update player connection status in any games they're in
        Object.keys(games).forEach(gameId => {
          const game = games[gameId];
          const playerIndex = game.players.findIndex(p => p.id === socket.id);
          
          if (playerIndex !== -1) {
            game.players[playerIndex].isConnected = false;
            
            // Notify other players
            socket.to(gameId).emit('player-disconnected', { playerId: socket.id });
          }
        });
      });
    });
  }
  
  res.end();
};

function generateGameId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function generateDeck(): Card[] {
  const suits: CardSuit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
  const ranks: CardRank[] = ['6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  const values: Record<CardRank, number> = {
    '6': 6,
    '7': 7,
    '8': 8,
    '9': 9,
    '10': 10,
    'J': 11,
    'Q': 12,
    'K': 13,
    'A': 14,
  };
  
  const deck: Card[] = [];
  
  suits.forEach(suit => {
    ranks.forEach(rank => {
      deck.push({
        id: `${suit}-${rank}`,
        suit,
        rank,
        value: values[rank],
      });
    });
  });
  
  // Shuffle the deck
  return deck.sort(() => Math.random() - 0.5);
}

function dealCards(deck: Card[], count: number): Card[] {
  return deck.splice(0, Math.min(count, deck.length));
}

function sanitizeGame(game: Game, playerId: string): any {
  const playerIndex = game.players.findIndex(p => p.id === playerId);
  
  if (playerIndex === -1) {
    return null;
  }
  
  // Create a copy of the game state with only the current player's cards visible
  const sanitized = {
    ...game,
    players: game.players.map(p => {
      if (p.id === playerId) {
        return p;
      }
      
      return {
        ...p,
        cards: Array(p.cards.length).fill(null).map((_, i) => ({
          id: `hidden-${i}`,
          suit: 'hearts' as CardSuit,
          rank: '6' as CardRank,
          value: 0,
        })),
      };
    }),
  };
  
  return sanitized;
} 