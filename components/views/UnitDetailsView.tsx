'use client';

import React, { useState, useEffect } from 'react';
import { UnitService } from '@/lib/services/unit-service';
import { EquipmentService } from '@/lib/services/equipment-service';
import {
  ChevronLeft,
  Sword,
  Shield,
  Zap,
  Heart,
  Sparkles,
  Box,
  Plus,
  X,
  ArrowUpCircle,
  Briefcase,
  ShieldAlert,
  Star,
  Trash2
} from 'lucide-react';
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
  const [nextJobs, setNextJobs] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [unitId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const details = await UnitService.getUnitDetails(unitId);
      setData(details);

      // Dynamic evolution paths
      if (details.job) {
        const paths = await UnitService.getNextJobs(details.job.id);
        setNextJobs(paths);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleEvolve = async (targetJobId: string, jobName: string) => {
    setIsEvolving(true);
    try {
      await UnitService.evolveUnit(unitId, targetJobId);
      setEvolvedJobName(jobName);
      onUpdate();
      await loadData();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsEvolving(false);
    }
  };

  const handleUnequip = async (itemId: string, slot: any) => {
    try {
      await EquipmentService.unequipItem(unitId, itemId, slot);
      onUpdate();
      await loadData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleRelease = async () => {
    if (!confirm("¿Seguro que deseas liberar a esta unidad? Esta acción es permanente.")) return;
    try {
      await UnitService.releaseUnit(unitId);
      onUpdate();
      onNavigate('party');
    } catch (e: any) {
      alert(e.message);
    }
  };

  if (loading || !data) return (
    <div className="flex-1 flex items-center justify-center bg-[#0B1A2A]">
      <div className="w-10 h-10 border-2 border-t-[#F5C76B] border-white/5 rounded-full animate-spin"></div>
    </div>
  );

  const { unit, job, weapon, cards, skills, finalStats } = data;

  return (
    <div className="flex flex-col h-full bg-[#0B1A2A] overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 via-transparent to-transparent pointer-events-none" />

      {/* Header */}
      <div className="p-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => onNavigate('party')} className="p-2 bg-black/40 border border-white/10 rounded-xl text-white/60 hover:text-white transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div className="flex flex-col">
            <h1 className="text-lg font-black text-white tracking-widest uppercase italic">{unit.name}</h1>
            <span className="text-[10px] font-black text-[#F5C76B] tracking-widest uppercase opacity-60">{job.name}</span>
          </div>
        </div>
        <button
          onClick={handleRelease}
          className="p-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 hover:bg-red-500/20 transition-colors"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar pb-10">
        {/* Character Display */}
        <div className="relative w-full aspect-[4/3] bg-black/40 rounded-3xl border border-white/5 overflow-hidden flex items-center justify-center shadow-2xl">
           <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 to-transparent" />
           <motion.img
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            src="https://raw.githubusercontent.com/Leem0nGames/gameassets/main/RO/abbys_sprite_001.png"
            className="w-[110%] transform translate-y-12 brightness-110 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]"
            style={{imageRendering: 'pixelated'}}
           />
           <div className="absolute top-4 left-4 flex flex-col gap-2">
              <span className="bg-[#F5C76B] text-black text-[10px] font-black px-2 py-0.5 rounded-sm italic shadow-lg">LV. {unit.level}</span>
              <div className="w-24 h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/5">
                 <div className="h-full bg-[#F5C76B] w-2/3" />
              </div>
           </div>

           <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-full border border-white/5">
              <Star size={12} fill="#F5C76B" className="text-[#F5C76B]" />
              <span className="text-[9px] font-black text-white/80 uppercase">RANGO UR</span>
           </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-3">
           {[
             { label: 'HP', val: finalStats.hp, icon: Heart, color: 'text-red-400' },
             { label: 'ATK', val: finalStats.atk, icon: Sword, color: 'text-[#F5C76B]' },
             { label: 'DEF', val: finalStats.def, icon: Shield, color: 'text-white/40' },
             { label: 'SPD', val: finalStats.agi, icon: Zap, color: 'text-cyan-400' }
           ].map((stat) => (
             <div key={stat.label} className="bg-black/40 border border-white/5 p-3 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-inner">
               <stat.icon size={14} className={stat.color} />
               <span className="text-[14px] font-black text-white">{stat.val}</span>
               <span className="text-[7px] font-black text-white/40 uppercase tracking-tighter">{stat.label}</span>
             </div>
           ))}
        </div>

        {/* Arsenal */}
        <div className="space-y-4">
           <h3 className="text-[10px] font-black text-white/40 tracking-[0.3em] uppercase flex items-center gap-2">
            <Briefcase size={12} className="text-[#F5C76B]" /> Arsenal de Combate
           </h3>
           <div className="grid grid-cols-5 gap-3">
              <motion.div
                whileTap={{ scale: 0.9 }}
                onClick={() => !weapon && onOpenInventory('weapon')}
                className={`aspect-square rounded-2xl border border-white/10 flex items-center justify-center relative group transition-all ${weapon ? 'bg-[#F5C76B]/10 border-[#F5C76B]/30 shadow-[0_0_15px_rgba(245,199,107,0.1)]' : 'bg-black/40 hover:border-white/20'}`}
              >
                 {weapon ? (
                   <>
                    <Sword size={24} className="text-[#F5C76B]" />
                    <button onClick={(e) => { e.stopPropagation(); handleUnequip(weapon.id, 'weapon'); }} className="absolute -top-1.5 -right-1.5 bg-red-500 rounded-full p-1 border border-white/20 shadow-lg text-white">
                      <X size={8} />
                    </button>
                   </>
                 ) : <Plus size={18} className="text-white/10 group-hover:text-white/20" />}
              </motion.div>
              {[0, 1, 2, 3].map(idx => {
                const card = cards[idx];
                return (
                  <motion.div
                    key={idx}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => !card && onOpenInventory('card')}
                    className={`aspect-square rounded-2xl border border-white/10 flex items-center justify-center relative group transition-all ${card ? 'bg-purple-500/10 border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.1)]' : 'bg-black/40 hover:border-white/20'}`}
                  >
                    {card ? (
                      <>
                        <Sparkles size={24} className="text-purple-400" />
                        <button onClick={(e) => { e.stopPropagation(); handleUnequip(card.id, 'card'); }} className="absolute -top-1.5 -right-1.5 bg-red-500 rounded-full p-1 border border-white/20 shadow-lg text-white">
                          <X size={8} />
                        </button>
                      </>
                    ) : <Plus size={18} className="text-white/10 group-hover:text-white/20" />}
                  </motion.div>
                );
              })}
           </div>
        </div>

        {/* Techniques */}
        <div className="space-y-4">
           <h3 className="text-[10px] font-black text-white/40 tracking-[0.3em] uppercase flex items-center gap-2">
            <Zap size={12} className="text-[#F5C76B]" /> Técnicas Especiales
           </h3>
           <div className="grid grid-cols-5 gap-3">
              {[0, 1, 2, 3, 4].map(idx => {
                const skill = skills[idx];
                const limit = job.tier === 0 ? 1 : job.tier === 1 ? 2 : job.tier === 2 ? 3 : 5;
                const isLocked = idx >= limit;
                return (
                  <motion.div
                    key={idx}
                    whileTap={{ scale: isLocked ? 1 : 0.9 }}
                    onClick={() => !isLocked && !skill && onOpenInventory('skill')}
                    className={`aspect-square rounded-2xl border border-white/10 flex items-center justify-center relative group transition-all ${isLocked ? 'bg-black/80 opacity-20' : skill ? 'bg-cyan-500/10 border-cyan-500/30 shadow-[0_0_15px_rgba(34,211,238,0.1)]' : 'bg-black/40 hover:border-white/20'}`}
                  >
                    {skill ? (
                      <>
                        <Box size={24} className="text-cyan-400" />
                        <button onClick={(e) => { e.stopPropagation(); handleUnequip(skill.id, 'skill'); }} className="absolute -top-1.5 -right-1.5 bg-red-500 rounded-full p-1 border border-white/20 shadow-lg text-white">
                          <X size={8} />
                        </button>
                      </>
                    ) : isLocked ? <ShieldAlert size={16} className="text-white/20" /> : <Plus size={18} className="text-white/10 group-hover:text-white/20" />}
                  </motion.div>
                );
              })}
           </div>
        </div>

        {/* Dynamic Evolution */}
        <div className="space-y-4">
           <h3 className="text-[10px] font-black text-white/40 tracking-[0.3em] uppercase flex items-center gap-2">
            <ArrowUpCircle size={12} className="text-[#F5C76B]" /> Senda de Evolución
           </h3>
           <div className="flex flex-col gap-3">
              {nextJobs.length > 0 ? (
                <div className={`grid gap-3 ${nextJobs.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                   {nextJobs.map((nextJob) => (
                     <motion.button
                      key={nextJob.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleEvolve(nextJob.id, nextJob.name)}
                      className="bg-black/40 border border-white/5 p-4 rounded-2xl text-center flex flex-col items-center gap-2 group hover:border-[#F5C76B]/40 transition-all"
                     >
                        <ArrowUpCircle size={24} className="text-white/20 group-hover:text-[#F5C76B]" />
                        <span className="text-[10px] font-black text-white/60 tracking-widest uppercase">{nextJob.name}</span>
                        <div className="flex items-center gap-1.5">
                           <span className="text-[8px] font-black text-white/20 uppercase tracking-tighter italic">Tier {nextJob.tier}</span>
                        </div>
                     </motion.button>
                   ))}
                </div>
              ) : (
                <div className="bg-black/40 border border-white/5 p-8 rounded-3xl text-center flex flex-col items-center gap-3">
                   <div className="w-12 h-12 bg-[#F5C76B]/10 rounded-full flex items-center justify-center border border-[#F5C76B]/20">
                      <Star size={24} fill="#F5C76B" className="text-[#F5C76B]" />
                   </div>
                   <p className="text-[10px] text-white/60 font-black uppercase tracking-[0.2em]">Senda de Maestría Completada</p>
                </div>
              )}
           </div>
        </div>
      </div>

      <AnimatePresence>
        {evolvedJobName && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0.5, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="flex flex-col items-center gap-8"
            >
              <div className="relative">
                <Sparkles size={120} className="text-[#F5C76B] animate-pulse drop-shadow-[0_0_50px_rgba(245,199,107,0.4)]" />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-4 border-dashed border-[#F5C76B]/20 rounded-full scale-150"
                />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-white tracking-[0.3em] uppercase italic">Evolución Lograda</h2>
                <p className="text-[#F5C76B] tracking-[0.4em] text-2xl font-black uppercase">{evolvedJobName}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setEvolvedJobName(null)}
                className="mt-8 bg-gradient-to-r from-[#F5C76B] to-[#b88c3a] text-black font-black py-4 px-16 rounded-2xl uppercase tracking-widest shadow-[0_0_30px_rgba(245,199,107,0.3)]"
              >
                Continuar Destino
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
