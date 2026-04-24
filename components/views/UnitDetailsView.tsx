'use client';

import React, { useState, useEffect } from 'react';
import { UnitService } from '@/lib/services/unit-service';
import { EquipmentService } from '@/lib/services/equipment-service';
import { ChevronLeft, Sword, Shield, Zap, Heart, Sparkles, Box, Plus, X, ArrowUpCircle, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface UnitDetailsViewProps {
  unitId: string;
  onNavigate: (view: any) => void;
  onUpdate: () => void;
  onOpenInventory: (slot: 'weapon' | 'card' | 'skill') => void;
}

export function UnitDetailsView({ unitId, onNavigate, onUpdate, onOpenInventory }: UnitDetailsViewProps) {
  const [data, setData] = useState<any>(null);
  const [isEvolving, setIsEvolving] = useState(false);
  const [evolvedJobName, setEvolvedJobName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [unitId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const details = await UnitService.getUnitDetails(unitId);
      setData(details);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleEvolve = async (targetJobId: string, jobName: string) => {
    setIsEvolving(true);
    try {
      await UnitService.evolveUnit(unitId, targetJobId);
      setEvolvedJobName(jobName);
      onUpdate();
      await loadData();
    } catch (e: any) { alert(e.message); } finally { setIsEvolving(false); }
  };

  const handleUnequip = async (itemId: string, slot: any) => {
    try {
      await EquipmentService.unequipItem(unitId, itemId, slot);
      onUpdate();
      await loadData();
    } catch (e: any) { alert(e.message); }
  };

  if (loading || !data) return (<div className="flex-1 flex items-center justify-center"><div className="w-10 h-10 border-4 border-t-[#c79a5d] border-[#382618] rounded-full animate-spin"></div></div>);

  const { unit, job, weapon, cards, skills, finalStats } = data;

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300 overflow-y-auto custom-scrollbar pr-1 overflow-x-hidden p-1">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate('party')} className="p-2 bg-[#382618] border border-[#5a4227] rounded-full"><ChevronLeft size={20} /></button>
          <h1 className="text-xl font-serif font-black text-[#eacf9b] tracking-wider uppercase">{unit.name}</h1>
        </div>
      </div>
      <div className="relative w-full aspect-video bg-[#0d0805] rounded-xl border-2 border-[#5a4227] overflow-hidden mb-6 flex items-center justify-center shadow-2xl">
         <img src="https://raw.githubusercontent.com/Leem0nGames/gameassets/main/RO/abbys_sprite_001.png" className="w-[120%] transform translate-y-8 brightness-110" style={{imageRendering: 'pixelated'}} />
         <div className="absolute top-4 left-4 flex flex-col gap-1"><span className="bg-[#b53c22] text-white text-[10px] font-black px-2 py-0.5 rounded border border-[#ea7a5d] shadow-lg">LV. {unit.level}</span><span className="bg-[#1a110a]/80 text-[#eacf9b] text-[10px] font-black px-2 py-0.5 rounded border border-[#382618] uppercase">{job.name}</span></div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-6">
         {[{ label: 'HP', val: finalStats.hp, icon: Heart, color: 'text-[#ea7a5d]' }, { label: 'ATK', val: finalStats.atk, icon: Sword, color: 'text-[#ead15d]' }, { label: 'DEF', val: finalStats.def, icon: Shield, color: 'text-[#a68a68]' }, { label: 'SPD', val: finalStats.agi, icon: Zap, color: 'text-[#44aaff]' }].map((stat) => (
           <div key={stat.label} className="bg-[#1a110a] border-2 border-[#382618] p-3 rounded-xl flex items-center justify-between shadow-inner"><div className="flex items-center gap-2"><stat.icon size={16} className={stat.color} /><span className="text-[9px] font-black text-[#a68a68] uppercase">{stat.label}</span></div><span className="text-sm font-mono font-black text-[#eacf9b]">{stat.val}</span></div>
         ))}
      </div>
      <div className="mb-6">
         <h3 className="text-[10px] font-black text-[#a68a68] tracking-[0.2em] uppercase mb-4 flex items-center gap-2"><Briefcase size={14} className="text-[#c79a5d]" /> Arsenal</h3>
         <div className="grid grid-cols-5 gap-2">
            <div onClick={() => !weapon && onOpenInventory('weapon')} className={`aspect-square rounded-xl border-2 border-[#382618] flex items-center justify-center relative ${weapon ? 'bg-[#2c1d11]' : 'bg-black/40'}`}>
               {weapon ? (<><Sword size={24} className="text-[#eacf9b]" /><button onClick={(e) => { e.stopPropagation(); handleUnequip(weapon.id, 'weapon'); }} className="absolute -top-2 -right-2 bg-[#b53c22] rounded-full p-1 border border-[#ea7a5d] shadow-lg"><X size={10} /></button></>) : <Plus size={20} className="text-[#382618]" />}
            </div>
            {[0, 1, 2, 3].map(idx => { const card = cards[idx]; return (<div key={idx} onClick={() => !card && onOpenInventory('card')} className={`aspect-square rounded-xl border-2 border-[#382618] flex items-center justify-center relative ${card ? 'bg-[#2c1d11]' : 'bg-black/40'}`}>{card ? (<><Sparkles size={24} className="text-[#cc44ff]" /><button onClick={(e) => { e.stopPropagation(); handleUnequip(card.id, 'card'); }} className="absolute -top-2 -right-2 bg-[#b53c22] rounded-full p-1 border border-[#ea7a5d] shadow-lg"><X size={10} /></button></>) : <Plus size={20} className="text-[#382618]" />}</div>); })}
         </div>
      </div>
      <div className="mb-6">
         <h3 className="text-[10px] font-black text-[#a68a68] tracking-[0.2em] uppercase mb-4 flex items-center gap-2"><Zap size={14} className="text-[#c79a5d]" /> Técnicas</h3>
         <div className="grid grid-cols-5 gap-2">
            {[0, 1, 2, 3, 4].map(idx => { const skill = skills[idx]; const limit = job.tier === 0 ? 1 : job.tier === 1 ? 2 : job.tier === 2 ? 3 : 5; const isLocked = idx >= limit; return (<div key={idx} onClick={() => !isLocked && !skill && onOpenInventory('skill')} className={`aspect-square rounded-xl border-2 border-[#382618] flex items-center justify-center relative ${isLocked ? 'bg-black opacity-30 cursor-not-allowed' : 'cursor-pointer'} ${skill ? 'bg-[#2c1d11]' : 'bg-black/40'}`}>{skill ? (<><Box size={24} className="text-[#44aaff]" /><button onClick={(e) => { e.stopPropagation(); handleUnequip(skill.id, 'skill'); }} className="absolute -top-2 -right-2 bg-[#b53c22] rounded-full p-1 border border-[#ea7a5d] shadow-lg"><X size={10} /></button></>) : isLocked ? <Box size={16} className="text-[#382618]" /> : <Plus size={20} className="text-[#382618]" />}</div>); })}
         </div>
      </div>
      <div className="mb-6">
         <h3 className="text-[10px] font-black text-[#a68a68] tracking-[0.2em] uppercase mb-4 flex items-center gap-2"><ArrowUpCircle size={14} className="text-[#c79a5d]" /> Evolución</h3>
         <div className="flex flex-col gap-3">
            {job.tier < 3 ? (<div className="grid grid-cols-1 gap-2">
                 {job.id === 'novice' && (<div className="grid grid-cols-2 gap-3"><button onClick={() => handleEvolve('swordman', 'Swordman')} className="bg-[#1a110a] border-2 border-[#5a4227] p-4 rounded-xl text-center uppercase font-black text-xs text-[#eacf9b]">Swordman</button><button onClick={() => handleEvolve('mage', 'Mage')} className="bg-[#1a110a] border-2 border-[#5a4227] p-4 rounded-xl text-center uppercase font-black text-xs text-[#eacf9b]">Mage</button></div>)}
                 {job.id === 'swordman' && (<div className="grid grid-cols-2 gap-3"><button onClick={() => handleEvolve('knight', 'Knight')} className="bg-[#1a110a] border-2 border-[#5a4227] p-4 rounded-xl text-center uppercase font-black text-xs text-[#eacf9b]">Knight</button><button onClick={() => handleEvolve('crusader', 'Crusader')} className="bg-[#1a110a] border-2 border-[#5a4227] p-4 rounded-xl text-center uppercase font-black text-xs text-[#eacf9b]">Crusader</button></div>)}
                 {job.id === 'mage' && (<button onClick={() => handleEvolve('wizard', 'Wizard')} className="w-full bg-[#1a110a] border-2 border-[#5a4227] p-4 rounded-xl text-center uppercase font-black text-xs text-[#eacf9b]">Wizard</button>)}
                 {job.id === 'knight' && (<button onClick={() => handleEvolve('rune_knight', 'Rune Knight')} className="w-full bg-[#1a110a] border-2 border-[#5a4227] p-4 rounded-xl text-center uppercase font-black text-xs text-[#eacf9b]">Rune Knight</button>)}
              </div>) : (<div className="bg-black/40 border-2 border-[#382618] p-6 rounded-xl text-center"><p className="text-[10px] text-[#a68a68] font-black uppercase tracking-[0.2em]">Maestría Alcanzada</p></div>)}
         </div>
      </div>
      <AnimatePresence>{evolvedJobName && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-8 text-center"><motion.div initial={{ scale: 0.5, y: 20 }} animate={{ scale: 1, y: 0 }} className="flex flex-col items-center gap-8"><Sparkles size={120} className="text-[#ffaa00] animate-pulse" /><h2 className="text-3xl font-serif font-black text-[#eacf9b] tracking-[0.3em] uppercase">Evolución</h2><p className="text-[#ffaa00] tracking-[0.4em] text-2xl font-black">{evolvedJobName}</p><button onClick={() => setEvolvedJobName(null)} className="mt-8 bg-gradient-to-b from-[#c79a5d] to-[#8c5a2b] text-[#1a110a] font-black py-4 px-16 rounded-xl uppercase shadow-lg">Continuar</button></motion.div></motion.div>)}</AnimatePresence>
    </div>
  );
}
