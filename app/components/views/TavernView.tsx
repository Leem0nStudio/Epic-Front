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
    <div className="flex flex-col h-full bg-slate-900 text-slate-200">
      <div className="flex items-center p-4 bg-slate-800 border-b border-slate-700">
        <button onClick={() => onNavigate('home')} className="p-2 mr-3 hover:bg-slate-700 rounded-md transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-300" />
        </button>
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2"><Users className="w-5 h-5 text-emerald-400"/> The Tavern</h1>
          <p className="text-xs text-slate-400">Recruit wandering adventurers to join your roster.</p>
        </div>
      </div>

      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        {saveData.tavernQueue.map((slot) => {
          const isReady = now >= slot.availableAtTimestamp;
          const timeRemainingMs = slot.availableAtTimestamp - now;
          const minutesLeft = Math.ceil(timeRemainingMs / 60000);

          return (
            <div key={slot.queueId} className="bg-slate-800 border border-slate-700 rounded-lg p-4 flex items-center justify-between">
              
              <div className="flex-1">
                {isReady && slot.generatedUnit ? (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-lg text-emerald-300">{slot.generatedUnit.name}</span>
                      <span className="px-2 py-0.5 bg-slate-700 rounded text-xs text-slate-300 capitalize">{slot.generatedUnit.affinity}</span>
                      {slot.generatedUnit.trait && (
                         <span className="px-2 py-0.5 bg-amber-900/50 text-amber-400 border border-amber-800/50 rounded text-xs capitalize">
                           {slot.generatedUnit.trait}
                         </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400 flex gap-4 font-mono">
                       <span>HP: {slot.generatedUnit.baseStats.hp}</span>
                       <span>ATK: {slot.generatedUnit.baseStats.atk}</span>
                       <span>MATK: {slot.generatedUnit.baseStats.matk}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-slate-400">
                    <Clock className="w-5 h-5 text-slate-500" />
                    <span>Searching for adventurers...</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {isReady ? (
                  <>
                    <button 
                      onClick={() => onClaim(slot.queueId)}
                      className="flex items-center gap-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-md transition-colors"
                    >
                      <Check className="w-4 h-4"/> Recruit
                    </button>
                    <button 
                      onClick={() => onDiscard(slot.queueId)}
                      className="p-2 bg-slate-700 hover:bg-red-900/50 text-slate-300 hover:text-red-400 rounded-md transition-colors"
                      title="Discard and restart search"
                    >
                      <X className="w-4 h-4"/>
                    </button>
                  </>
                ) : (
                  <div className="px-3 py-1 bg-slate-900 rounded-full font-mono text-xs text-slate-500 border border-slate-800">
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
