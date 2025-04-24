import NextAuth from 'next-auth';
import { authOptions } from './auth';

// Экспортируем обработчики HTTP методов
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 