import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { nanoid } from 'nanoid';
import { AuthOptions, Session } from 'next-auth';
import { JWT } from 'next-auth/jwt';

// Тут можно подключить настоящую DB в будущем
const users = new Map();

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
          const newUser = {
            id: userId,
            name: credentials.username,
            email: `${credentials.username}@example.com`,
            image: `https://i.pravatar.cc/150?u=${userId}`,
            bonusPoints: 100, // Начальные бонусы
            wins: 0,
            losses: 0,
            gamesPlayed: 0,
          };
          users.set(credentials.username, newUser);
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
        
        // Теперь можем безопасно присваивать свойства благодаря расширенным типам
        session.user.id = token.sub;
        session.user.bonusPoints = userData.bonusPoints || 0;
        session.user.wins = userData.wins || 0;
        session.user.losses = userData.losses || 0;
        session.user.gamesPlayed = userData.gamesPlayed || 0;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt" as const,
  },
}; 