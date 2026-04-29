interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

const sizeClasses = {
  sm: 'w-6 h-6 border-2',
  md: 'w-12 h-12 border-2',
  lg: 'w-16 h-16 border-3',
};

export function LoadingSpinner({ size = 'md', text, className = '' }: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      <div
        className={`${sizeClasses[size]} border-t-[#F5C76B] border-white/5 rounded-full animate-spin`}
      />
      {text && (
        <p className="text-[10px] font-black text-white/40 tracking-[0.5em] animate-pulse uppercase">
          {text}
        </p>
      )}
    </div>
  );
}
