import './globals.css';
import { Inter, Chakra_Petch } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const chakraPetch = Chakra_Petch({ 
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  variable: '--font-chakra-petch'
});

export const metadata = {
  title: 'DURAK - Современная карточная игра',
  description: 'Многопользовательская игра "Дурак" с современным дизайном и системой бонусов',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={`${inter.variable} ${chakraPetch.variable} font-sans bg-background-dark text-text-light min-h-screen`}>
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
} 