import React from 'react';

export function SkillPanel({ icon, type, title, desc, cost, typeGradient, level, maxLevel, upgradeCost, canUpgrade, onUpgrade }: { icon: React.ReactNode, type: string, title: string, desc: string, cost?: string, typeGradient?: string, level?: number, maxLevel?: number, upgradeCost?: number, canUpgrade?: boolean, onUpgrade?: () => void }) {
  return (
    <div className="bg-gradient-to-b from-[#e3cfb4] to-[#c7b08d] rounded-[4px] border-[2px] border-[#5a4227] p-2 pt-[4px] rpg-panel-shadow relative flex flex-col justify-start min-h-[60px]">
      <div className="absolute inset-0 border border-[#f3e5ca] rounded-[2px] pointer-events-none"></div>
      <div className="flex flex-wrap items-center gap-[6px] mb-[2px]">
        {icon}
        <div className="flex items-center gap-1">
          <span className={`font-serif text-[12px] font-bold ${typeGradient ? `bg-clip-text text-transparent bg-gradient-to-b ${typeGradient} filter drop-shadow-[0_1px_0_rgba(0,0,0,0.8)]` : 'text-white text-stroke-black'} tracking-widest mt-[1px]`}>{type}</span>
          {level !== undefined && (
            <span className="ml-[2px] font-bold text-[#f5d796] text-[10px] bg-[#1a110a]/50 px-1 py-[1px] rounded-[2px] shadow-inner whitespace-nowrap">
              Lv {level}{maxLevel ? `/${maxLevel}` : ''}
            </span>
          )}
        </div>
      </div>
      <div className="w-[102%] -ml-[1%] h-[1.5px] bg-gradient-to-r from-transparent via-[#8a6b4c] to-transparent mb-[4px] opacity-70"></div>
      <div className="flex justify-between items-baseline mb-[2px] w-full">
        <h3 className="text-[13px] text-black font-bold tracking-tight text-white text-stroke-black drop-shadow-[0_1px_1px_rgba(0,0,0,1)] truncate pr-1">{title}</h3>
        {cost && (
          <span className="text-[11px] font-bold text-[#1a110a] border-[1.5px] border-[#5a4227] px-1 rounded-sm bg-[#cfb591] leading-none py-[2px] shadow-sm ml-auto whitespace-nowrap">
            <span className="font-normal mr-[2px]">Cost:</span>{cost}
          </span>
        )}
      </div>
      <p className="text-[11px] font-medium leading-[1.25] text-[#3a220c] w-[95%] mb-1">{desc}</p>
      
      {upgradeCost !== undefined && (
        <div className="mt-auto flex items-center justify-between border-t border-[#8a6b4c]/40 pt-1.5">
          <div className="flex items-center gap-[4px] bg-[#1a110a] px-1.5 py-[2px] rounded-sm border border-[#5a4227] shadow-inner">
             <div className="w-[10px] h-[10px] rounded-full bg-gradient-to-br from-[#ffd700] to-[#aa6600] border-[1px] border-[#442200]"></div>
             <span className={`text-[11px] font-bold leading-none ${canUpgrade ? 'text-white' : 'text-[#ff5555]'}`}>
               {upgradeCost}
             </span>
          </div>
          <button 
            onClick={onUpgrade}
            disabled={!canUpgrade || (maxLevel !== undefined && level !== undefined && level >= maxLevel)}
            className={`px-2 py-[2px] rounded-[2px] text-[10px] font-bold text-white text-stroke-sm shadow-[0_2px_4px_rgba(0,0,0,0.5)] transition-all flex items-center justify-center ${
              !canUpgrade || (maxLevel !== undefined && level !== undefined && level >= maxLevel)
              ? 'bg-gradient-to-b from-[#666] to-[#333] border border-[#888] opacity-80 cursor-not-allowed'
              : 'bg-gradient-to-b from-[#6bb84c] to-[#3a7522] border border-[#9ceb7a] active:scale-95 cursor-pointer hover:brightness-110'
            }`}
          >
            {(maxLevel !== undefined && level !== undefined && level >= maxLevel) ? 'MAXED' : 'UPGRADE'}
          </button>
        </div>
      )}
    </div>
  );
}
