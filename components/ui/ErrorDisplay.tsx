import { Button } from './Button';

interface ErrorDisplayProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorDisplay({
  title = 'Error de Carga',
  message,
  onRetry,
  className = '',
}: ErrorDisplayProps) {
  return (
    <div className={`flex flex-col items-center justify-center h-full p-8 text-center gap-4 ${className}`}>
      <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center text-red-500 text-2xl font-black">
        !
      </div>
      <h1 className="text-xl font-black text-white tracking-widest uppercase italic">{title}</h1>
      <p className="text-white/40 text-xs max-w-md uppercase tracking-wider">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="secondary" size="sm">
          Reintentar
        </Button>
      )}
    </div>
  );
}
