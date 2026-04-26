'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface GameTooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function GameTooltip({ content, children, position = 'top' }: GameTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const posClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  return (
    <div
        className="relative inline-block"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onTouchStart={() => setIsVisible(true)}
        onTouchEnd={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 5 }}
            className={`absolute z-[100] min-w-[120px] pointer-events-none ${posClasses[position]}`}
          >
            <div className="bg-[#0B1A2A]/95 backdrop-blur-xl border border-white/10 p-3 rounded-2xl shadow-2xl">
              {content}
            </div>
            {/* Arrow */}
            <div className={`absolute w-2 h-2 bg-[#0B1A2A] border-r border-b border-white/10 rotate-45 ${
                position === 'top' ? 'left-1/2 -bottom-1 -translate-x-1/2' :
                position === 'bottom' ? 'left-1/2 -top-1 -translate-x-1/2' :
                position === 'left' ? 'top-1/2 -right-1 -translate-y-1/2' :
                'top-1/2 -left-1 -translate-y-1/2'
            }`} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
