// gameManager.js - заглушка для управления играми
import { generateGameId, createGame, addPlayerToGame } from './gameLogic.js';

// Простая реализация менеджера игр
export class GameManager {
  constructor() {
    this.games = new Map();
    this.playerGames = new Map();
  }

  /**
   * Создает новую игру
   */
  createGame(playerId, playerName, settings = {}) {
    const game = createGame(playerId, playerName, settings);
    this.games.set(game.id, game);
    
    // Добавляем игру к игроку
    if (!this.playerGames.has(playerId)) {
      this.playerGames.set(playerId, []);
    }
    this.playerGames.get(playerId).push(game.id);
    
    return game;
  }

  /**
   * Добавляет игрока в игру
   */
  addPlayerToGame(gameId, playerId, playerName) {
    const game = this.games.get(gameId);
    if (!game) {
      throw new Error('Game not found');
    }
    
    const updatedGame = addPlayerToGame(game, playerId, playerName);
    this.games.set(gameId, updatedGame);
    
    // Добавляем игру к игроку
    if (!this.playerGames.has(playerId)) {
      this.playerGames.set(playerId, []);
    }
    this.playerGames.get(playerId).push(gameId);
    
    return updatedGame;
  }

  /**
   * Получает игру по ID
   */
  getGame(gameId) {
    return this.games.get(gameId);
  }

  /**
   * Обновляет игру
   */
  updateGame(gameId, updatedGame) {
    if (!this.games.has(gameId)) {
      throw new Error('Game not found');
    }
    
    this.games.set(gameId, updatedGame);
    return updatedGame;
  }

  /**
   * Удаляет игру
   */
  removeGame(gameId) {
    if (this.games.has(gameId)) {
      const game = this.games.get(gameId);
      
      // Удаляем игру у всех игроков
      for (const player of game.players) {
        if (this.playerGames.has(player.id)) {
          const gameIndex = this.playerGames.get(player.id).indexOf(gameId);
          if (gameIndex !== -1) {
            this.playerGames.get(player.id).splice(gameIndex, 1);
          }
        }
      }
      
      this.games.delete(gameId);
      return true;
    }
    
    return false;
  }

  /**
   * Получает все игры игрока
   */
  getPlayerGames(playerId) {
    if (!this.playerGames.has(playerId)) {
      return [];
    }
    
    return this.playerGames.get(playerId)
      .map(gameId => this.games.get(gameId))
      .filter(game => game !== undefined);
  }
} 