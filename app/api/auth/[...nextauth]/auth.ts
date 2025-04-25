import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { nanoid } from 'nanoid';
import { AuthOptions, Session } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import { createWallet, getWalletBalance } from '@/utils/decimal';
import { 
  User, users, walletPrivateKeys, userExists, getUserByName, 
  addUser, getUserPrivateKey as getPrivateKeyFromStore 
} from '@/utils/user-store';

// API route файлы всегда выполняются на сервере
const isServer = true;
const isProductionBuild = process.env.NODE_ENV === 'production';

// Game pool wallet (in a real application, this would be managed securely)
const gamePoolWallet = {
  address: process.env.GAME_POOL_ADDRESS || '',
  privateKey: process.env.GAME_POOL_PRIVATE_KEY || '',
};

// Безопасный логгер, который не будет вызывать проблем при сборке
const safeLog = (message: string, error?: any) => {
  if (!isProductionBuild) {
    console.error(message, error);
  }
};

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'fake-google-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'fake-google-client-secret',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Имя пользователя", type: "text", placeholder: "Введите имя" },
        password: { label: "Пароль", type: "password" }
      },
      async authorize(credentials) {
        // Для демо простая авторизация, в проде нужна настоящая БД
        if (!credentials?.username) return null;
        
        // Проверяем, есть ли пользователь в хранилище
        if (!userExists(credentials.username)) {
          try {
            // Создаем нового пользователя
            const userId = nanoid();
            
            // Базовые поля пользователя без кошелька
            const newUser: User = {
              id: userId,
              name: credentials.username,
              email: `${credentials.username}@example.com`,
              image: `https://i.pravatar.cc/150?u=${userId}`,
              bonusPoints: 100, // Начальные бонусы
              wins: 0,
              losses: 0,
              gamesPlayed: 0,
              walletAddress: '', // Кошелек не создан при регистрации
              walletBalance: '0',
              walletCreated: false, // Кошелек создается отдельно
            };
            
            // Добавляем пользователя в хранилище
            addUser(newUser);
          } catch (error) {
            safeLog('Error creating user:', error);
            return null;
          }
        }
        
        // Получаем пользователя и преобразуем в объект, совместимый с next-auth
        const user = getUserByName(credentials.username);
        return user || null; // Явно преобразуем undefined в null для next-auth
      }
    }),
  ],
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async session({ session, token }: { session: Session; token: JWT }) {
      // Добавляем дополнительные данные в сессию
      if (session.user) {
        const username = session.user.name || '';
        const user = getUserByName(username);
        
        // Используем безопасное присваивание с проверкой существования пользователя
        if (user) {
          session.user.id = token.sub || user.id;
          session.user.bonusPoints = user.bonusPoints;
          session.user.wins = user.wins;
          session.user.losses = user.losses;
          session.user.gamesPlayed = user.gamesPlayed;
          session.user.walletAddress = user.walletAddress;
          session.user.walletBalance = user.walletBalance;
          session.user.walletCreated = user.walletCreated;
        } else {
          // Дефолтные значения, если пользователь не найден
          session.user.id = token.sub;
          session.user.bonusPoints = 0;
          session.user.wins = 0;
          session.user.losses = 0;
          session.user.gamesPlayed = 0;
          session.user.walletAddress = '';
          session.user.walletBalance = '0';
          session.user.walletCreated = false;
        }
      }
      return session;
    },
  },
  session: {
    strategy: "jwt" as const,
  },
};

// Helper functions for wallet management
export const getUserPrivateKey = (userId: string): string => {
  return getPrivateKeyFromStore(userId);
};

export const getGamePoolWallet = () => {
  return gamePoolWallet;
}; 