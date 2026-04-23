import React from 'react';
import { Settings, Diamond } from 'lucide-react';

export function TopBar({ currency = 1606 }: { currency?: number }) {
  return (
    <div className="relative w-full bg-[#462d1c] border-b-[3px] border-[#29170b] shadow-md z-30 flex-shrink-0">
      <div className="absolute top-0 w-full h-[1.5px] bg-[#755034]"></div>
      <div className="absolute top-[1.5px] w-full h-[1px] bg-[#29170b] opacity-40"></div>
      <div className="absolute bottom-[-3px] w-full h-[1.5px] bg-[#7c5b3c] z-30 opacity-70"></div>
      
      <div className="flex justify-between items-start p-[6px] px-2 relative z-20">
        <div className="flex flex-col text-[#cfbca1] text-[11px] sm:text-[12px] font-medium leading-[1.1] w-full max-w-[65%] mt-[2px]">
          <div className="flex flex-wrap items-center gap-x-[6px] font-sans">
            <span className="text-[#f2e6d5] text-stroke-sm drop-shadow-[0_1px_1px_rgba(0,0,0,1)] tracking-wide">Brave Frontier</span>
            <span className="text-[#8c7456] hidden sm:inline">|</span>
            <span className="text-[#b09e86]">Player:</span>
            <span className="text-white drop-shadow-[0_1px_1px_rgba(0,0,0,1)] truncate max-w-[80px] sm:max-w-none">Uptodown</span>
            <span className="text-[#8c7456]">|</span>
            <span className="text-[#b09e86]">Lv <span className="text-white drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">1</span></span>
          </div>
          <div className="mt-[3px] flex items-center font-sans tracking-wide">
            <span className="text-[#96846d] whitespace-nowrap">Arena Status:</span>
            <span className="text-[#ffffff] ml-1 drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">0 points</span>
          </div>
        </div>

        <div className="flex flex-col gap-[1px] bg-[#1a1108] border border-[#523b28] rounded-[2px] p-[2px] w-[110px] filter drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between text-white text-[11px] font-bold px-1 relative h-[16px] bg-gradient-to-r from-[#2a1a0c] to-transparent rounded-sm">
            <Diamond size={13} className="fill-[#00ffcc] text-[#00ccaa] -ml-[2px]" />
            <span className="text-stroke-black text-right z-10 font-sans tracking-tight">0</span>
          </div>
          <div className="flex items-center justify-between text-white text-[11px] font-bold px-[5px] relative h-[16px] bg-gradient-to-r from-[#2a1a0c] to-transparent rounded-sm">
            <div className="w-[11px] h-[11px] rounded-full bg-gradient-to-br from-[#4a9eff] to-[#0033aa] border-[1px] border-[#001144] shadow-inner -ml-[1px]"></div>
            <span className="text-stroke-black text-right z-10 font-sans tracking-tight">6420</span>
          </div>
          <div className="flex items-center justify-between text-white text-[11px] font-bold px-[5px] relative h-[16px] bg-gradient-to-r from-[#2a1a0c] to-transparent rounded-sm">
            <div className="w-[11px] h-[11px] rounded-full bg-gradient-to-br from-[#ffd700] to-[#aa6600] border-[1px] border-[#442200] shadow-inner -ml-[1px]"></div>
            <span className="text-stroke-black text-right z-10 font-sans tracking-tight">{currency}</span>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-[10px] left-1/2 -translate-x-1/2 w-6 h-6 flex items-center justify-center z-40 bg-gradient-to-b from-[#5c412d] to-[#3a2517] rounded-full border-[1.5px] border-[#1d1209] shadow-md">
        <Settings size={12} className="text-[#baab99] drop-shadow-md" />
      </div>
    </div>
  );
}
