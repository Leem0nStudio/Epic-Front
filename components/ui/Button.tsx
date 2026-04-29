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
}

const variantClasses = {
  primary: 'bg-[#F5C76B] text-[#0B1A2A] border-[#F5C76B] hover:brightness-110',
  secondary: 'bg-white/5 border-white/10 text-white hover:bg-white/10',
  ghost: 'bg-transparent text-white/70 hover:text-white hover:bg-white/5',
  danger: 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20',
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
}: ButtonProps) {
  return (
    <motion.button
      whileHover={!disabled ? (whileHover || { scale: 1.05 }) : undefined}
      whileTap={!disabled ? (whileTap || { scale: 0.95 }) : undefined}
      onClick={onClick}
      disabled={disabled}
      className={`
        relative font-black tracking-widest uppercase rounded-xl border-2 transition-all
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {children}
    </motion.button>
  );
}
