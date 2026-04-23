import React from 'react';
import { ChevronLeft, Star, Sparkles } from 'lucide-react';
import { Item, ItemType } from '@/lib/types';
import { SpriteIcon } from '@/components/ui/SpriteIcon';

export function InventoryView({ targetSlot, inventory, onBack, onEquip, onUnequip, equippedItem }: { targetSlot: ItemType | null, inventory: Item[], onBack: () => void, onEquip: (i:Item)=>void, onUnequip: (slot:ItemType)=>void, equippedItem: Item | null }) {
  const filteredItems = inventory.filter((item: Item) => item.type === targetSlot);

  return (
    <div className="w-full flex-1 flex flex-col pt-1 pb-4 animate-in slide-in-from-right-4 duration-200">
      
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-[#4a2e1a] to-[#2a1708] border-[2px] border-[#c79a5d] rounded-[4px] p-2 mb-4 shadow-[0_2px_10px_rgba(0,0,0,1)]">
        <button onClick={onBack} className="bg-gradient-to-b from-[#6b1c1c] to-[#3a0b0b] border-[1.5px] border-[#924b4b] rounded-sm p-1 hover:brightness-125 active:scale-95 transition-all duration-200 shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
           <ChevronLeft size={16} className="text-[#f2e6d5]" />
        </button>
        <div className="flex-1 text-center mr-6">
           <span className="font-serif font-black text-[#f2e6d5] text-[16px] text-stroke-sm tracking-widest uppercase">
             SELECT {targetSlot}
           </span>
        </div>
      </div>

      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-[#a58d78] text-[12px] font-bold font-sans tracking-wide">
           INVENTORY
        </span>
        <span className="text-[#a58d78] text-[12px] font-bold font-sans tracking-wide">
           {filteredItems.length} / 50
        </span>
        <div className="w-[28px]" /> {/* Spacer for centering */}
      </div>

      {/* Currently Equipped Strip */}
      <div className="bg-[#2c1d11] border-[2px] border-[#1a110a] rounded-[4px] p-2 mb-4 relative shadow-[inset_0_0_10px_rgba(0,0,0,0.8)]">
         <div className="absolute -top-[10px] left-3 bg-[#4a2e1a] border border-[#1a110a] px-2 rounded-full text-[10px] font-bold text-[#c79a5d] tracking-wide shadow-md">
            CURRENTLY EQUIPPED
         </div>
         {equippedItem ? (
           <div className="flex items-center gap-3 mt-2">
              <div className="w-12 h-12 flex-shrink-0 bg-gradient-to-b from-[#6a4c33] to-[#2b1b0f] border border-[#1a110a] rounded flex items-center justify-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]">
                <SpriteIcon col={equippedItem.sprite.col} row={equippedItem.sprite.row} size={28} className={equippedItem.sprite.className} />
              </div>
              <div className="flex flex-col flex-1">
                <span className="font-bold text-white text-[14px] text-stroke-sm drop-shadow-md">{equippedItem.name}</span>
                <div className="flex gap-2 text-[11px] font-bold text-[#a58d78]">
                   {equippedItem.stats.hp > 0 && <span>HP <span className="text-[#00ffcc]">+{equippedItem.stats.hp}</span></span>}
                   {equippedItem.stats.atk > 0 && <span>ATK <span className="text-[#00ffcc]">+{equippedItem.stats.atk}</span></span>}
                   {equippedItem.stats.def > 0 && <span>DEF <span className="text-[#00ffcc]">+{equippedItem.stats.def}</span></span>}
                   {equippedItem.stats.rec > 0 && <span>REC <span className="text-[#00ffcc]">+{equippedItem.stats.rec}</span></span>}
                </div>
              </div>
              <button 
                onClick={() => targetSlot && onUnequip(targetSlot)}
                className="bg-gradient-to-b from-[#5c5c5c] to-[#222222] border-[1.5px] border-[#888] rounded px-2 py-1 text-[11px] font-bold text-white text-stroke-black hover:brightness-125 active:scale-95 transition-all duration-200 whitespace-nowrap shadow-md"
              >
                Unequip
              </button>
           </div>
         ) : (
           <div className="text-[12px] font-bold text-[#775a40] text-center w-full py-3">
              No {targetSlot} currently equipped.
           </div>
         )}
      </div>

      {/* Item List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {filteredItems.map((item, index) => {
           const isEquipped = equippedItem?.id === item.id;
           return (
              <div key={item.id} className="group relative bg-gradient-to-b from-[#e3cfb4] to-[#c7b08d] rounded-[4px] border-[2px] border-[#5a4227] p-2 flex items-center gap-3 rpg-panel-shadow hover:z-50 cursor-help">
                 <div className="absolute inset-0 border border-[#f3e5ca] rounded-[2px] pointer-events-none"></div>
                 
                 <div className="w-14 h-14 flex-shrink-0 bg-gradient-to-b from-[#6a4c33] to-[#2b1b0f] border-[1.5px] border-[#1a110a] rounded flex justify-center items-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] relative">
                    <div className="absolute top-0 w-[90%] h-[1px] bg-white opacity-20 mt-[1px]"></div>
                    <SpriteIcon col={item.sprite.col} row={item.sprite.row} size={28} className={item.sprite.className} />
                 </div>
                 
                 <div className="flex flex-col flex-1 leading-tight py-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-white text-stroke-black text-[14px] truncate drop-shadow-md group-hover:text-[#ffcc00] transition-colors">{item.name}</span>
                      <div className="flex">
                         {[...Array(item.rarity)].map((_, i) => <Star key={i} size={10} className="fill-[#ffe46e] text-[#ffe46e]" />)}
                      </div>
                    </div>
                    
                    <span className="text-[10px] text-[#3a220c] font-medium my-[2px] leading-tight line-clamp-1">{item.description}</span>
                    
                    <div className="flex flex-wrap gap-x-2 text-[10px] font-bold text-[#3c2a16]">
                       {item.stats.hp > 0 && <span>HP +{item.stats.hp}</span>}
                       {item.stats.atk > 0 && <span>ATK +{item.stats.atk}</span>}
                       {item.stats.def > 0 && <span>DEF +{item.stats.def}</span>}
                       {item.stats.rec > 0 && <span>REC +{item.stats.rec}</span>}
                    </div>
                 </div>

                 {/* TOOLTIP ON HOVER */}
                 <div className="absolute top-[-5px] left-8 sm:left-[60px] w-[260px] max-w-[80vw] bg-gradient-to-b from-[#2a1a0c] to-[#120a05] border-[2px] border-[#c79a5d] rounded-[6px] p-3 shadow-[0_15px_30px_rgba(0,0,0,0.9),inset_0_2px_10px_rgba(255,255,255,0.1)] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-[100] transform -translate-y-full">
                    {/* Tooltip Arrow */}
                    <div className="absolute -bottom-[6px] left-[20px] w-[10px] h-[10px] bg-[#120a05] border-b-[2px] border-r-[2px] border-[#c79a5d] transform rotate-45"></div>

                    <div className="flex justify-between items-start mb-2 border-b border-[#5a4227] pb-1">
                      <h4 className="font-serif font-bold text-[#f2e6d5] text-[15px] text-stroke-sm">{item.name}</h4>
                      <span className="text-[#a58d78] text-[10px] uppercase font-bold tracking-wider">{item.type}</span>
                    </div>

                    <p className="text-[11px] text-[#cfbca1] mb-2 italic leading-snug">{item.description}</p>
                    
                    <div className="grid grid-cols-2 gap-1 text-[11px] font-bold text-white text-stroke-black mb-2">
                       {item.stats.hp > 0 && <span className="bg-[#1a110a] rounded-sm px-1 shadow-inner">HP: <span className="text-[#00ffcc] drop-shadow-md">+{item.stats.hp}</span></span>}
                       {item.stats.atk > 0 && <span className="bg-[#1a110a] rounded-sm px-1 shadow-inner">ATK: <span className="text-[#00ffcc] drop-shadow-md">+{item.stats.atk}</span></span>}
                       {item.stats.def > 0 && <span className="bg-[#1a110a] rounded-sm px-1 shadow-inner">DEF: <span className="text-[#00ffcc] drop-shadow-md">+{item.stats.def}</span></span>}
                       {item.stats.rec > 0 && <span className="bg-[#1a110a] rounded-sm px-1 shadow-inner">REC: <span className="text-[#00ffcc] drop-shadow-md">+{item.stats.rec}</span></span>}
                    </div>

                    {item.effects && item.effects.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-[#3a220c]">
                        <span className="text-[#ffcc00] text-[10px] font-bold uppercase tracking-widest drop-shadow-md mb-1 block">Special Effects</span>
                        <ul className="flex flex-col gap-[2px]">
                          {item.effects.map((effect, eIdx) => (
                            <li key={eIdx} className="text-[11px] text-white flex items-start leading-[1.2]">
                              <Sparkles size={10} className="text-[#ffcc00] mr-1 mt-[2px] flex-shrink-0" />
                              <span className="text-stroke-sm">{effect}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                 </div>

                 <button 
                  onClick={() => onEquip(item)}
                  disabled={isEquipped}
                  className={`flex-shrink-0 relative z-20 px-3 py-1.5 rounded border-[1.5px] text-[11px] font-bold text-stroke-black shadow-[0_2px_4px_rgba(0,0,0,0.5)] transition-all duration-200 ${isEquipped ? 'bg-[#555] border-[#333] text-gray-300 opacity-80 cursor-default' : 'bg-gradient-to-b from-[#6bb84c] to-[#3a7522] border-[#9ceb7a] text-white hover:brightness-125 active:scale-95 cursor-pointer'}`}
                 >
                   {isEquipped ? 'Equipped' : 'Equip'}
                 </button>
              </div>
           );
        })}
      </div>

    </div>
  )
}