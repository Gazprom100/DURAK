'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Проверяем состояние страницы
export const dynamic = 'force-dynamic';

export default function Home() {
  const [isHovering, setIsHovering] = useState(false);
  const isDBDisabled = process.env.DISABLE_MONGODB === 'true';
  
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
        {/* Bitcoin */}
        <div className="crypto-card crypto-card-btc">
          <div className="crypto-card-border"></div>
          <div className="crypto-card-glow"></div>
          <div className="crypto-card-inner">
            <span className="crypto-card-symbol">BTC</span>
            <svg className="crypto-card-logo" viewBox="0 0 24 24" fill="#F7931A">
              <path d="M23.638 14.904c-1.602 6.425-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.962 2.68 8.475-1.243 14.9.358c6.43 1.605 10.342 8.115 8.738 14.548v-.002zm-6.738-4.225c.16-1.08-.66-1.65-1.78-2.035l.365-1.47-.893-.225-.356 1.44c-.234-.06-.475-.114-.716-.17l.36-1.45-.895-.225-.365 1.473c-.198-.045-.39-.09-.578-.135l.002-.008-1.233-.303-.238.952s.66.15.646.16c.36.09.425.325.413.512l-.415 1.693c.024.006.57.015.082.026-.027-.006-.055-.015-.084-.026l-.58 2.36c-.046.113-.16.285-.42.22.01.013-.647-.162-.647-.162l-.443 1.023 1.164.29.64.15-.37 1.494.897.225.366-1.473c.247.066.484.128.716.187l-.36 1.462.892.225.37-1.488c1.496.284 2.62.17 3.094-1.186.4-1.156-.02-1.862-.845-2.302.603-.147 1.06-.532 1.18-1.328.002 0 .002-.003.003-.003zm-2.105 2.896c-.285 1.148-2.154.528-2.754.37l.492-1.968c.6.15 2.544.445 2.262 1.598zm.318-2.975c-.242 1.03-1.834.507-2.34.378l.445-1.787c.498.126 2.144.36 1.895 1.41z" />
            </svg>
          </div>
        </div>
        
        {/* Ethereum */}
        <div className="crypto-card crypto-card-eth">
          <div className="crypto-card-border"></div>
          <div className="crypto-card-glow"></div>
          <div className="crypto-card-inner">
            <span className="crypto-card-symbol">ETH</span>
            <svg className="crypto-card-logo" viewBox="0 0 24 24" fill="#627EEA">
              <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z" />
            </svg>
          </div>
        </div>
        
        {/* USDT */}
        <div className="crypto-card crypto-card-usdt">
          <div className="crypto-card-border"></div>
          <div className="crypto-card-glow"></div>
          <div className="crypto-card-inner">
            <span className="crypto-card-symbol">USDT</span>
            <svg className="crypto-card-logo" viewBox="0 0 24 24" fill="#26A17B">
              <path d="M12 0C5.374 0 0 5.374 0 12s5.374 12 12 12 12-5.374 12-12S18.629 0 12 0zm5.02 7.910v2.068h1.654v1.418h-4.606V9.978h1.654V7.91h-6.35v2.068h1.655v1.418H6.32V9.978h1.658V7.91h-.433C7.545 7.91 8.648 7.14 12 7.14s4.455.77 4.455.77h-.434zm-1.13 5.313c-.082 0-1.028 1.145-3.89 1.145s-3.808-1.145-3.808-1.145v3.308s.787 1.145 3.808 1.145 3.89-1.145 3.89-1.145v-3.308z" />
            </svg>
          </div>
        </div>
        
        {/* BNB */}
        <div className="crypto-card crypto-card-bnb">
          <div className="crypto-card-border"></div>
          <div className="crypto-card-glow"></div>
          <div className="crypto-card-inner">
            <span className="crypto-card-symbol">BNB</span>
            <svg className="crypto-card-logo" viewBox="0 0 24 24" fill="#F3BA2F">
              <path d="M12 0L7.428 4.572 4.8 1.944 1.944 4.8l2.628 2.628L0 12l4.572 4.572L0 24l12-12 12 12-4.572-7.428L24 12l-4.572-4.572L24 0 12 12 0 0h24zm0 4.572l7.428 7.428-7.428 7.428-7.428-7.428L12 4.572z" />
            </svg>
          </div>
        </div>
        
        {/* Solana */}
        <div className="crypto-card crypto-card-sol">
          <div className="crypto-card-border"></div>
          <div className="crypto-card-glow"></div>
          <div className="crypto-card-inner">
            <span className="crypto-card-symbol">SOL</span>
            <svg className="crypto-card-logo" viewBox="0 0 24 24" fill="#14F195">
              <path d="M17.077 10.356H3.759c-.23 0-.446-.11-.58-.297a.658.658 0 0 1-.045-.752l2.304-3.45c.134-.198.35-.308.579-.308h13.318c.23 0 .446.11.579.297a.658.658 0 0 1 .045.752l-2.303 3.45c-.134.198-.35.308-.579.308zM17.077 20.241H3.759c-.23 0-.446-.11-.58-.297a.658.658 0 0 1-.045-.752l2.304-3.45c.134-.198.35-.308.579-.308h13.318c.23 0 .446.11.579.297a.658.658 0 0 1 .045.752l-2.303 3.45c-.134.198-.35.308-.579.308zM3.759 3.759h13.318c.23 0 .446.11.58.297a.658.658 0 0 1 .045.752l-2.304 3.45c-.134.198-.35.308-.579.308H1.5c-.23 0-.446-.11-.579-.297a.658.658 0 0 1-.045-.752l2.304-3.45c.134-.198.35-.308.579-.308z" />
            </svg>
          </div>
        </div>
        
        {/* Cardano */}
        <div className="crypto-card crypto-card-ada">
          <div className="crypto-card-border"></div>
          <div className="crypto-card-glow"></div>
          <div className="crypto-card-inner">
            <span className="crypto-card-symbol">ADA</span>
            <svg className="crypto-card-logo" viewBox="0 0 24 24" fill="#0033AD">
              <path d="M12.22 9.822c1.247 0 2.255-1.008 2.255-2.254 0-1.246-1.008-2.254-2.254-2.254S9.966 6.322 9.966 7.568c0 1.246 1.008 2.254 2.254 2.254zm2.781 5.587c.882-.882.882-2.305 0-3.186-.882-.882-2.305-.883-3.186 0-.882.881-.882 2.304 0 3.186.881.881 2.304.881 3.186 0zM12 24C5.373 24 0 18.627 0 12S5.373 0 12 0s12 5.373 12 12-5.373 12-12 12zm.22-19.78c-1.76 0-3.19 1.43-3.19 3.195a3.18 3.18 0 0 0 .585 1.838h-.008c.088.122.086.287-.01.405l-.923 1.118a.247.247 0 0 1-.356.039l-.01-.007a.248.248 0 0 1-.075-.235l.143-.695c.061-.3-.133-.588-.445-.588H7.92c-.312 0-.505.288-.444.588l.14.679c.033.156-.07.307-.227.332l-1.206.193a.248.248 0 0 1-.282-.162v-.004a.248.248 0 0 1 .056-.244l.78-.844a.248.248 0 0 0-.015-.349l-.003-.002a3.197 3.197 0 0 1-.97-2.311 3.19 3.19 0 0 1 1.296-2.565 3.19 3.19 0 0 1 3.42-.376c.22-.396.512-.75.866-1.036a4.156 4.156 0 0 0-5.305 6.355.246.246 0 0 1-.002.323l-.78.845a.246.246 0 0 0 .03.347l.007.005a.246.246 0 0 0 .277.044l1.206-.193a.462.462 0 0 1 .462.234v.004a.462.462 0 0 1 .023.342l-.143.696a.462.462 0 0 0 .114.423l.012.01a.462.462 0 0 0 .652-.05l.923-1.118a.462.462 0 0 1 .648-.089.462.462 0 0 1 .122.152 3.191 3.191 0 0 0 5.358-1.23h1.148a4.159 4.159 0 0 0-6.272-1.944 4.159 4.159 0 0 0-1.4 1.944h1.08a3.186 3.186 0 0 1 2.606-1.36zm6.328 5.072a.246.246 0 0 0-.17-.069h-1.148a3.193 3.193 0 0 1-2.657 1.428 3.195 3.195 0 0 1-2.701-1.487.465.465 0 0 1-.116-.149.465.465 0 0 1 .031-.451c.081-.122.08-.286-.008-.405l-.923-1.118a.248.248 0 0 0-.357-.039l-.01.007a.248.248 0 0 0-.075.236l.143.695c.062.3-.132.588-.444.588h-.01c-.313 0-.506-.289-.444-.588l.14-.679a.248.248 0 0 0-.227-.333l-1.206.193a.248.248 0 0 0-.224.214.246.246 0 0 0 .056.244l.78.844a.247.247 0 0 1-.016.35l-.002.001a4.149 4.149 0 0 0-.97 2.68 4.16 4.16 0 0 0 8.314 0c0-.936-.31-1.8-.834-2.495a.246.246 0 0 1 .028-.375zM9.966 16.73c-1.246 0-2.254 1.009-2.254 2.254 0 1.247 1.008 2.254 2.254 2.254 1.247 0 2.254-1.007 2.254-2.254 0-1.245-1.007-2.254-2.254-2.254zm6.847 2.517a.246.246 0 0 0-.052-.273l-.78-.844a.248.248 0 0 1 .016-.35l.002-.002a4.153 4.153 0 0 0 .97-2.679c0-2.14-1.61-3.906-3.685-4.144a4.161 4.161 0 0 0-4.63 4.144c0 .938.31 1.802.836 2.498a.247.247 0 0 1-.029.374.246.246 0 0 1-.17.069h-1.08c.49 1.142 1.516 2.026 2.744 2.296a4.16 4.16 0 0 0 3.516-.893c-.395-.219-.742-.51-1.028-.864a3.192 3.192 0 0 1-4.716-.135c-.086-.122-.085-.287.009-.405l.923-1.118a.248.248 0 0 1 .357-.039l.01.007a.25.25 0 0 1 .075.235l-.143.696c-.062.3.132.588.444.588h.01c.313 0 .506-.289.444-.588l-.14-.68a.248.248 0 0 1 .227-.332l1.205.193a.248.248 0 0 1 .225.214.247.247 0 0 1-.057.244l-.78.844a.247.247 0 0 0 .016.35l.003.002a3.195 3.195 0 0 1-.303 4.876 3.187 3.187 0 0 1-2.389.56 3.19 3.19 0 0 1-2.6-3.091h-1.034a4.16 4.16 0 0 0 6.152 3.64 4.16 4.16 0 0 0 1.518-1.393h-1.023c-.22.395-.512.75-.865 1.035a3.19 3.19 0 0 1-5.068-1.035H6.78a4.16 4.16 0 0 0 7.628-.001h-.009a.464.464 0 0 1-.117-.15.465.465 0 0 1 .031-.451c.08-.122.08-.286-.008-.405l-.923-1.117a.248.248 0 0 0-.357-.04l-.01.007a.248.248 0 0 0-.075.236l.143.695c.062.3-.132.588-.444.588h-.01c-.313 0-.506-.289-.444-.588l.14-.68a.248.248 0 0 0-.227-.332l-1.206.193a.248.248 0 0 0-.224.214z" />
            </svg>
          </div>
        </div>
        
        {/* Polkadot */}
        <div className="crypto-card crypto-card-dot">
          <div className="crypto-card-border"></div>
          <div className="crypto-card-glow"></div>
          <div className="crypto-card-inner">
            <span className="crypto-card-symbol">DOT</span>
            <svg className="crypto-card-logo" viewBox="0 0 24 24" fill="#E6007A">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-.05 2.236a2.95 2.95 0 0 1 2.951 2.95 2.95 2.95 0 0 1-2.95 2.951 2.95 2.95 0 0 1-2.952-2.95 2.95 2.95 0 0 1 2.951-2.951zm-7.333 7c.932 0 1.706.698 1.828 1.614a8.263 8.263 0 0 0 2.18 4.482 2.954 2.954 0 0 1-1.713 5.449 2.95 2.95 0 0 1-2.95-2.95 2.95 2.95 0 0 1 .97-2.183 5.548 5.548 0 0 1-1.143-2.647 1.829 1.829 0 0 1-1.995-1.823c0-1.013.816-1.828 1.823-1.942zm14.666 0c1.007.114 1.823.929 1.823 1.942a1.83 1.83 0 0 1-1.995 1.823 5.548 5.548 0 0 1-1.143 2.647 2.95 2.95 0 0 1 .97 2.183 2.95 2.95 0 0 1-2.95 2.95 2.954 2.954 0 0 1-1.713-5.449 8.263 8.263 0 0 0 2.18-4.482c.122-.916.896-1.614 1.828-1.614z"/>
            </svg>
          </div>
        </div>
        
        {/* XRP */}
        <div className="crypto-card crypto-card-xrp">
          <div className="crypto-card-border"></div>
          <div className="crypto-card-glow"></div>
          <div className="crypto-card-inner">
            <span className="crypto-card-symbol">XRP</span>
            <svg className="crypto-card-logo" viewBox="0 0 24 24" fill="#0F72E5">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zM9.345 14.424l-4.388-4.388-1.878 1.878 6.265 6.265 6.265-6.265-1.878-1.878-4.387 4.388zM20.919 12L14.655 5.736l1.878-1.878 6.265 6.265-6.265 6.265-1.878-1.878L20.92 12zM9.345 9.576l-4.388 4.388-1.878-1.878 6.265-6.265 6.265 6.265-1.878 1.878-4.387-4.388z" />
            </svg>
          </div>
        </div>
        
        {/* Dogecoin */}
        <div className="crypto-card crypto-card-doge">
          <div className="crypto-card-border"></div>
          <div className="crypto-card-glow"></div>
          <div className="crypto-card-inner">
            <span className="crypto-card-symbol">DOGE</span>
            <svg className="crypto-card-logo" viewBox="0 0 24 24" fill="#BA9F33">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm.175 17.618c-.644.055-1.252.104-1.752.144-1.67.134-2.552.131-2.902.126v-3.112h4.04c.15 0 3.06.016 3.06-2.428 0-2.312-2.307-2.454-3.02-2.46h-2.924V5.962c.663-.57.94-.11 1.54-.165 1.454-.131 2.427-.129 2.822-.126v3.124h-4.02c-.15 0-3.08.01-3.08 2.428 0 2.308 2.312 2.484 3.04 2.489h2.883v2.88c-.01.009-.01.018-.01.026 0 0-.663.012-1.677 0z" />
            </svg>
          </div>
        </div>
        
        {/* Polygon (MATIC) */}
        <div className="crypto-card crypto-card-matic">
          <div className="crypto-card-border"></div>
          <div className="crypto-card-glow"></div>
          <div className="crypto-card-inner">
            <span className="crypto-card-symbol">MATIC</span>
            <svg className="crypto-card-logo" viewBox="0 0 24 24" fill="#8247E5">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-.56 19.177l-3.463-2.04v-4.52L15.39 7.424v3.652L7.977 15.27v2.535l3.463 1.373zm-3.463-7.424V8.258l7.413-4.193v3.495l-7.413 4.193zm10.925-4.193v8.713l-2.667 1.52v-8.685l2.667-1.548z" />
            </svg>
          </div>
        </div>
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
      
      {isDBDisabled && (
        <div className="fixed bottom-0 left-0 w-full bg-yellow-500 text-black p-2 text-center">
          Режим без базы данных (Отладка)
        </div>
      )}
    </div>
  );
} 