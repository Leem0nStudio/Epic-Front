import React from 'react';
import { PlayerSaveData } from '@/lib/rpg-system/player-onboarding';
import { Sword, Sparkles, Shield, Store, TowerControl, Mail } from 'lucide-react';
import { RPGUnit } from '@/lib/rpg-system/types';

interface RPGHomeViewProps {
  saveData: PlayerSaveData;
  activePartyUnits: (RPGUnit | null)[];
  onNavigate: (view: 'home' | 'tavern' | 'party' | 'unit_details' | 'gacha' | 'inventory' | 'battle') => void;
}

export function RPGHomeView({ saveData, activePartyUnits, onNavigate }: RPGHomeViewProps) {
  const [now, setNow] = React.useState<number>(() => Date.now());

  React.useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full flex flex-col gap-3 relative font-sans animate-in fade-in duration-300">
      
      {/* Player Card Banner */}
      <div className="relative w-full h-[80px] shrink-0 bg-gradient-to-r from-[#2c1d11] via-[#4a2e1a] to-[#2c1d11] border-[2px] border-[#c79a5d] rounded-[4px] shadow-[0_4px_10px_rgba(0,0,0,0.8)] flex flex-col justify-center px-3 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\\'20\\' height=\\'20\\' viewBox=\\'0 0 20 20\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cpath d=\\'M0 0h20v20H0V0zm10 10l10-10H0l10 10zm0 10L0 10v10h20V10L10 20z\\' fill=\\'%23000\\' fill-opacity=\\'0.1\\' fill-rule=\\'evenodd\\'/%3E%3C/svg%3E')]"></div>
        <div className="absolute top-0 w-[90%] h-[1px] bg-white opacity-30 mt-[1px]"></div>
        
        <div className="flex items-center gap-3 z-10 w-full">
           <div className="w-12 h-12 bg-[#1a110a] border-[2px] border-[#eacf9b] rounded-full overflow-hidden flex items-center justify-center shadow-inner shrink-0">
               <img src="https://raw.githubusercontent.com/Leem0nGames/gameassets/main/RO/abbys_sprite_001.png" className="w-[150%] max-w-none transform translate-y-1 brightness-75 sepia(1) hue-rotate-180" style={{imageRendering: 'pixelated'}} alt="Avatar" />
           </div>
           <div className="flex flex-col flex-1">
              <span className="font-serif font-bold text-[#f2e6d5] text-[16px] text-stroke-sm tracking-wide drop-shadow-md leading-tight">
                Summoner
              </span>
              <div className="flex items-center gap-2 mt-1">
                 <span className="bg-[#1a110a] border border-[#a68a68] text-[#eacf9b] text-[10px] font-bold px-1.5 py-[1px] rounded-sm">LV. 1</span>
                 <div className="flex-1 max-w-[100px] h-[8px] bg-black border border-[#382618] rounded-full overflow-hidden relative">
                    <div className="h-full bg-gradient-to-r from-[#44aaff] to-[#0055ff] w-[20%]"></div>
                 </div>
                 <span className="text-[9px] text-[#a68a68] font-bold">EXP</span>
              </div>
           </div>
           <div className="flex flex-col items-end pr-2">
             <span className="text-[10px] text-[#a68a68] font-bold">ZENY</span>
             <span className="font-mono text-[#eacf9b] font-bold text-sm tracking-wider">{saveData.inventory.currency}</span>
           </div>
        </div>
      </div>

      {/* Main Town Screen / Billboard */}
      <div className="w-full flex-1 min-h-[200px] relative rounded-[4px] border-[2px] border-[#5a4227] shadow-[inset_0_4px_10px_rgba(0,0,0,0.8)] overflow-hidden bg-[#1a110a] flex flex-col justify-between">
         <div className="absolute inset-0 bg-cover bg-center opacity-80" style={{ backgroundImage: "url('https://raw.githubusercontent.com/Leem0nGames/gameassets/main/file_000000004e3071f5a7171db25e254771.png')", filter: 'brightness(0.6) sepia(0.3)' }}></div>
         
         <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[rgba(0,0,0,0.9)] to-transparent pointer-events-none"></div>

         <div className="z-10 p-3 pt-4">
           {/* Future elements could go here */}
         </div>

         {/* Hot Actions on Billboard */}
         <div className="z-10 flex gap-2 p-2 w-full mt-auto">
            <button onClick={() => onNavigate('battle')} className="flex-1 bg-gradient-to-b from-[#b53c22] to-[#6e1e0a] border-[1.5px] border-[#ea7a5d] rounded p-2 flex flex-col items-center justify-center gap-1 shadow-lg active:scale-95 transition-all hover:brightness-110">
               <Sword size={24} className="text-white drop-shadow-md" />
               <span className="text-[12px] font-bold font-serif text-white tracking-widest text-stroke-sm">QUESTS</span>
            </button>
            <button onClick={() => onNavigate('gacha')} className="flex-1 bg-gradient-to-b from-[#b59d22] to-[#6e580a] border-[1.5px] border-[#ead15d] rounded p-2 flex flex-col items-center justify-center gap-1 shadow-lg active:scale-95 transition-all hover:brightness-110">
               <Sparkles size={24} className="text-white drop-shadow-md" />
               <span className="text-[12px] font-bold font-serif text-white tracking-widest text-stroke-sm">THE FORGE</span>
            </button>
         </div>
      </div>

      {/* Facilities Grid */}
      <div className="grid grid-cols-2 gap-2 shrink-0 relative z-10 w-full mb-1">
         
         <button onClick={() => onNavigate('party')} className="bg-gradient-to-br from-[#35251a] to-[#1a110a] border-[1.5px] border-[#5a4227] rounded shadow-[0_4px_6px_rgba(0,0,0,0.5)] p-3 flex flex-col items-center justify-center gap-2 group active:scale-95 transition-all hover:border-[#c79a5d] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-white opacity-5 rounded-full blur-xl group-hover:opacity-10 transition-opacity"></div>
            <Shield size={28} className="text-[#a68a68] group-hover:text-[#c79a5d] transition-colors drop-shadow-md" />
            <span className="font-serif font-bold text-[#eacf9b] text-[13px] tracking-widest text-stroke-black">FORMATION</span>
         </button>

         <button onClick={() => onNavigate('tavern')} className="bg-gradient-to-br from-[#35251a] to-[#1a110a] border-[1.5px] border-[#5a4227] rounded shadow-[0_4px_6px_rgba(0,0,0,0.5)] p-3 flex flex-col items-center justify-center gap-2 group active:scale-95 transition-all hover:border-[#c79a5d] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-white opacity-5 rounded-full blur-xl group-hover:opacity-10 transition-opacity"></div>
            <Store size={28} className="text-[#a68a68] group-hover:text-[#c79a5d] transition-colors drop-shadow-md" />
            <span className="font-serif font-bold text-[#eacf9b] text-[13px] tracking-widest text-stroke-black">TAVERN</span>
            {saveData.tavernQueue.some((q) => now >= q.availableAtTimestamp && q.generatedUnit) && (
              <div className="absolute top-2 right-2 bg-[#b53c22] w-3 h-3 rounded-full border border-[#ea7a5d] animate-pulse shadow-[0_0_5px_rgba(255,0,0,0.8)] z-20"></div>
            )}
         </button>

         <button className="bg-gradient-to-br from-[#35251a] to-[#1a110a] border-[1.5px] border-[#5a4227] rounded shadow-[0_4px_6px_rgba(0,0,0,0.5)] p-3 flex flex-col items-center justify-center gap-2 group active:scale-95 transition-all hover:border-[#c79a5d] relative overflow-hidden opacity-80">
            <div className="absolute top-0 right-0 w-16 h-16 bg-white opacity-5 rounded-full blur-xl group-hover:opacity-10 transition-opacity"></div>
            <TowerControl size={28} className="text-[#a68a68] group-hover:text-[#c79a5d] transition-colors drop-shadow-md" />
            <span className="font-serif font-bold text-[#eacf9b] text-[13px] tracking-widest text-stroke-black">ARENA</span>
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
               <span className="bg-[#b53c22] text-white text-[10px] font-bold px-2 py-0.5 rounded border border-[#ea7a5d] shadow-sm transform -rotate-12">WIP</span>
            </div>
         </button>

         <button className="bg-gradient-to-br from-[#35251a] to-[#1a110a] border-[1.5px] border-[#5a4227] rounded shadow-[0_4px_6px_rgba(0,0,0,0.5)] p-3 flex flex-col items-center justify-center gap-2 group active:scale-95 transition-all hover:border-[#c79a5d] relative overflow-hidden opacity-80">
            <div className="absolute top-0 right-0 w-16 h-16 bg-white opacity-5 rounded-full blur-xl group-hover:opacity-10 transition-opacity"></div>
            <Mail size={28} className="text-[#a68a68] group-hover:text-[#c79a5d] transition-colors drop-shadow-md" />
            <span className="font-serif font-bold text-[#eacf9b] text-[13px] tracking-widest text-stroke-black">PRESENTS</span>
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
               <span className="bg-[#b53c22] text-white text-[10px] font-bold px-2 py-0.5 rounded border border-[#ea7a5d] shadow-sm transform -rotate-12">WIP</span>
            </div>
         </button>

      </div>
    </div>
  );
}
