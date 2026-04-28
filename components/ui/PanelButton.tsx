import { motion } from 'motion/react';
import { UIService } from '@/lib/services/ui-service';

interface PanelButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: keyof typeof UIService.PANELS;
  className?: string;
  disabled?: boolean;
  whileHover?: any;
  whileTap?: any;
}

export function PanelButton({
  children,
  onClick,
  variant = 'default',
  className = '',
  disabled = false,
  whileHover,
  whileTap
}: PanelButtonProps) {
  const nineSliceStyle = UIService.getPanelStyleByVariant(variant);

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={whileHover || { scale: 1.05 }}
      whileTap={whileTap || { scale: 0.95 }}
      className={`relative flex items-center justify-center transition-all duration-200 ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:brightness-110 active:brightness-90'
      } ${className}`}
      style={{
        ...nineSliceStyle,
        textShadow: '0 2px 4px rgba(0,0,0,0.5)',
      }}
    >
      {/* Gradient overlay for depth */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" 
        style={{ borderImageSlice: '32 fill' }}
      />
      {/* Glow effect on hover */}
      <div 
        className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" 
        style={{ 
          boxShadow: 'inset 0 0 20px rgba(245, 199, 107, 0.3)',
        }} 
      />
      <div className="relative z-10 px-4 py-2 font-bold text-white">
        {children}
      </div>
    </motion.button>
  );
}
