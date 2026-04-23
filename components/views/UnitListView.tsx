import React from 'react';
import { ChevronLeft, Flame, Droplet, Leaf, Moon, Zap, Star } from 'lucide-react';
import { CharacterData } from '@/lib/types';

export function UnitListView({ characters, onSelectCharacter, onManageSquad }: { characters: CharacterData[], onSelectCharacter: (id: string) => void, onManageSquad: () => void }) {
  return (
    <div className="w-full flex-1 flex flex-col animate-in fade-in duration-300 relative">
      {/* Header Banner */}
      <div className="relative w-full h-[40px] bg-gradient-to-r from-[#4a2e1a] via-[#5c3a21] to-[#4a2e1a] border-[2px] border-[#c79a5d] rounded-[4px] mb-2 shadow-[0_4px_10px_rgba(0,0,0,0.8)] flex items-center justify-between overflow-hidden px-2">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\\'20\\' height=\\'20\\' viewBox=\\'0 0 20 20\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cpath d=\\'M0 0h20v20H0V0zm10 10l10-10H0l10 10zm0 10L0 10v10h20V10L10 20z\\' fill=\\'%23000\\' fill-opacity=\\'0.1\\' fill-rule=\\'evenodd\\'/%3E%3C/svg%3E')]"></div>
        <div className="absolute top-0 w-[90%] h-[1px] bg-white opacity-30 mt-[1px]"></div>
        <span className="font-serif font-bold text-[#f2e6d5] text-stroke-black text-[15px] tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,1)] z-10 w-full text-center">
          UNIT INVENTORY
        </span>
      </div>

      <div className="w-full flex justify-between mb-2 px-1">
         <span className="text-[11px] font-bold text-[#c7b08d] bg-[#1a110a] px-2 py-1 rounded border border-[#382618]">
            Units: {characters.length}/50
         </span>
         <button onClick={onManageSquad} className="bg-gradient-to-b from-[#b53c22] to-[#6e1e0a] border border-[#ffaa88] rounded px-3 py-1 text-[11px] font-bold text-white shadow-sm flex items-center gap-1 active:scale-95 transition-all">
            MANAGE SQUAD
         </button>
      </div>

      {/* Roster Grid */}
      <div className="grid grid-cols-3 gap-2 px-1 overflow-y-auto pb-4">
        {characters.map(char => {
            const getElementBg = () => {
              switch (char.element) {
                case 'Fire': return "from-[#6a2213] to-[#2b0e07] border-[#8a2d18]";
                case 'Water': return "from-[#1a3a5a] to-[#0a1828] border-[#295a8f]";
                case 'Earth': return "from-[#224424] to-[#0d1c0e] border-[#38703a]";
                case 'Dark': return "from-[#3a225a] to-[#180e28] border-[#55318a]";
                case 'Thunder': return "from-[#7a651f] to-[#2b2407] border-[#8a7222]";
                default: return "from-[#3a3a3a] to-[#181818] border-[#666666]";
              }
            };
            const getElementIcon = () => {
              switch (char.element) {
                case 'Fire': return <Flame size={12} className="fill-[#e85433] text-[#a62c12]" />;
                case 'Water': return <Droplet size={12} className="fill-[#2a5a8f] text-[#1a4a7f]" />;
                case 'Earth': return <Leaf size={12} className="fill-[#4caf50] text-[#1b5e20]" />;
                case 'Dark': return <Moon size={12} className="fill-[#7e57c2] text-[#311b92]" />;
                case 'Thunder': return <Zap size={12} className="fill-[#f2da3e] text-[#a18116]" />;
                default: return <Droplet size={12} className="fill-[#2a5a8f] text-[#1a4a7f]" />;
              }
            };

            return (
              <div 
                key={char.id}
                onClick={() => onSelectCharacter(char.id)}
                className={`relative aspect-[3/4] bg-gradient-to-b ${getElementBg()} border-[2px] rounded-md shadow-[0_4px_6px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.2)] overflow-hidden cursor-pointer group active:scale-[0.97] transition-all duration-200 hover:brightness-110 hover:shadow-[0_4px_12px_rgba(255,255,255,0.3)]`}
              >
                 {/* Top Label */}
                 <div className="absolute top-0 w-full flex justify-between items-start px-1 pt-1 z-20">
                    <div className="w-5 h-5 rounded-full bg-black/60 border border-[rgba(255,255,255,0.2)] flex items-center justify-center -ml-[2px] -mt-[2px] shadow-sm">
                       {getElementIcon()}
                    </div>
                    <div className="bg-[#1a110a]/80 px-1 rounded-sm border border-[rgba(255,255,255,0.2)]">
                       <span className="text-[9px] font-bold text-[#c7b08d]">Cost {char.cost}</span>
                    </div>
                 </div>

                 {/* Sprite */}
                 <div className="absolute inset-0 flex justify-center items-end pb-[10px]">
                    <div className="w-full h-1/2 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.15)_0%,transparent_70%)] absolute bottom-0 z-0"></div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={char.spriteUrl} 
                      className="max-h-[140%] max-w-[140%] object-contain filter drop-shadow-[0_4px_4px_rgba(0,0,0,1)] z-10 transform origin-bottom scale-[1.1] transition-transform duration-300 group-hover:scale-[1.2]"
                      style={{ imageRendering: 'pixelated', filter: char.cssFilter }} 
                      alt=""
                    />
                 </div>
                 
                 {/* Footer Info */}
                 <div className="relative w-full bg-gradient-to-t from-[rgba(0,0,0,0.9)] via-[rgba(0,0,0,0.8)] to-transparent pt-4 pb-1 px-1 flex flex-col items-center z-10 border-t border-[rgba(255,255,255,0.1)] mt-auto top-full -translate-y-full">
                    <div className="flex gap-[1px] mb-[2px]">
                       {[...Array(char.rarity)].map((_, i) => <Star key={i} size={8} className="fill-[#ffe46e] text-[#b39832]" />)}
                    </div>
                    <span className="text-[10px] font-bold text-white text-stroke-black truncate w-full text-center drop-shadow-md leading-none mb-1">
                      {char.name}
                    </span>
                    <span className="text-[9px] font-bold text-[#c79a5d] bg-[#1a110a] border border-[#3a2214] px-1 rounded-sm shadow-inner leading-tight">
                      Lv.{char.level}
                    </span>
                 </div>
              </div>
            );
        })}
      </div>
    </div>
  );
}
