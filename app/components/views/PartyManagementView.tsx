import React, { useState } from 'react';
import { PlayerSaveData } from '@/lib/rpg-system/player-onboarding';
import { RPGUnit } from '@/lib/rpg-system/types';
import { Shield, ArrowLeft, ArrowUpCircle } from 'lucide-react';

interface PartyManagementViewProps {
  saveData: PlayerSaveData;
  activePartyUnits: (RPGUnit | null)[];
  onNavigate: (view: 'home') => void;
  onAssignToParty: (unitId: string, slotIndex: number) => void;
  onRemoveFromParty: (slotIndex: number) => void;
}

export function PartyManagementView({ saveData, activePartyUnits, onNavigate, onAssignToParty, onRemoveFromParty }: PartyManagementViewProps) {
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  const availableRoster = saveData.roster.filter(u => !saveData.party.includes(u.id));

  return (
    <div className="flex flex-col h-full bg-[#0d0805] bg-[url('https://www.transparenttextures.com/patterns/dark-wood.png')] text-[#f2e6d5]">
      <div className="flex items-center p-3 bg-[#1a110a] border-b border-[#382618] shrink-0">
        <button onClick={() => onNavigate('home')} className="p-2 mr-3 hover:bg-[#382618]/50 rounded-md transition-colors">
          <ArrowLeft className="w-5 h-5 text-[#a68a68]" />
        </button>
        <div className="flex flex-col">
          <h1 className="text-xl font-bold flex items-center gap-2 font-serif"><Shield className="w-5 h-5 text-[#c79a5d]"/> Formation</h1>
          <p className="text-xs text-[#a68a68]">Manage your active team.</p>
        </div>
      </div>

      <div className="flex-1 p-4 flex flex-col gap-4 overflow-hidden">
        {/* Active Party */}
        <div className="grid grid-cols-3 gap-2 shrink-0">
          {activePartyUnits.map((unit, idx) => (
            <div 
              key={idx} 
              onClick={() => setSelectedSlot(idx === selectedSlot ? null : idx)}
              className={`bg-[#1a110a] rounded-sm p-3 flex flex-col items-center justify-center text-center relative overflow-hidden cursor-pointer transition-all ${
                selectedSlot === idx ? 'border-[#c79a5d] ring-[1px] ring-[#c79a5d] shadow-[0_0_10px_rgba(199,154,93,0.3)] bg-[#2c1d11]' : 'border border-[#382618] hover:border-[#5a4227]'
              } ${idx >= saveData.partySize ? 'opacity-30 cursor-not-allowed' : ''}`}
              style={{ minHeight: '130px' }}
            >
               {idx >= saveData.partySize ? (
                 <span className="text-[10px] text-[#5a4227] font-bold uppercase tracking-widest font-serif">Locked Slot</span>
               ) : unit ? (
                 <>
                    <div className="w-10 h-10 mb-1 border border-[#382618] rounded-sm bg-[#0d0805] overflow-hidden flex items-center justify-center shadow-inner">
                        {/* Placeholder for character sprite */}
                        <div className="w-[80%] h-[80%] bg-white/5 rounded-full"></div>
                    </div>
                    <h3 className="font-serif font-bold text-[#eacf9b] leading-tight text-sm text-stroke-black drop-shadow-sm">{unit.name}</h3>
                    <p className="text-[9px] text-[#a68a68] uppercase tracking-widest mt-0.5 font-bold">{unit.currentJobId}</p>
                    <div className="flex items-center gap-1 mt-1 font-mono">
                       <span className="text-[9px] px-1 py-0.5 bg-[#0d0805] border border-[#382618] rounded">{unit.affinity.substring(0, 3).toUpperCase()}</span>
                       <span className="text-[9px] px-1 py-0.5 bg-[#0d0805] border border-[#382618] rounded">LV {unit.level}</span>
                    </div>
                    {selectedSlot === idx && (
                       <div className="absolute inset-0 bg-[#0d0805]/95 flex flex-col items-center justify-center gap-2 z-10 p-2">
                         <button 
                           onClick={(e) => { e.stopPropagation(); onRemoveFromParty(idx); setSelectedSlot(null); }}
                           className="w-full py-1.5 bg-[#b53c22] hover:bg-[#d84a2d] border border-[#ea7a5d] text-white text-[10px] font-bold rounded shadow-lg tracking-wider"
                         >
                           REMOVE
                         </button>
                       </div>
                    )}
                 </>
               ) : (
                 <span className="text-xs text-[#5a4227] font-serif font-medium flex flex-col items-center gap-1">
                   {selectedSlot === idx ? 'SELECT ROSTER' : 'EMPTY SLOT'}
                 </span>
               )}
            </div>
          ))}
        </div>

        {/* Bench / Roster */}
        <div className="flex-1 bg-[#1a110a] rounded-sm border-[2px] border-[#382618] flex flex-col overflow-hidden shadow-[inset_0_2px_5px_rgba(0,0,0,0.5)]">
           <div className="p-2 px-3 bg-[#2c1d11] border-b border-[#382618] shadow-sm">
             <h3 className="text-xs font-bold text-[#eacf9b] font-serif tracking-wide">Available Roster ({availableRoster.length})</h3>
             {selectedSlot !== null && <p className="text-[10px] text-[#c79a5d] mt-0.5 font-mono">Select a unit to assign to Slot {selectedSlot + 1}</p>}
           </div>
           <div className="flex-1 overflow-y-auto p-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                 {availableRoster.map(unit => (
                   <div 
                     key={unit.id}
                     className="bg-[#0d0805] border border-[#382618] rounded-sm p-2 hover:border-[#5a4227] transition-colors flex justify-between items-center shadow-sm"
                   >
                      <div className="flex gap-2 items-center">
                        <div className="w-8 h-8 rounded-sm bg-[#1a110a] border border-[#382618] flex items-center justify-center">
                            <span className="text-[10px] text-[#5a4227] font-mono">{unit.affinity.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="flex flex-col">
                          <p className="font-serif font-bold text-sm text-[#eacf9b] leading-tight">{unit.name} <span className="text-[#a68a68] ml-1 text-xs font-mono">LV {unit.level}</span></p>
                          <p className="text-[10px] text-[#a68a68] capitalize font-mono tracking-tighter">{unit.affinity} {unit.currentJobId}</p>
                        </div>
                      </div>
                      
                      {selectedSlot !== null && (
                        <button 
                          onClick={() => { onAssignToParty(unit.id, selectedSlot); setSelectedSlot(null); }}
                          className="p-1 px-3 bg-[#2c1d11] text-[#c79a5d] hover:bg-[#c79a5d] hover:text-[#1a110a] border border-[#5a4227] hover:border-[#eacf9b] rounded-sm transition-all"
                        >
                          <ArrowUpCircle className="w-4 h-4" />
                        </button>
                      )}
                   </div>
                 ))}
                 {availableRoster.length === 0 && (
                   <div className="col-span-full p-8 text-center text-[#5a4227] text-sm font-serif">
                     No available units in roster to swap. Recruit more at the Tavern.
                   </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
