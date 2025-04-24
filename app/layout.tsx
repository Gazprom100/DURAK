import './globals.css';
import { Inter, Chakra_Petch } from 'next/font/google';
import { Providers } from './providers';
import { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const chakraPetch = Chakra_Petch({ 
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  variable: '--font-chakra-petch'
});

export const metadata: Metadata = {
  title: 'DURAK - Современная карточная игра',
  description: 'Многопользовательская игра "Дурак" с современным дизайном и системой бонусов',
  icons: {
    icon: [
      { url: '/favicon.svg' }
    ]
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={`${inter.variable} ${chakraPetch.variable} font-sans bg-background-dark text-text-light min-h-screen`}>
        <Providers>
          <main className="min-h-screen">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
} 