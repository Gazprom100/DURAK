'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Home() {
  const [isHovering, setIsHovering] = useState(false);
  
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
        className="text-center mb-16"
      >
        <h1 className="font-display text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">
          DURAK
        </h1>
        <p className="mt-3 font-display text-xl text-text-muted">
          Современная многопользовательская карточная игра
        </p>
      </motion.div>
      
      {/* Navigation buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          whileHover={{ scale: 1.05 }}
          className="container-glow"
        >
          <Link href="/game">
            <div className="card flex flex-col items-center justify-center h-60 cursor-pointer bg-background-card/90 backdrop-blur-sm">
              <motion.div 
                className="text-5xl mb-4"
                animate={{ y: isHovering ? [0, -10, 0] : 0 }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                🎮
              </motion.div>
              <h2 className="font-display text-2xl font-semibold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Играть</h2>
              <p className="text-text-muted text-center max-w-xs">Присоединяйтесь к онлайн столам или создавайте свою игру</p>
            </div>
          </Link>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          whileHover={{ scale: 1.05 }}
          className="container-glow"
        >
          <Link href="/profile">
            <div className="card flex flex-col items-center justify-center h-60 cursor-pointer bg-background-card/90 backdrop-blur-sm">
              <div className="text-5xl mb-4">👑</div>
              <h2 className="font-display text-2xl font-semibold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary">Профиль</h2>
              <p className="text-text-muted text-center max-w-xs">Ваши достижения, бонусы и статистика</p>
            </div>
          </Link>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          whileHover={{ scale: 1.05 }}
          className="container-glow md:col-span-2"
        >
          <Link href="/leaderboard">
            <div className="card flex flex-col items-center justify-center h-40 cursor-pointer bg-background-card/90 backdrop-blur-sm">
              <div className="text-5xl mb-4">🏆</div>
              <h2 className="font-display text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-accent to-secondary">Таблица лидеров</h2>
            </div>
          </Link>
        </motion.div>
      </div>
      
      {/* Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mt-16 text-text-muted text-sm"
      >
        <p>© 2023 DURAK - Все права защищены</p>
      </motion.div>
    </div>
  );
} 