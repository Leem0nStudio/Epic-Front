import React, { useState } from 'react';
import { Diamond, Sparkles, Star } from 'lucide-react';
import { CharacterData } from '@/lib/types';
import { CHARACTERS } from '@/lib/mock-data';

export function SummoningScreenView() {
  const [summoningState, setSummoningState] = useState<'idle' | 'summoning' | 'result'>('idle');
  const [resultChar, setResultChar] = useState<CharacterData | null>(null);
  const [isConsuming, setIsConsuming] = useState(false);

  const handleSummon = () => {
    setIsConsuming(true);
    setTimeout(() => {
      const charOptions = [CHARACTERS[0], CHARACTERS[1], CHARACTERS[2], CHARACTERS[3], CHARACTERS[4]];
      const rngChar = charOptions[Math.floor(Math.random() * charOptions.length)];
      setResultChar(rngChar);
      setSummoningState('summoning');
      setIsConsuming(false);

      setTimeout(() => {
         setSummoningState('result');
      }, 2500);
    }, 400); // 400ms delay to show the gem animation
  };

  const getRarityGateColors = (rarity: number) => {
    if (rarity <= 3) return { bg: 'bg-[#a3c2e0]', glow: 'shadow-[0_0_50px_20px_rgba(163,194,224,0.8)]', inner: 'fill-[#5a8cd9] text-[#2c4e85]', rays: 'from-transparent via-[#a3c2e0] to-transparent', ring: 'border-[#5a8cd9]', shadowRaw: '#a3c2e0' };
    if (rarity <= 5) return { bg: 'bg-[#ffcc00]', glow: 'shadow-[0_0_50px_20px_rgba(255,215,0,0.8)]', inner: 'fill-[#ff9900] text-[#cc3300]', rays: 'from-transparent via-[#ffcc00] to-transparent', ring: 'border-[#ffcc00]', shadowRaw: '#ffcc00' };
    return { bg: 'bg-[#ff0055]', glow: 'shadow-[0_0_50px_20px_rgba(255,0,85,0.8)]', inner: 'fill-[#ff00ff] text-[#550000]', rays: 'from-transparent via-[#ff0055] to-transparent', ring: 'border-[#ff0055]', shadowRaw: '#ff0055' };
  };

  const rarityColors = resultChar ? getRarityGateColors(resultChar.rarity) : getRarityGateColors(3);

  const resetSummon = () => {
    setSummoningState('idle');
    setResultChar(null);
  };

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center relative animate-in fade-in duration-300">
      
      {/* Banner / Title */}
      {summoningState === 'idle' && (
      <div className="absolute top-0 w-full mb-4">
         <div className="relative w-full h-[40px] bg-gradient-to-r from-[#4a2e1a] via-[#5c3a21] to-[#4a2e1a] border-[2px] border-[#c79a5d] rounded-[4px] shadow-[0_4px_10px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\\'20\\' height=\\'20\\' viewBox=\\'0 0 20 20\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cpath d=\\'M0 0h20v20H0V0zm10 10l10-10H0l10 10zm0 10L0 10v10h20V10L10 20z\\' fill=\\'%23000\\' fill-opacity=\\'0.1\\' fill-rule=\\'evenodd\\'/%3E%3C/svg%3E')]"></div>
            <div className="absolute top-0 w-[90%] h-[1px] bg-white opacity-30 mt-[1px]"></div>
            <span className="font-serif font-bold text-[#f2e6d5] text-stroke-black text-[18px] tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,1)] z-10">
               RARE SUMMON
            </span>
         </div>
      </div>
      )}

      {summoningState === 'idle' && (
        <div className="flex flex-col items-center w-full max-w-[300px] gap-6 px-4 mt-8">
           <div className="relative w-full aspect-square border-[3px] border-[#c79a5d] rounded-full shadow-[0_0_30px_rgba(255,215,0,0.3),inset_0_0_30px_rgba(0,0,0,0.8)] overflow-hidden flex items-center justify-center bg-gradient-to-b from-[#2a1a0c] to-[#0a0502]">
             <div className="absolute inset-0 border-[4px] border-[#5a4227] rounded-full opacity-50 m-2 border-dashed animate-[spin_20s_linear_infinite]"></div>
             <div className="absolute inset-0 border-[2px] border-[#f2e6d5] shadow-[0_0_10px_white] rounded-full opacity-20 m-6 animate-[spin_15s_linear_infinite_reverse]"></div>
             
             <div className="z-10 flex flex-col items-center">
                 <Diamond size={60} className={`fill-[#00ffcc] text-[#00ffcc] filter transition-all duration-300 ease-in-out ${isConsuming ? 'scale-[0.2] opacity-0 -translate-y-4 brightness-200 drop-shadow-[0_0_30px_rgba(0,255,204,1)]' : 'drop-shadow-[0_0_15px_rgba(0,255,204,0.8)] animate-pulse'}`} />
                 <span className={`mt-2 text-white font-bold text-stroke-black text-[14px] transition-all duration-300 ${isConsuming ? 'opacity-0 scale-90' : 'opacity-100'}`}>5 Gems</span>
             </div>
           </div>

           <button 
             onClick={handleSummon}
             disabled={isConsuming}
             className={`w-full relative overflow-hidden bg-gradient-to-b from-[#ffcc00] via-[#ff9900] to-[#cc3300] border-[2px] border-[#ffea99] rounded-[4px] py-3 flex items-center justify-center shadow-[0_6px_15px_rgba(200,80,0,0.6),inset_0_2px_5px_rgba(255,255,255,0.7)] group transition-all duration-200 ${isConsuming ? 'brightness-75 scale-95 pointer-events-none' : 'hover:brightness-110 active:scale-95'}`}
           >
              <div className="absolute top-0 w-full h-[30%] bg-gradient-to-b from-white to-transparent opacity-30"></div>
              <span className="font-serif font-black text-white text-[20px] text-stroke-sm drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] z-10 group-hover:drop-shadow-[0_0_10px_white]">
                 SUMMON NOW
              </span>
           </button>
        </div>
      )}

      {summoningState === 'summoning' && (
        <div className="flex flex-col items-center justify-center w-full h-full relative z-20">
          <div className="absolute inset-0 bg-white animate-in mix-blend-overlay opacity-20 duration-[2500ms] ease-out fade-in"></div>
          <div className="relative">
             <div className={`w-[120px] h-[120px] rounded-full opacity-30 animate-ping absolute -left-[20px] -top-[20px] filter blur-xl ${rarityColors.bg}`}></div>
             <div className={`w-[80px] h-[80px] rounded-full bg-white opacity-90 animate-pulse flex items-center justify-center relative z-10 ${rarityColors.glow}`}>
                <Sparkles size={40} className={`animate-spin ${rarityColors.inner}`} />
             </div>
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[2px] h-[200vh] bg-white opacity-50 rotate-45 mix-blend-overlay"></div>
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200vh] h-[2px] bg-white opacity-50 rotate-45 mix-blend-overlay"></div>
          </div>
          <span className="mt-8 font-serif font-bold text-white text-[24px] text-stroke-sm tracking-widest animate-pulse z-10 drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">
            CONNECTING...
          </span>
        </div>
      )}

      {summoningState === 'result' && resultChar && (
        <div className="flex flex-col items-center justify-between w-full h-full relative pt-12 pb-6 animate-in zoom-in-95 duration-500">
           {/* Epic Rays background effect */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] max-h-[800px] max-w-[800px] flex items-center justify-center pointer-events-none opacity-60 mix-blend-screen overflow-hidden z-0">
             <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(${rarityColors.shadowRaw === '#a3c2e0' ? '163,194,224' : rarityColors.shadowRaw === '#ffcc00' ? '255,215,0' : '255,0,85'},0.3)_0%,transparent_60%)]`}></div>
             <div className="w-full h-full animate-[spin_30s_linear_infinite] relative flex items-center justify-center">
               {[...Array(12)].map((_, i) => (
                  <div key={i} className={`absolute w-[4px] h-[100%] bg-gradient-to-b ${rarityColors.rays}`} style={{ transform: `rotate(${i * 15}deg)` }}></div>
               ))}
             </div>
           </div>

           {/* Stars */}
           <div className={`relative z-20 flex gap-1 drop-shadow-[0_2px_4px_rgba(0,0,0,1)] bg-black/30 px-6 py-2 rounded-full border border-white/10 mt-4 ${rarityColors.shadowRaw === '#ff0055' ? 'animate-pulse' : ''}`}>
               {[...Array(resultChar.rarity)].map((_, i) => <Star key={i} size={32} className={`fill-[${rarityColors.shadowRaw}] text-[${rarityColors.shadowRaw}] animate-[pulse_2s_ease-in-out_infinite]`} style={{ animationDelay: `${i * 0.2}s` }} />)}
           </div>
           
           {/* Sprite container */}
           <div className="flex-1 w-full relative flex items-center justify-center z-10 my-6">
              {/* Pedestal Shadow under the character */}
              <div className="absolute bottom-[-10px] w-[60%] h-[40px] bg-black opacity-80 rounded-[100%] blur-[10px] z-0"></div>
              {/* Magic circle below character */}
              <div 
                className={`absolute bottom-[-30px] w-[80%] h-[80px] border-[4px] border-dashed rounded-[100%] opacity-40 animate-[spin_10s_linear_infinite] z-0 ${rarityColors.ring} ${rarityColors.glow}`} 
                style={{ transform: 'rotateX(70deg)' }}
              ></div>

              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resultChar.spriteUrl}
                alt={resultChar.name}
                className="object-contain w-[90%] max-h-[300px] sm:max-h-[350px] relative z-10 pointer-events-none filter drop-shadow-[0_15px_15px_rgba(0,0,0,0.8)] animate-[bounce_3s_ease-in-out_infinite]"
                style={{ imageRendering: 'pixelated', filter: resultChar.cssFilter }}
              />
           </div>

           {/* Name Banner */}
           <div className={`relative z-20 flex flex-col items-center w-[90%] bg-black/40 p-4 rounded-xl border-[2px] shadow-[0_4px_15px_rgba(0,0,0,0.8),inset_0_0_15px_rgba(${rarityColors.shadowRaw === '#a3c2e0' ? '163,194,224' : rarityColors.shadowRaw === '#ffcc00' ? '255,215,0' : '255,0,85'},0.2)] ${rarityColors.ring}`}>
              <span className="font-serif font-black text-[#f2e6d5] text-[32px] sm:text-[38px] leading-none drop-shadow-[0_4px_4px_rgba(0,0,0,1)] text-center text-stroke-md uppercase tracking-wider mb-1">
                 {resultChar.name}
              </span>
              <div className={`w-[80%] bg-gradient-to-r ${rarityColors.rays} h-[2px] opacity-80 my-1`}></div>
              <span className="text-white text-[14px] sm:text-[16px] font-bold tracking-[0.2em] uppercase drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">
                 {resultChar.title}
              </span>

              <div className="mt-4 w-full flex justify-center pt-2 border-t border-[rgba(255,255,255,0.1)] gap-4">
                <div className="flex flex-col items-center">
                  <span className="text-[#a3c2e0] text-[10px] font-bold uppercase tracking-widest">Type</span>
                  <span className="text-white text-[13px] font-bold capitalize">Oracle</span>
                </div>
                <div className="w-[1px] h-full bg-[rgba(255,255,255,0.2)]"></div>
                <div className="flex flex-col items-center">
                  <span className="text-[#a3c2e0] text-[10px] font-bold uppercase tracking-widest">Element</span>
                  <span className={`text-[13px] font-bold drop-shadow-[0_1px_1px_rgba(0,0,0,1)]
                    ${resultChar.element === 'Fire' ? 'text-[#ff5500]' :
                      resultChar.element === 'Water' ? 'text-[#00ccff]' :
                      resultChar.element === 'Earth' ? 'text-[#55ff00]' :
                      resultChar.element === 'Thunder' ? 'text-[#ffeb3b]' : 'text-[#cc00ff]'}`}
                  >{resultChar.element}</span>
                </div>
              </div>
           </div>

           <button 
             onClick={resetSummon}
             className="relative z-20 mt-6 bg-[#1a110a] border-[2px] border-[#c79a5d] rounded px-6 py-2 shadow-[0_4px_10px_rgba(0,0,0,0.8)] hover:bg-[#2a1b12] active:scale-95 transition-all text-white font-serif font-bold tracking-widest text-[14px]"
           >
              CONTINUE
           </button>
        </div>
      )}
    </div>
  );
}