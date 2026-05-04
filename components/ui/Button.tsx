'use client';

import { motion } from 'motion/react';
import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'action';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'game';
  whileHover?: any;
  whileTap?: any;
  type?: 'button' | 'submit' | 'reset';
}

const variantClasses = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
  action: 'btn-action',
};

const sizeClasses = {
  sm: 'px-4 py-2 text-[10px]',
  md: 'px-6 py-3 text-xs',
  lg: 'px-8 py-4 text-sm',
  xl: 'px-10 py-4 text-base',
  game: 'px-14 py-3.5 text-xl font-black font-display tracking-widest uppercase',
};

export function Button({
  children,
  onClick,
  disabled = false,
  className = '',
  variant = 'secondary',
  size = 'md',
  whileHover,
  whileTap,
  type = 'button',
}: ButtonProps) {
  return (
    <motion.button
      type={type}
      whileHover={!disabled ? (whileHover || { scale: 1.05, y: -2, boxShadow: "0 10px 20px rgba(0,0,0,0.3)" }) : undefined}
      whileTap={!disabled ? (whileTap || { scale: 0.95, y: 1 }) : undefined}
      onClick={onClick}
      disabled={disabled}
      className={`
        relative font-black tracking-widest uppercase rounded-xl border-2 transition-all
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {/* Haptic/Tactile visual feedback layer */}
      <motion.div
        className="absolute inset-0 bg-white/5 opacity-0 rounded-lg"
        whileTap={{ opacity: 1 }}
      />

      {children}
    </motion.button>
  );
}
