'use client';

import { motion } from 'framer-motion';

type GameTableProps = {
  children: React.ReactNode;
};

export default function GameTable({ children }: GameTableProps) {
  return (
    <motion.div 
      className="relative rounded-3xl bg-gradient-to-br from-background-card to-background-dark border border-primary/20 shadow-lg overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Ambient light effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(15,224,255,0.1)_0,rgba(15,224,255,0)_70%)]"></div>
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(15,224,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(15,224,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
      
      {/* Table content */}
      <div className="relative p-8">
        {children}
      </div>
    </motion.div>
  );
} 