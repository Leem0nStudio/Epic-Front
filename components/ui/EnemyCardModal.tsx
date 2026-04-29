'use client';

import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface EnemyCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardUrl: string;
  enemyName: string;
}

export function EnemyCardModal({ isOpen, onClose, cardUrl, enemyName }: EnemyCardModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            className="relative max-w-sm w-full bg-[#0B1A2A] rounded-2xl border-2 border-[#F5C76B]/30 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white/70 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>

            {/* Card header */}
            <div className="p-4 border-b border-white/10">
              <h3 className="text-lg font-black font-display italic text-[#F5C76B] uppercase tracking-wider text-center">
                {enemyName}
              </h3>
            </div>

            {/* Card image */}
            <div className="p-6 flex items-center justify-center bg-gradient-to-b from-[#0B1A2A] to-[#1a253a]">
              <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden border border-white/10 shadow-lg">
                <img
                  src={cardUrl}
                  alt={`${enemyName} card`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/assets/ui/icon_novice.png'; // Fallback
                  }}
                />
              </div>
            </div>

            {/* Card footer */}
            <div className="p-4 border-t border-white/10 text-center">
              <span className="text-[10px] text-white/40 uppercase tracking-widest font-stats">
                Enemy Card
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
