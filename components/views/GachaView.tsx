'use client';

import React, { useState } from 'react';
import { GachaService } from '@/lib/services/gacha-service';
import { ChevronLeft, Diamond, Sparkles, Box, Coins } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GachaViewProps {
  profile: any;
  onNavigate: (view: any) => void;
}

export function GachaView({ profile, onNavigate }: GachaViewProps) {
  const [isPulling, setIsPulling] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);
  const [currencyType, setCurrencyType] = useState<'soft' | 'premium'>('soft');

  const handlePull = async (amount: number) => {
    const cost = amount === 10 ? 9 : amount;
    const price = currencyType === 'premium' ? cost * 50 : cost * 100;
    const balance = currencyType === 'premium' ? profile.premium_currency : profile.currency;
    if (balance < price) { alert("Moneda insuficiente"); return; }
    setIsPulling(true); setResults(null);
    try {
      const rewards = await GachaService.pull(amount, currencyType);
      setResults(rewards);
    } catch (e: any) { alert(e.message || "Error."); } finally { setIsPulling(false); }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'text-[#ffaa00] drop-shadow-[0_0_8px_#ffaa00]';
      case 'epic': return 'text-[#cc44ff] drop-shadow-[0_0_8px_#cc44ff]';
      case 'rare': return 'text-[#44aaff]';
      default: return 'text-[#a68a68]';
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
            <button onClick={() => results ? setResults(null) : onNavigate('home')} className="p-2 bg-[#382618] border border-[#5a4227] rounded-full hover:bg-[#4a3423] transition-colors"><ChevronLeft size={20} /></button>
            <h1 className="text-xl font-serif font-bold text-[#eacf9b] tracking-wider uppercase">Forja</h1>
        </div>
      </div>
      {!results ? (
        <div className="flex-1 flex flex-col gap-6 items-center">
            <div className="w-full flex bg-black/40 rounded-lg p-1 border border-[#382618]">
                <button onClick={() => setCurrencyType('soft')} className={`flex-1 py-2 text-[10px] font-bold uppercase rounded ${currencyType === 'soft' ? 'bg-[#382618] text-[#eacf9b]' : 'text-[#a68a68]'}`}>Zeny</button>
                <button onClick={() => setCurrencyType('premium')} className={`flex-1 py-2 text-[10px] font-bold uppercase rounded ${currencyType === 'premium' ? 'bg-[#c79a5d] text-[#1a110a]' : 'text-[#a68a68]'}`}>Gem</button>
            </div>
            <div className="flex-1 flex flex-col justify-center w-full gap-4">
                 <div className="bg-[#1a110a] border border-[#382618] p-4 rounded-lg flex flex-col items-center">
                    <h4 className="text-[10px] text-[#a68a68] font-bold uppercase mb-2">Probabilidades</h4>
                    <div className="grid grid-cols-4 gap-4 w-full text-center">
                        <div><span className="block text-[#ffaa00] font-mono text-xs">2%</span><span className="text-[8px] text-[#a68a68] uppercase font-bold">LEG</span></div>
                        <div><span className="block text-[#cc44ff] font-mono text-xs">10%</span><span className="text-[8px] text-[#a68a68] uppercase font-bold">EPIC</span></div>
                        <div><span className="block text-[#44aaff] font-mono text-xs">35%</span><span className="text-[8px] text-[#a68a68] uppercase font-bold">RARE</span></div>
                        <div><span className="block text-[#a68a68] font-mono text-xs">53%</span><span className="text-[8px] text-[#a68a68] uppercase font-bold">COM</span></div>
                    </div>
                 </div>
            </div>
            <div className="w-full flex gap-4 p-4 mb-2">
                <button disabled={isPulling} onClick={() => handlePull(1)} className="flex-1 bg-[#1a110a] border border-[#5a4227] p-4 rounded-lg uppercase text-xs font-bold text-[#eacf9b]">x1</button>
                <button disabled={isPulling} onClick={() => handlePull(10)} className="flex-1 bg-[#c79a5d] p-4 rounded-lg uppercase text-xs font-black text-[#1a110a]">x10</button>
            </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-5 gap-3 p-2 overflow-y-auto">
                <AnimatePresence>
                    {results.map((item, idx) => (
                        <motion.div key={idx} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#2c1d11] border border-[#5a4227] p-2 rounded flex flex-col items-center gap-2 text-center">
                            <span className="text-[9px] font-bold text-[#f2e6d5] uppercase leading-tight">{item.item_name}</span>
                            <span className={`text-[8px] font-bold uppercase ${getRarityColor(item.item_rarity)}`}>{item.item_rarity}</span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
            <button onClick={() => setResults(null)} className="mt-6 w-full bg-[#382618] py-4 rounded text-[#eacf9b] font-bold uppercase">Confirmar</button>
        </div>
      )}
      {isPulling && <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"><h3 className="text-xl font-serif font-bold text-[#eacf9b] animate-pulse">FORJANDO...</h3></div>}
    </div>
  );
}
