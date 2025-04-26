// redis.js - заглушка без настоящего взаимодействия с Redis
// Используем локальное хранилище для упрощения

const lobbyPlayers = new Map();
const playerGames = new Map();

/**
 * Добавляет игрока в лобби
 */
export function addPlayerToLobby(playerId, playerName) {
  lobbyPlayers.set(playerId, {
    id: playerId,
    name: playerName,
    joinedAt: new Date()
  });
  return true;
}

/**
 * Удаляет игрока из лобби
 */
export function removePlayerFromLobby(playerId) {
  if (lobbyPlayers.has(playerId)) {
    lobbyPlayers.delete(playerId);
    return true;
  }
  return false;
}

/**
 * Получает данные о всех игроках в лобби
 */
export function getLobbyPlayersData() {
  return Array.from(lobbyPlayers.values());
}

/**
 * Добавляет игру для игрока
 */
export function addGameForPlayer(playerId, gameId) {
  if (!playerGames.has(playerId)) {
    playerGames.set(playerId, []);
  }
  playerGames.get(playerId).push(gameId);
  return true;
}

/**
 * Удаляет игрока из всех игр
 */
export function leaveAllGames(playerId) {
  if (playerGames.has(playerId)) {
    playerGames.delete(playerId);
    return true;
  }
  return false;
}

/**
 * Проверяет существование игры
 */
export function checkGame(gameId) {
  // В заглушке всегда считаем, что игра существует
  return true;
} 