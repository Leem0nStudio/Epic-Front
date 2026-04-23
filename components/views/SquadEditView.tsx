import React, { useState } from 'react';
import { ChevronLeft, Flame, Droplet, Leaf, Moon, Zap, Star, Shield } from 'lucide-react';
import { CharacterData } from '@/lib/types';

export function SquadEditView({ 
  characters, 
  squadIds, 
  onSaveSquad, 
  onBack 
}: { 
  characters: CharacterData[], 
  squadIds: string[], 
  onSaveSquad: (newSquad: string[]) => void, 
  onBack: () => void 
}) {
  const [currentSquad, setCurrentSquad] = useState<(string | null)[]>([
    squadIds[0] || null,
    squadIds[1] || null,
    squadIds[2] || null,
    squadIds[3] || null,
  ]);
  const [animatingSlot, setAnimatingSlot] = useState<number | null>(null);

  const handleRemoveFromSquad = (index: number) => {
    if (animatingSlot !== null) return; // Prevent multiple clicks
    setAnimatingSlot(index);
    setTimeout(() => {
      const newSquad = [...currentSquad];
      newSquad[index] = null;
      setCurrentSquad(newSquad);
      setAnimatingSlot(null);
    }, 150); // Short delay to allow the animation to play
  };

  const handleAddToSquad = (charId: string) => {
    if (currentSquad.includes(charId)) return; // Already in squad
    
    // Find first empty slot
    const emptyIndex = currentSquad.findIndex(id => id === null);
    if (emptyIndex !== -1) {
      const newSquad = [...currentSquad];
      newSquad[emptyIndex] = charId;
      setCurrentSquad(newSquad);
    }
  };

  const handleSave = () => {
    // Filter out nulls
    const finalSquad = currentSquad.filter(id => id !== null) as string[];
    if (finalSquad.length > 0) {
      onSaveSquad(finalSquad);
    }
  };

  const currentCost = currentSquad.reduce((acc, id) => {
    if (!id) return acc;
    const char = characters.find(c => c.id === id);
    return acc + (char?.cost || 0);
  }, 0);
  
  const maxCost = 45; // Arbitrary max cost

  return (
    <div className="w-full flex-1 flex flex-col gap-2 relative font-sans animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="w-full flex justify-between items-center bg-gradient-to-r from-[#4a2e1a] via-[#5c3a21] to-[#4a2e1a] border-[2px] border-[#c79a5d] rounded-[4px] shadow-md p-1 z-20 relative">
        <button onClick={onBack} className="bg-[#1a110a] border border-[#c79a5d] rounded p-1 hover:brightness-110 active:scale-95 text-[#f2e6d5]">
          <ChevronLeft size={16} />
        </button>
        <span className="font-serif font-bold text-[#f2e6d5] text-stroke-black text-[14px] tracking-widest drop-shadow-md">
          MANAGE SQUAD
        </span>
        <button 
          onClick={handleSave}
          disabled={currentSquad.filter(id => id !== null).length === 0 || currentCost > maxCost}
          className="bg-gradient-to-b from-[#6bb84c] to-[#3a7522] border border-[#9ceb7a] rounded px-2 py-1 text-[10px] font-bold text-white shadow-sm disabled:opacity-50 disabled:grayscale transition-all active:scale-95"
        >
          SAVE
        </button>
      </div>

      {/* Cost Bar */}
      <div className="w-full bg-[#1a110a] border-[1.5px] border-[#5a4227] rounded-sm p-1 flex justify-between items-center shadow-inner">
        <span className="text-[#a68a68] text-[10px] font-bold ml-1 uppercase">Total Cost</span>
        <div className="flex items-center gap-2">
           <div className="w-[100px] h-[6px] bg-black border border-[#333] rounded-[2px] overflow-hidden">
             <div 
               className={`h-full ${currentCost > maxCost ? 'bg-red-500' : 'bg-gradient-to-r from-[#ffcc00] to-[#ffaa00]'}`} 
               style={{ width: `${Math.min(100, (currentCost / maxCost) * 100)}%` }}
             ></div>
           </div>
           <span className={`text-[12px] font-bold font-serif ${currentCost > maxCost ? 'text-red-500' : 'text-white'}`}>
             {currentCost}/{maxCost}
           </span>
        </div>
      </div>

      {/* Squad Slots Overlay Display */}
      <div className="w-full bg-gradient-to-b from-[#e3cfb4] to-[#c7b08d] rounded-[4px] border-[2px] border-[#5a4227] p-2 flex gap-1 justify-center relative shadow-md">
        <div className="absolute inset-0 border border-[#f3e5ca] rounded-[2px] pointer-events-none z-20"></div>
        {currentSquad.map((charId, idx) => {
          const char = charId ? characters.find(c => c.id === charId) : null;
          return (
            <div 
              key={idx} 
              onClick={() => charId && handleRemoveFromSquad(idx)}
              className={`w-[65px] h-[85px] border-[1.5px] rounded border-[#5a4227] shadow-[inset_0_2px_5px_rgba(0,0,0,0.5)] flex flex-col justify-end items-center relative overflow-hidden transition-all ${char ? 'bg-[#2a1b12] cursor-pointer hover:border-[#ffcc00]' : 'bg-[#1a110a]/50'}`}
            >
               {char ? (
                 <>
                   <div className="absolute top-1 right-1 bg-black/60 rounded px-[2px] border border-white/20 z-20">
                     <span className="text-[8px] text-white">Cost {char.cost}</span>
                   </div>
                   <img 
                     src={char.spriteUrl} 
                     className={`max-w-[150%] max-h-[150%] scale-[1.2] translate-y-2 object-contain filter drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] z-10 transition-transform duration-100 ${animatingSlot === idx ? 'scale-[1.4] -translate-y-1 brightness-150' : ''}`} 
                     style={{ imageRendering: 'pixelated', filter: char.cssFilter }} 
                     alt="" 
                   />
                   <div className="w-full bg-black/80 absolute bottom-0 py-[2px] z-20 flex justify-center border-t border-[#444]">
                     <span className="text-[8px] font-bold text-white truncate max-w-[90%]">{char.name}</span>
                   </div>
                 </>
               ) : (
                 <div className="absolute inset-0 flex items-center justify-center opacity-30">
                    <Shield size={24} className="text-[#c7b08d]" />
                 </div>
               )}
            </div>
          )
        })}
      </div>

      {/* Roster Grid */}
      <div className="flex-1 bg-[#1a110a] border-[2px] border-[#382618] rounded p-1 overflow-y-auto mt-1 relative z-10 mb-2">
        <div className="w-full text-center py-1 bg-black/40 mb-2 border-b border-[#333]">
           <span className="text-[10px] text-[#a68a68] uppercase font-bold tracking-widest">Available Units</span>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
           {characters.map(char => {
             const isSelected = currentSquad.includes(char.id);
             return (
               <div 
                 key={char.id}
                 onClick={() => handleAddToSquad(char.id)}
                 className={`relative w-full aspect-square border-[1.5px] rounded overflow-hidden flex items-end justify-center cursor-pointer transition-all hover:brightness-110 active:scale-95 ${isSelected ? 'border-[#6bb84c] grayscale opacity-50 cursor-default' : 'border-[#5a4227] bg-gradient-to-t from-[#2a1b12] to-[#4a2e1a]'}`}
               >
                 <img src={char.spriteUrl} className="max-h-[120%] max-w-[120%] object-contain drop-shadow-md translate-y-1" style={{ imageRendering: 'pixelated', filter: char.cssFilter }} alt="" />
                 {isSelected && (
                   <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-20">
                     <span className="bg-[#6bb84c] text-white text-[8px] font-bold px-1 rounded-sm border border-white">IN SQUAD</span>
                   </div>
                 )}
               </div>
             )
           })}
        </div>
      </div>

    </div>
  );
}
