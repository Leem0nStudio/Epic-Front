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

/**
 * Button variants per Art Bible v1.0 - Section 5.3
 */
const variantClasses = {
  // Main CTAs - Battle, Continue (gold gradient)
  primary: 'btn-primary',
  // Navigation, back buttons (dark panel)
  secondary: 'btn-secondary',
  // Icon buttons, tertiary actions (transparent)
  ghost: 'btn-ghost',
  // Destructive actions
  danger: 'btn-danger',
  // In-battle skill buttons
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
      whileHover={!disabled ? (whileHover || { scale: 1.02 }) : undefined}
      whileTap={!disabled ? (whileTap || { scale: 0.98 }) : undefined}
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
      {children}
    </motion.button>
  );
}