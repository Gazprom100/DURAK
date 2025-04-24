'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignIn() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username) {
      setError('Пожалуйста, введите имя пользователя');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      });
      
      if (result?.error) {
        setError('Ошибка авторизации. Пожалуйста, проверьте данные и попробуйте снова.');
        setIsLoading(false);
      } else {
        router.push('/profile');
      }
    } catch (error) {
      setError('Произошла ошибка. Пожалуйста, попробуйте позже.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background animated gradient */}
      <div className="absolute inset-0 bg-background-dark overflow-hidden">
        <div className="absolute -inset-[10%] opacity-30">
          <div className="w-full h-full bg-[radial-gradient(circle_at_center,rgba(15,224,255,0.8)_0,rgba(15,224,255,0)_50%)] animate-[pulse_10s_ease-in-out_infinite]"></div>
        </div>
        <div className="absolute -inset-[5%] top-[30%] opacity-20">
          <div className="w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,54,245,0.8)_0,rgba(255,54,245,0)_50%)] animate-[pulse_8s_ease-in-out_infinite_1s]"></div>
        </div>
      </div>
      
      {/* Logo and title */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <Link href="/">
          <h1 className="font-display text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent cursor-pointer">
            DURAK
          </h1>
        </Link>
        <p className="mt-3 font-display text-xl text-text-muted">
          Вход в игру
        </p>
      </motion.div>
      
      {/* Sign in form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="container-glow max-w-md w-full"
      >
        <div className="card bg-background-card/90 backdrop-blur-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-md bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-text-muted mb-1">
                Имя пользователя
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-primary/30 rounded-md bg-background-dark text-text-light placeholder-text-muted/50 focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="Введите имя пользователя"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-muted mb-1">
                Пароль
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-primary/30 rounded-md bg-background-dark text-text-light placeholder-text-muted/50 focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="Введите пароль (опционально)"
              />
              <p className="mt-1 text-xs text-text-muted">
                Для демо-версии пароль не требуется
              </p>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full button-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Выполняется вход...' : 'Войти'}
              </button>
            </div>
          </form>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-primary/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-background-card text-text-muted">Или войдите через</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => signIn('google', { callbackUrl: '/profile' })}
                className="w-full flex justify-center py-2 px-4 border border-primary/30 rounded-md bg-background-dark text-white hover:bg-background-card transition-colors"
              >
                <span className="mr-2">Google</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
      
      <p className="mt-8 text-center text-sm text-text-muted">
        Ещё нет аккаунта?{' '}
        <span onClick={() => signIn('credentials', { username: 'Гость' + Math.floor(Math.random() * 1000), redirect: true, callbackUrl: '/profile' })} className="font-medium text-primary hover:text-primary/80 cursor-pointer">
          Войти как гость
        </span>
      </p>
    </div>
  );
} 