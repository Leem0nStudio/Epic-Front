import React, { useState } from 'react';
import { PlayerSaveData } from '@/lib/rpg-system/player-onboarding';
import { Users, Clock, Check, X, ArrowLeft } from 'lucide-react';
import { TavernQueueSlot } from '@/lib/rpg-system/recruitment';

interface TavernViewProps {
  saveData: PlayerSaveData;
  onNavigate: (view: 'home') => void;
  onClaim: (queueId: string) => void;
  onDiscard: (queueId: string) => void;
}

export function TavernView({ saveData, onNavigate, onClaim, onDiscard }: TavernViewProps) {
  const [now, setNow] = useState<number>(() => Date.now());

  // Tick time to avoid impure render function
  React.useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 10000); // update every 10s roughly
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#0d0805] bg-[url('https://www.transparenttextures.com/patterns/dark-wood.png')] text-[#f2e6d5]">
      <div className="flex items-center p-3 bg-[#1a110a] border-b border-[#382618] shrink-0">
        <button onClick={() => onNavigate('home')} className="p-2 mr-3 hover:bg-[#382618]/50 rounded-md transition-colors">
          <ArrowLeft className="w-5 h-5 text-[#a68a68]" />
        </button>
        <div className="flex flex-col">
          <h1 className="text-xl font-bold flex items-center gap-2 font-serif"><Users className="w-5 h-5 text-[#c79a5d]"/> The Tavern</h1>
          <p className="text-xs text-[#a68a68]">Recruit wandering adventurers to join your roster.</p>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {saveData.tavernQueue.map((slot) => {
          const isReady = now >= slot.availableAtTimestamp;
          const timeRemainingMs = slot.availableAtTimestamp - now;
          const minutesLeft = Math.ceil(timeRemainingMs / 60000);

          return (
            <div key={slot.queueId} className="bg-[#1a110a] border border-[#382618] rounded-sm p-4 flex items-center justify-between shadow-[inset_0_2px_5px_rgba(0,0,0,0.5)]">
              
              <div className="flex-1">
                {isReady && slot.generatedUnit ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-lg text-[#eacf9b] font-serif">{slot.generatedUnit.name}</span>
                      <span className="px-2 py-0.5 bg-[#0d0805] border border-[#382618] rounded text-xs text-[#a68a68] capitalize font-mono">{slot.generatedUnit.affinity}</span>
                      {slot.generatedUnit.trait && (
                         <span className="px-2 py-0.5 bg-[#c79a5d]/20 text-[#c79a5d] border border-[#c79a5d]/50 rounded text-xs capitalize font-serif">
                           {slot.generatedUnit.trait}
                         </span>
                      )}
                    </div>
                    <div className="text-xs text-[#a68a68] flex gap-4 font-mono">
                       <span>HP: {slot.generatedUnit.baseStats.hp}</span>
                       <span>ATK: {slot.generatedUnit.baseStats.atk}</span>
                       <span>MATK: {slot.generatedUnit.baseStats.matk}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-[#a68a68]">
                    <Clock className="w-5 h-5 text-[#5a4227]" />
                    <span>Searching for adventurers...</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {isReady ? (
                  <>
                    <button 
                      onClick={() => onClaim(slot.queueId)}
                      className="flex items-center gap-1 px-4 py-2 bg-[#4a7c59] hover:bg-[#5a8c69] border border-[#6a9c79] text-white text-sm font-medium rounded-sm shadow-lg transition-colors font-serif"
                    >
                      <Check className="w-4 h-4"/> Recruit
                    </button>
                    <button 
                      onClick={() => onDiscard(slot.queueId)}
                      className="p-2 bg-[#1a110a] border border-[#382618] hover:bg-[#b53c22]/50 text-[#a68a68] hover:text-[#d84a2d] rounded-sm transition-colors"
                      title="Discard and restart search"
                    >
                      <X className="w-4 h-4"/>
                    </button>
                  </>
                ) : (
                  <div className="px-3 py-1 bg-[#0d0805] border border-[#382618] rounded-full font-mono text-xs text-[#5a4227] shadow-inner">
                    {minutesLeft}m left
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
