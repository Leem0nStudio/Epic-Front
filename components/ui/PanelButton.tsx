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
  const panelUrl = UIService.getPanelUrl(UIService.PANELS[variant]);

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={whileHover}
      whileTap={whileTap}
      className={`relative flex items-center justify-center transition-all ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:brightness-110'
      } ${className}`}
      style={{
        backgroundImage: `url('${panelUrl}')`,
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
        // 9-slice effect using border-image
        borderImageSource: `url('${panelUrl}')`,
        borderImageSlice: '48 48 48 48 fill',
        borderWidth: '16px',
        borderStyle: 'solid',
      } as React.CSSProperties}
    >
      <div className="relative z-10 px-4 py-2">
        {children}
      </div>
    </motion.button>
  );
}
