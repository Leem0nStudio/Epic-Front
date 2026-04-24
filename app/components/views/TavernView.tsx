import React from 'react';
import { ChevronLeft, Users, Clock, Info } from 'lucide-react';

interface TavernViewProps {
  saveData: any;
  onNavigate: (view: any) => void;
  onClaim: (slotId: string) => void;
  onDiscard: (slotId: string) => void;
}

export function TavernView({ saveData, onNavigate, onClaim, onDiscard }: TavernViewProps) {
  const [now, setNow] = React.useState(Date.now());

  React.useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate('home')} className="p-2 bg-[#382618] border border-[#5a4227] rounded-full hover:bg-[#4a3423] transition-colors">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-serif font-bold text-[#eacf9b] tracking-wider uppercase">TABERNA</h1>
        </div>
        <div className="flex items-center gap-2 bg-black/40 border border-[#c79a5d] px-3 py-1 rounded-full">
            <span className="text-[10px] text-[#a68a68] font-bold uppercase tracking-tighter">ZENY</span>
            <span className="text-sm font-mono font-bold text-[#eacf9b]">{saveData.profile.currency}</span>
        </div>
      </div>

      {/* Intro Text */}
      <div className="bg-[#2c1d11] border border-[#5a4227] p-4 rounded mb-6 text-sm text-[#a68a68] italic leading-relaxed">
        "Nuevos reclutas llegan cada cierto tiempo buscando gloria. Elige sabiamente, el espacio en el cuartel es limitado."
      </div>

      {/* Recruit Slots */}
      <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar">
        {saveData.tavernSlots.map((slot: any) => {
          const isAvailable = now >= new Date(slot.available_at).getTime();
          const timeLeft = Math.max(0, new Date(slot.available_at).getTime() - now);
          const minutes = Math.floor(timeLeft / 60000);
          const seconds = Math.floor((timeLeft % 60000) / 1000);

          return (
            <div key={slot.id} className={`relative bg-gradient-to-br from-[#35251a] to-[#1a110a] border-[1.5px] rounded p-4 flex flex-col gap-3 transition-all ${isAvailable ? 'border-[#c79a5d] shadow-[0_0_10px_rgba(199,154,93,0.2)]' : 'border-[#382618] opacity-80'}`}>
              
              {!isAvailable && (
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center z-10 backdrop-blur-[1px] rounded">
                   <Clock className="text-[#a68a68] mb-1" size={32} />
                   <span className="text-[#eacf9b] font-mono font-bold text-lg">{minutes}:{seconds.toString().padStart(2, '0')}</span>
                   <span className="text-[10px] text-[#a68a68] uppercase font-bold tracking-widest mt-1">Llegando...</span>
                </div>
              )}

              <div className="flex items-center gap-4">
                 <div className="w-16 h-16 bg-[#1a110a] border border-[#5a4227] rounded overflow-hidden flex items-center justify-center shrink-0">
                    <img src="https://raw.githubusercontent.com/Leem0nGames/gameassets/main/RO/abbys_sprite_001.png" className="w-[200%] max-w-none transform translate-y-2 brightness-90 contrast-125" style={{imageRendering: 'pixelated'}} />
                 </div>
                 <div className="flex-1">
                    <div className="flex items-center justify-between">
                       <span className="font-serif font-bold text-[#f2e6d5] text-lg">{slot.generated_unit_data.name}</span>
                       <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                         slot.generated_unit_data.affinity === 'physical' ? 'bg-[#b53c22]/20 border-[#b53c22] text-[#ea7a5d]' :
                         slot.generated_unit_data.affinity === 'magic' ? 'bg-[#44aaff]/20 border-[#44aaff] text-[#44aaff]' :
                         'bg-[#b59d22]/20 border-[#b59d22] text-[#ead15d]'
                       }`}>
                         {slot.generated_unit_data.affinity}
                       </span>
                    </div>
                    <div className="flex gap-2 mt-2">
                       <div className="flex-1 bg-black/40 rounded px-2 py-1 flex items-center justify-between border border-[#382618]">
                          <span className="text-[9px] text-[#a68a68] font-bold">ATK</span>
                          <span className="text-[11px] text-[#eacf9b] font-mono font-bold">+{slot.generated_unit_data.growthRates.atk}</span>
                       </div>
                       <div className="flex-1 bg-black/40 rounded px-2 py-1 flex items-center justify-between border border-[#382618]">
                          <span className="text-[9px] text-[#a68a68] font-bold">HP</span>
                          <span className="text-[11px] text-[#eacf9b] font-mono font-bold">+{slot.generated_unit_data.growthRates.hp}</span>
                       </div>
                    </div>
                 </div>
              </div>

              {slot.generated_unit_data.trait && (
                <div className="flex items-center gap-2 bg-[#1a110a] p-2 rounded border border-[#382618]">
                  <Info size={14} className="text-[#c79a5d]" />
                  <span className="text-[11px] text-[#a68a68]">Rasgo: <b className="text-[#eacf9b] uppercase">{slot.generated_unit_data.trait}</b></span>
                </div>
              )}

              {isAvailable && (
                <div className="flex gap-2 mt-1">
                  <button onClick={() => onClaim(slot.id)} className="flex-1 bg-gradient-to-b from-[#4a2e1a] to-[#2c1d11] border border-[#c79a5d] text-[#eacf9b] font-bold py-2 rounded active:scale-95 transition-all flex items-center justify-center gap-2 hover:brightness-125">
                    <Users size={16} />
                    <span>RECLUTAR (GRATIS)</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {saveData.tavernSlots.length === 0 && (
           <div className="flex flex-col items-center justify-center py-20 text-[#a68a68]">
              <Users size={48} className="opacity-20 mb-4" />
              <p>No hay reclutas disponibles en este momento.</p>
           </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-4 flex items-center justify-between text-[10px] text-[#a68a68] font-bold tracking-widest bg-[#1a110a] border border-[#382618] p-2 rounded">
         <span>RECURSOS DISPONIBLES</span>
         <span className="text-[#eacf9b]">{saveData.profile.currency} ZENY</span>
      </div>
    </div>
  );
}
