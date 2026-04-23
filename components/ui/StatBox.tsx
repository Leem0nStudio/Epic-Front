import React from 'react';

export function StatBox({ label, value, colorClass, borderClass, labelColor, valueColor = "text-white" }: { label: string, value: string | number, colorClass: string, borderClass: string, labelColor: string, valueColor?: string }) {
  return (
    <div className={`w-[48%] h-[58px] bg-gradient-to-b ${colorClass} rounded-[6px] border-[2px] ${borderClass} flex flex-col items-center justify-center relative rpg-inner-shadow pb-1`}>
      <div className="absolute top-0 w-[94%] h-[1.5px] bg-white opacity-[0.15] mt-[1px] rounded-full pointer-events-none"></div>
      <span className={`text-[12px] font-bold font-serif tracking-widest ${labelColor} text-stroke-black drop-shadow-[0_1px_1px_rgba(0,0,0,1)] z-10`}>{label}</span>
      <span className={`text-[21px] font-bold ${valueColor} text-stroke-black leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,1)] z-10 -space-y-1 mt-[1px] tracking-wide transition-colors duration-300`}>{value}</span>
    </div>
  );
}
