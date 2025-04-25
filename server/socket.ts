import { Server as SocketIOServer } from 'socket.io';
import { Server as NetServer, Socket } from 'net';
import { NextApiRequest } from 'next';
import { NextApiResponse } from 'next';
import { 
  Card, 
  GameState,
  Player
} from './gameTypes';
import {
  generateGameId,
  generateDeck,
  dealCards,
  createGame,
  addPlayerToGame,
  playCard,
  endTurn,
  takeCards,
  canPlayCard,
  getPlayableCards,
  addChatMessage
} from './gameLogic';
import { Server as HttpServer } from 'http';

interface SocketInitOptions {
  httpServer: HttpServer;
  path?: string;
  cors?: {
    origin: string | string[];
    methods?: string[];
    credentials?: boolean;
  };
}

type Games = {
  [key: string]: GameState;
};

// In-memory store for active games
const games: Games = {};

// Старая функция для обратной совместимости
export const initSocket = (
  reqOrOptions: NextApiRequest | SocketInitOptions, 
  res?: NextApiResponse & { socket: Socket & { server: NetServer } }
): SocketIOServer => {
  // Проверяем, новый или старый формат вызова
  if (!res && 'httpServer' in reqOrOptions) {
    // Новый формат - из опций
    const options = reqOrOptions as SocketInitOptions;
    const io = new SocketIOServer(options.httpServer, {
      path: options.path || '/api/socket',
      cors: options.cors || {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true,
      },
      addTrailingSlash: false,
    });
    
    setupSocketHandlers(io);
    return io;
  } 
  else if (res) {
    // Старый формат - req и res
    const req = reqOrOptions as NextApiRequest;
    
    if (!(res.socket.server as any).io) {
      const io = new SocketIOServer(res.socket.server as any);
      (res.socket.server as any).io = io;
      
      setupSocketHandlers(io);
    }
    
    return (res.socket.server as any).io;
  }
  
  throw new Error('Invalid arguments for initSocket');
};

// Обработчики событий Socket.IO
function setupSocketHandlers(io: SocketIOServer) {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Create a new game
    socket.on('create-game', (username: string) => {
      // Используем новую функцию создания игры
      const game = createGame(socket.id, username);
      const gameId = game.id;
      
      // Сохраняем игру
      games[gameId] = game;
      
      socket.join(gameId);
      socket.emit('game-created', { gameId, game: sanitizeGame(games[gameId], socket.id) });
    });

    // Join an existing game
    socket.on('join-game', (data: { gameId: string, username: string }) => {
      const { gameId, username } = data;
      const playerId = socket.id;
      
      if (!games[gameId]) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }
      
      try {
        // Используем новую функцию добавления игрока
        const updatedGame = addPlayerToGame(games[gameId], playerId, username);
        games[gameId] = updatedGame;
        
        socket.join(gameId);
        
        // Notify all players about the update
        io.to(gameId).emit('game-updated', {
          gameId,
          players: updatedGame.players.map(p => ({ 
            id: p.id, 
            name: p.name, 
            cardCount: p.cards.length, 
            isAttacker: p.isAttacker 
          })),
          status: updatedGame.status,
        });
        
        // Send game state to the new player
        socket.emit('game-joined', { gameId, game: sanitizeGame(updatedGame, playerId) });
        
        // Notify other players
        socket.to(gameId).emit('player-joined', { playerId, name: username });
      } catch (error) {
        console.error('Error joining game:', error);
        socket.emit('error', { message: (error as Error).message });
      }
    });

    // Play a card
    socket.on('play-card', (data: { gameId: string, cardId: string }) => {
      const { gameId, cardId } = data;
      const playerId = socket.id;
      
      if (!games[gameId]) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }
      
      try {
        // Проверяем, можно ли сыграть карту
        if (!canPlayCard(games[gameId], playerId, cardId)) {
          socket.emit('error', { message: 'Cannot play this card' });
          return;
        }
        
        // Используем новую функцию игры картой
        const updatedGame = playCard(games[gameId], playerId, cardId);
        games[gameId] = updatedGame;
        
        // Broadcast the updated game state
        io.to(gameId).emit('game-updated', {
          gameId,
          players: updatedGame.players.map(p => ({ 
            id: p.id, 
            name: p.name, 
            cardCount: p.cards.length, 
            isAttacker: p.isAttacker 
          })),
          tableCards: updatedGame.tableCards,
          currentPlayer: updatedGame.currentPlayer,
          status: updatedGame.status,
        });
        
        // Send personalized state to each player
        updatedGame.players.forEach(p => {
          const socketId = p.id;
          io.to(socketId).emit('hand-updated', { 
            cards: p.cards,
            canPlay: updatedGame.currentPlayer === p.id,
            playableCards: getPlayableCards(updatedGame, p.id)
          });
        });
        
        // Проверяем, закончилась ли игра
        if (updatedGame.gameCompleted) {
          io.to(gameId).emit('game-over', { winner: updatedGame.winner });
        }
      } catch (error) {
        console.error('Error playing card:', error);
        socket.emit('error', { message: (error as Error).message });
      }
    });

    // Take cards (when defender can't defend)
    socket.on('take-cards', (data: { gameId: string }) => {
      const { gameId } = data;
      const playerId = socket.id;
      
      if (!games[gameId]) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }
      
      try {
        // Используем новую функцию взятия карт
        const updatedGame = takeCards(games[gameId], playerId);
        games[gameId] = updatedGame;
        
        // Broadcast the updated game state
        io.to(gameId).emit('game-updated', {
          gameId,
          players: updatedGame.players.map(p => ({ 
            id: p.id, 
            name: p.name, 
            cardCount: p.cards.length, 
            isAttacker: p.isAttacker 
          })),
          tableCards: updatedGame.tableCards,
          currentPlayer: updatedGame.currentPlayer,
          status: updatedGame.status,
        });
        
        // Send personalized state to each player
        updatedGame.players.forEach(p => {
          const socketId = p.id;
          io.to(socketId).emit('hand-updated', { 
            cards: p.cards,
            canPlay: updatedGame.currentPlayer === p.id,
            playableCards: getPlayableCards(updatedGame, p.id)
          });
        });
      } catch (error) {
        console.error('Error taking cards:', error);
        socket.emit('error', { message: (error as Error).message });
      }
    });

    // End turn
    socket.on('end-turn', (data: { gameId: string }) => {
      const { gameId } = data;
      const playerId = socket.id;
      
      if (!games[gameId]) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }
      
      try {
        // Используем новую функцию завершения хода
        const updatedGame = endTurn(games[gameId], playerId);
        games[gameId] = updatedGame;
        
        // Broadcast the updated game state
        io.to(gameId).emit('game-updated', {
          gameId,
          players: updatedGame.players.map(p => ({ 
            id: p.id, 
            name: p.name, 
            cardCount: p.cards.length, 
            isAttacker: p.isAttacker 
          })),
          tableCards: updatedGame.tableCards,
          currentPlayer: updatedGame.currentPlayer,
          status: updatedGame.status,
        });
        
        // Send personalized state to each player
        updatedGame.players.forEach(p => {
          const socketId = p.id;
          io.to(socketId).emit('hand-updated', { 
            cards: p.cards,
            canPlay: updatedGame.currentPlayer === p.id,
            playableCards: getPlayableCards(updatedGame, p.id)
          });
        });
        
        // Проверяем, закончилась ли игра
        if (updatedGame.gameCompleted) {
          io.to(gameId).emit('game-over', { winner: updatedGame.winner });
        }
      } catch (error) {
        console.error('Error ending turn:', error);
        socket.emit('error', { message: (error as Error).message });
      }
    });
    
    // Send chat message
    socket.on('send-message', (data: { gameId: string, message: string }) => {
      const { gameId, message } = data;
      const playerId = socket.id;
      
      if (!games[gameId]) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }
      
      try {
        // Находим игрока
        const player = games[gameId].players.find(p => p.id === playerId);
        if (!player) {
          socket.emit('error', { message: 'Player not found in game' });
          return;
        }
        
        // Добавляем сообщение в чат
        const updatedGame = addChatMessage(games[gameId], playerId, player.name, message);
        games[gameId] = updatedGame;
        
        // Отправляем новое сообщение всем игрокам
        io.to(gameId).emit('new-message', {
          id: updatedGame.chat![updatedGame.chat!.length - 1].id,
          userId: playerId,
          username: player.name,
          message,
          timestamp: new Date()
        });
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: (error as Error).message });
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
          // Маркируем игрока как отключенного
          game.players[playerIndex].isConnected = false;
          
          // Уведомляем других игроков
          socket.to(gameId).emit('player-left', { playerId: socket.id });
          
          // Если оба игрока отключились, удаляем игру через 10 минут
          const allDisconnected = game.players.every(p => !p.isConnected);
          if (allDisconnected) {
            setTimeout(() => {
              // Проверяем, не переподключился ли кто-то из игроков
              if (Object.keys(games).includes(gameId) && 
                  games[gameId].players.every(p => !p.isConnected)) {
                delete games[gameId];
                console.log(`Game ${gameId} deleted due to inactivity`);
              }
            }, 10 * 60 * 1000); // 10 минут
          }
        }
      });
    });
  });
}

/**
 * Очищает игровое состояние для отправки клиенту
 */
function sanitizeGame(game: GameState, playerId: string): any {
  const player = game.players.find(p => p.id === playerId);
  const opponent = game.players.find(p => p.id !== playerId);
  
  return {
    id: game.id,
    status: game.status,
    currentPlayer: game.currentPlayer,
    trump: game.trump,
    deckCount: game.deck.length,
    tableCards: game.tableCards,
    player: player ? {
      id: player.id,
      name: player.name,
      cards: player.cards,
      isAttacker: player.isAttacker,
      playableCards: player && game.currentPlayer === playerId 
        ? getPlayableCards(game, playerId) 
        : []
    } : null,
    opponent: opponent ? {
      id: opponent.id,
      name: opponent.name,
      cardCount: opponent.cards.length,
      isAttacker: opponent.isAttacker,
      isConnected: opponent.isConnected
    } : null,
    chat: game.chat || []
  };
} 