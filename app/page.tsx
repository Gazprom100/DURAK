'use client';

import { useState, useEffect } from 'react';
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
      
      {/* Scattered playing cards background with crypto logos */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Карты с криптовалютами */}
        <div className="crypto-card-btc"></div>
        <div className="crypto-card-eth"></div>
        <div className="crypto-card-usdt"></div>
        <div className="crypto-card-bnb"></div>
        <div className="crypto-card-sol"></div>
      </div>
      
      {/* Logo and title with glowing animation */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.0 }}
        className="text-center mb-16 z-10 relative"
      >
        <motion.h1 
          className="font-display text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent glow-text"
          animate={{ 
            textShadow: [
              '0 0 7px rgba(15, 224, 255, 0.6), 0 0 10px rgba(15, 224, 255, 0.4), 0 0 21px rgba(15, 224, 255, 0.3), 0 0 42px rgba(15, 224, 255, 0.2)',
              '0 0 10px rgba(255, 54, 245, 0.6), 0 0 15px rgba(255, 54, 245, 0.4), 0 0 25px rgba(255, 54, 245, 0.3), 0 0 51px rgba(255, 54, 245, 0.2)',
              '0 0 7px rgba(20, 241, 149, 0.6), 0 0 10px rgba(20, 241, 149, 0.4), 0 0 21px rgba(20, 241, 149, 0.3), 0 0 42px rgba(20, 241, 149, 0.2)',
              '0 0 7px rgba(15, 224, 255, 0.6), 0 0 10px rgba(15, 224, 255, 0.4), 0 0 21px rgba(15, 224, 255, 0.3), 0 0 42px rgba(15, 224, 255, 0.2)',
            ]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity, 
            repeatType: "reverse" 
          }}
          data-text="DURAK" // для ::before контента
        >
          DURAK
        </motion.h1>
        <motion.p 
          className="mt-3 font-display text-xl text-text-light"
          animate={{ 
            opacity: [0.7, 1, 0.7],
            textShadow: [
              '0 0 4px rgba(15, 224, 255, 0.5), 0 0 8px rgba(15, 224, 255, 0.3)',
              '0 0 4px rgba(255, 54, 245, 0.5), 0 0 8px rgba(255, 54, 245, 0.3)',
              '0 0 4px rgba(15, 224, 255, 0.5), 0 0 8px rgba(15, 224, 255, 0.3)',
            ]
          }}
          transition={{ 
            duration: 5, 
            repeat: Infinity, 
            repeatType: "reverse" 
          }}
        >
          Современная многопользовательская карточная игра
        </motion.p>
      </motion.div>
      
      {/* Navigation buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl z-10 relative">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          whileHover={{ scale: 1.05 }}
          className="container-glow"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <Link href="/game">
            <div className="card flex flex-col items-center justify-center h-60 cursor-pointer bg-background-card/90 backdrop-blur-sm">
              <motion.div 
                className="text-5xl mb-4"
                animate={{ y: isHovering ? [0, -10, 0] : 0 }}
                transition={{ repeat: isHovering ? Infinity : 0, duration: 1.5 }}
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
        className="mt-16 text-text-muted text-sm z-10 relative"
      >
        <p>© 2023 DURAK - Все права защищены</p>
      </motion.div>
    </div>
  );
} 