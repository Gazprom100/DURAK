// Утилиты для работы с хранилищем пользователей
// В реальном приложении эти данные хранились бы в базе данных

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  bonusPoints: number;
  wins: number;
  losses: number;
  gamesPlayed: number;
  walletAddress: string;
  walletBalance: string;
  walletCreated: boolean;
  [key: string]: any;
}

// Мапы для хранения пользователей и приватных ключей
// Глобальные переменные используются для имитации базы данных
// В реальном приложении эти данные хранились бы в базе данных
const users = new Map<string, User>();
const walletPrivateKeys = new Map<string, string>();
const userNameToId = new Map<string, string>();

// Получить пользователя по ID
export const getUserById = (userId: string): User | undefined => {
  return users.get(userId);
};

// Получить пользователя по имени
export const getUserByName = (username: string): User | undefined => {
  const userId = userNameToId.get(username);
  if (!userId) return undefined;
  return users.get(userId);
};

// Добавить нового пользователя
export const addUser = (user: User, privateKey?: string): void => {
  users.set(user.id, user);
  userNameToId.set(user.name, user.id);
  
  if (privateKey) {
    walletPrivateKeys.set(user.id, privateKey);
  }
};

// Обновить данные пользователя
export const updateUser = (userId: string, updateData: Partial<User>): void => {
  const existingUser = users.get(userId);
  
  if (!existingUser) {
    throw new Error(`User with ID ${userId} not found`);
  }
  
  // Сохраняем приватный ключ, если он есть в обновлении
  if (updateData.privateKey) {
    walletPrivateKeys.set(userId, updateData.privateKey);
    delete updateData.privateKey; // Удаляем из обновления, чтобы не хранить его в объекте пользователя
  }
  
  // Обновляем данные пользователя
  const updatedUser = {
    ...existingUser,
    ...updateData,
  };
  
  users.set(userId, updatedUser);
  
  // Если имя изменилось, обновляем мапу userNameToId
  if (updatedUser.name !== existingUser.name) {
    userNameToId.delete(existingUser.name);
    userNameToId.set(updatedUser.name, userId);
  }
};

// Получить приватный ключ пользователя
export const getUserPrivateKey = (userId: string): string => {
  return walletPrivateKeys.get(userId) || '';
};

// Проверить, существует ли пользователь с указанным именем
export const userExists = (username: string): boolean => {
  return userNameToId.has(username);
};

// Инициализировать хранилище некоторыми тестовыми данными
export const initializeStore = (): void => {
  // Этот метод можно вызвать при запуске приложения, чтобы добавить тестовых пользователей
  // Для демонстрационных целей
};

// Экспортируем объекты для прямого доступа из других серверных частей приложения
// Например, для импорта в auth.ts
export { users, walletPrivateKeys, userNameToId }; 