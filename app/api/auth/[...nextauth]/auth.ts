import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { nanoid } from 'nanoid';
import { AuthOptions, Session } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import { createWallet, getWalletBalance } from '@/utils/decimal';

// Тут можно подключить настоящую DB в будущем
const users = new Map();

// Store wallet private keys securely
// In a real application, this would be encrypted and stored in a secure database
const walletPrivateKeys = new Map();

// Game pool wallet (in a real application, this would be managed securely)
const gamePoolWallet = {
  address: process.env.GAME_POOL_ADDRESS || '',
  privateKey: process.env.GAME_POOL_PRIVATE_KEY || '',
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
        
        // Проверяем, есть ли пользователь в "БД"
        if (!users.has(credentials.username)) {
          // Создаем нового пользователя
          const userId = nanoid();
          
          // Create wallet for new user
          const wallet = await createWallet();
          
          const newUser = {
            id: userId,
            name: credentials.username,
            email: `${credentials.username}@example.com`,
            image: `https://i.pravatar.cc/150?u=${userId}`,
            bonusPoints: 100, // Начальные бонусы
            wins: 0,
            losses: 0,
            gamesPlayed: 0,
            walletAddress: wallet.address,
            walletBalance: '0',
            walletCreated: true,
          };
          
          // Store user data and wallet private key
          users.set(credentials.username, newUser);
          walletPrivateKeys.set(userId, wallet.privateKey);
        }
        
        return users.get(credentials.username);
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
        const userData = users.get(username) || {};
        
        // Update wallet balance if wallet exists
        if (userData.walletAddress) {
          try {
            const balance = await getWalletBalance(userData.walletAddress);
            userData.walletBalance = balance;
            users.set(username, userData);
          } catch (error) {
            console.error('Error updating wallet balance:', error);
          }
        }
        
        // Теперь можем безопасно присваивать свойства благодаря расширенным типам
        session.user.id = token.sub;
        session.user.bonusPoints = userData.bonusPoints || 0;
        session.user.wins = userData.wins || 0;
        session.user.losses = userData.losses || 0;
        session.user.gamesPlayed = userData.gamesPlayed || 0;
        session.user.walletAddress = userData.walletAddress || '';
        session.user.walletBalance = userData.walletBalance || '0';
        session.user.walletCreated = userData.walletCreated || false;
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
  return walletPrivateKeys.get(userId) || '';
};

export const getGamePoolWallet = () => {
  return gamePoolWallet;
}; 