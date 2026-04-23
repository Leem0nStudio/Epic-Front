import React from 'react';
import { Flag, Sword, Sparkles, Shield } from 'lucide-react';

export function BottomNavBar({ currentView, setView }: { currentView: string, setView: (v: any) => void }) {
  const tabs = [
    { id: 'home', label: 'Home', icon: Flag },
    { id: 'battle', label: 'Quests', icon: Sword },
    { id: 'summon', label: 'Summon', icon: Sparkles },
    { id: 'unitList', label: 'Units', icon: Shield },
  ];

  return (
    <div className="w-full bg-[#351e0e] border-t-[3px] border-[#1a0f07] flex justify-between p-1 pb-4 sm:pb-1 shadow-[0_-4px_6px_rgba(0,0,0,0.5)] z-40 flex-shrink-0 relative">
       <div className="absolute top-0 w-full h-[1px] bg-[#614125]"></div>
       {tabs.map((tab, idx) => {
          const isActive = currentView === tab.id || (currentView === 'character' && tab.id === 'unitList') || (currentView === 'inventory' && tab.id === 'unitList');
          return (
             <button
               key={tab.id + idx}
               onClick={() => {
                 setView(tab.id as any);
               }}
               className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-sm border-[1.5px] relative group overflow-hidden transition-all duration-200 mx-[1px] active:scale-95
                 ${isActive 
                   ? 'bg-gradient-to-b from-[#6b4226] to-[#4a2e1a] border-[#a67c52] shadow-inner' 
                   : 'bg-gradient-to-b from-[#2b180d] to-[#170c06] border-[#0c0603] hover:from-[#351e0e] hover:brightness-110'}
               `}
             >
               {isActive && <div className="absolute inset-0 bg-white opacity-5 pointer-events-none"></div>}
               {isActive && <div className="absolute top-0 w-[80%] h-[1px] bg-[#f2e6d5] opacity-40"></div>}
               <tab.icon size={20} className={`mb-[2px] ${isActive ? 'text-[#ffdd88] fill-[#e6a23c]' : 'text-[#7d5f47]'} drop-shadow-md`} />
               <span className={`text-[10px] sm:text-[11px] font-bold font-serif uppercase tracking-tight text-stroke-black leading-none drop-shadow-md
                 ${isActive ? 'text-white' : 'text-[#877259]'}
               `}>
                 {tab.label}
               </span>
             </button>
          )
       })}
    </div>
  )
}
