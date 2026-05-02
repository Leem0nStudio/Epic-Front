import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePreloadAssets } from '@/lib/asset-manager';
import { config } from '@/lib/config/app-config';

interface LoadingScreenProps {
  message?: string;
  showProgress?: boolean;
  criticalAssets?: string[];
  onComplete?: () => void;
}

const loadingMessages = [
  'Cargando sprites...',
  'Preparando unidades...',
  'Configurando batalla...',
  'Cargando inventario...',
  'Inicializando juego...',
];

export function LoadingScreen({
  message,
  showProgress = true,
  criticalAssets = ['novice', 'swordman', 'mage', 'archer', 'button_normal'],
  onComplete,
}: LoadingScreenProps) {
  const [currentMessage, setCurrentMessage] = useState(message || loadingMessages[0]);
  const { progress, isComplete, errors } = usePreloadAssets(criticalAssets);

  useEffect(() => {
    if (!message) {
      const interval = setInterval(() => {
        setCurrentMessage(prev => {
          const currentIndex = loadingMessages.indexOf(prev);
          const nextIndex = (currentIndex + 1) % loadingMessages.length;
          return loadingMessages[nextIndex];
        });
      }, 1500);

      return () => clearInterval(interval);
    }
  }, [message]);

  useEffect(() => {
    if (isComplete && onComplete) {
      // Pequeño delay para smooth transition
      const timeout = setTimeout(onComplete, 300);
      return () => clearTimeout(timeout);
    }
  }, [isComplete, onComplete]);

  const progressPercentage = Math.round(progress * 100);

  return (
    <AnimatePresence>
      {!isComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
        >
          <div className="text-center space-y-8">
            {/* Spinner animado */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full mx-auto"
            />

            {/* Mensaje de carga */}
            <motion.div
              key={currentMessage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-xl text-amber-400 font-medium"
            >
              {currentMessage}
            </motion.div>

            {/* Barra de progreso */}
            {showProgress && (
              <div className="w-80 mx-auto space-y-2">
                <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <div className="text-sm text-slate-400">
                  {progressPercentage}%
                </div>
              </div>
            )}

            {/* Mostrar errores si los hay */}
            {errors.length > 0 && config.isDevelopment() && (
              <div className="text-red-400 text-sm max-w-md mx-auto">
                <div className="font-medium mb-1">Assets con error:</div>
                <div className="text-xs opacity-75">
                  {errors.join(', ')}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Componente de loading más simple para estados locales
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className={`${sizeClasses[size]} border-amber-500 border-t-transparent rounded-full ${className}`}
    />
  );
}

// Hook para manejar estados de loading
export function useLoadingState(initialLoading = false) {
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [error, setError] = useState<string | null>(null);

  const startLoading = useCallback(() => {
    setIsLoading(true);
    setError(null);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  const setLoadingError = useCallback((errorMessage: string) => {
    setIsLoading(false);
    setError(errorMessage);
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    startLoading,
    stopLoading,
    setLoadingError,
    reset,
  };
}