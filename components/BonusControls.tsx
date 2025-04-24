'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bonus } from '../types';

type BonusControlsProps = {
  onUseBonus: (bonusId: number) => void;
  playerBonuses?: Bonus[];
};

export default function BonusControls({ onUseBonus, playerBonuses }: BonusControlsProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Если бонусы не переданы, используем демо бонусы
  const bonuses = playerBonuses || [
    { id: 1, name: 'Ещё одна карта', description: 'Возьмите дополнительную карту', isAvailable: true },
    { id: 2, name: 'Выбор козыря', description: 'Поменять козырную масть', isAvailable: false },
    { id: 3, name: 'Знание карт', description: 'Видеть 2 карты противника', isAvailable: true },
    { id: 4, name: 'Защита', description: 'Одна карта не может быть побита', isAvailable: false },
  ];
  
  const availableBonuses = bonuses.filter(bonus => bonus.isAvailable);
  
  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="button-secondary flex items-center gap-2"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span>Бонусы</span>
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-background-dark text-secondary text-xs">
          {availableBonuses.length}
        </span>
      </motion.button>
      
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="absolute bottom-full mb-2 right-0 w-64 bg-background-card border border-secondary/30 rounded-lg shadow-neon-pink overflow-hidden z-10"
        >
          <div className="p-3 border-b border-secondary/20">
            <h3 className="text-lg font-display font-medium text-text-light">Доступные бонусы</h3>
          </div>
          
          <div className="max-h-60 overflow-y-auto">
            {availableBonuses.length === 0 ? (
              <div className="p-4 text-center text-text-muted">
                У вас нет доступных бонусов
              </div>
            ) : (
              <ul className="divide-y divide-secondary/10">
                {availableBonuses.map(bonus => (
                  <li key={bonus.id} className="p-3 hover:bg-background-dark/50 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-text-light font-medium">{bonus.name}</h4>
                      <button
                        onClick={() => {
                          onUseBonus(bonus.id);
                          setIsOpen(false);
                        }}
                        className="text-xs px-2 py-1 rounded bg-secondary/20 text-secondary hover:bg-secondary/30 transition-colors"
                      >
                        Использовать
                      </button>
                    </div>
                    <p className="text-xs text-text-muted">{bonus.description}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="p-2 text-right border-t border-secondary/20">
            <button
              onClick={() => setIsOpen(false)}
              className="text-xs px-3 py-1 text-text-muted hover:text-text-light transition-colors"
            >
              Закрыть
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
} 