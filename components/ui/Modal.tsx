'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  showCloseButton?: boolean;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = 'md',
  showCloseButton = true,
}: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
            className={`relative w-full ${sizeClasses[size]} overflow-hidden rounded-[2rem] bg-[#0B1A2A] border border-white/10 shadow-2xl`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-to-b from-[#F5C76B]/5 to-transparent blur-[80px]" />
            </div>

            {/* Header */}
            {(title || showCloseButton) && (
              <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/5">
                <div>
                  {title && (
                    <h2 className="text-lg font-black text-white uppercase font-display tracking-wider leading-none">
                      {title}
                    </h2>
                  )}
                  {subtitle && (
                    <span className="text-[9px] font-bold text-white/30 uppercase tracking-[0.2em] mt-1 block">
                      {subtitle}
                    </span>
                  )}
                </div>
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center bg-white/5 border border-white/10 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            )}

            {/* Content */}
            <div className="relative z-10 overflow-y-auto max-h-[70vh] custom-scrollbar">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
