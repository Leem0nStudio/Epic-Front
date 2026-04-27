'use client';
import { AssetService } from '@/lib/services/asset-service';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, Shield, Sword, Zap, Heart, Star, Briefcase, Sparkles, Box, Plus, X, ArrowUpCircle, ShieldAlert } from 'lucide-react';
import { UnitService } from '@/lib/services/unit-service';
import { EquipmentService } from '@/lib/services/equipment-service';
import { motion, AnimatePresence } from 'motion/react';

interface UnitDetailsViewProps {
  unitId: string;
  onNavigate: (view: any) => void;
  onUpdate: () => void;
  onOpenInventory: (type: 'card' | 'weapon' | 'skill') => void;
}

export function UnitDetailsView({ unitId, onNavigate, onUpdate, onOpenInventory }: UnitDetailsViewProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextJobs, setNextJobs] = useState<any[]>([]);
  const [evolvedJobName, setEvolvedJobName] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const details = await UnitService.getUnitDetails(unitId);
      setData(details);
      const jobs = await UnitService.getNextJobs(details.job.id);
      setNextJobs(jobs);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Falla de Enlace ID de unidad no válido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [unitId]);

  const handleUnequip = async (instanceId: string, slot: 'weapon' | 'card' | 'skill') => {
    try {
      await EquipmentService.unequipItem(unitId, instanceId, slot);
      loadData();
      onUpdate();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleEvolve = async (targetJobId: string, jobName: string) => {
    if (!confirm(`¿Deseas evolucionar a ${jobName}?`)) return;
    try {
      await UnitService.evolveUnit(unitId, targetJobId);
      setEvolvedJobName(jobName);
      loadData();
      onUpdate();
    } catch (e: any) {
      alert("Requisitos insuficientes: " + e.message);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#0B1A2A] gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-t-[#F5C76B] border-white/10 rounded-full"
        />
        <p className="text-[10px] font-black text-white/40 tracking-[0.5em] uppercase">Sincronizando Archivos...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#0B1A2A] p-8 text-center gap-6">
        <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center justify-center">
            <ShieldAlert size={40} className="text-red-400" />
        </div>
        <div className="space-y-2">
            <h2 className="text-white font-black uppercase tracking-widest italic text-lg">Error de Memoria</h2>
            <p className="text-white/40 text-[10px] uppercase tracking-wider leading-relaxed">{error}</p>
        </div>
        <button
            onClick={() => onNavigate('party')}
            className="px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors"
        >
            Volver al Cuartel
        </button>
      </div>
    );
  }

  const { unit, job, weapon, cards, skills, finalStats } = data;

  return (
    <div className="flex flex-col h-full bg-[#0B1A2A] bg-cover bg-center bg-no-repeat overflow-hidden relative" style={{ backgroundImage: `url('${AssetService.getBgUrl('party')}')` }}>
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 via-transparent to-transparent pointer-events-none" />

      {/* Top Navigation */}
      <div className="flex items-center justify-between p-6 z-10">
         <button onClick={() => onNavigate('party')} className="p-2 bg-black/40 border border-white/10 rounded-xl text-white/60 hover:text-white transition-colors">
            <ChevronLeft size={20} />
         </button>
         <div className="text-right">
            <h1 className="text-xl font-black text-white tracking-widest uppercase italic leading-tight">{unit.name}</h1>
            <p className="text-[10px] font-black text-[#F5C76B] tracking-[0.3em] uppercase italic">{job.name}</p>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-12 space-y-8 custom-scrollbar z-10">
        {/* Unit Sprite & Level */}
        <div className="relative aspect-video bg-black/40 rounded-[32px] border border-white/10 flex items-center justify-center overflow-hidden group shadow-2xl">
           <div className="absolute inset-0 bg-gradient-to-t from-[#0B1A2A] via-transparent to-transparent opacity-60" />
           <motion.img
             initial={{ y: 20, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             src={AssetService.getSpriteUrl(unit.sprite_id)}
             className="w-[120%] transform translate-y-8 brightness-110"
             style={{ imageRendering: 'pixelated' }}
           />

           <div className="absolute top-4 left-4 flex flex-col">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest italic">Nivel de Unidad</span>
              <span className="text-3xl font-black text-white italic drop-shadow-lg">{unit.level}</span>
              <div className="w-24 h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                 <div className="h-full bg-[#F5C76B] w-2/3 shadow-[0_0_10px_rgba(245,199,107,0.5)]" />
              </div>
           </div>

           <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-full border border-white/5">
              <Star size={12} fill="#F5C76B" className="text-[#F5C76B]" />
              <span className="text-[9px] font-black text-white/80 uppercase">RANGO {job.tier === 3 ? 'UR' : job.tier === 2 ? 'SSR' : 'SR'}</span>
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
             <div key={stat.label} className="bg-black/40 border border-white/5 p-3 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-inner min-w-0">
               <stat.icon size={14} className={stat.color} />
               <span className="text-[14px] font-black text-white truncate w-full text-center">{stat.val}</span>
               <span className="text-[7px] font-black text-white/40 uppercase tracking-tighter">{stat.label}</span>
             </div>
           ))}
        </div>

        {/* Arsenal */}
        <div className="space-y-4">
           <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black text-white/40 tracking-[0.3em] uppercase flex items-center gap-2">
                <Briefcase size={12} className="text-[#F5C76B]" /> Arsenal de Combate
              </h3>
              <span className="text-[8px] font-black text-[#F5C76B]/40 uppercase tracking-widest">ESPACIOS: {(weapon ? 1 : 0) + (cards?.length || 0)}/5</span>
           </div>
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
                        <img src={AssetService.getIconUrl(unit.icon_id)} className="w-8 h-8 object-contain opacity-80" />
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
        <div className="space-y-4 pb-12">
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
                      className="bg-black/40 border border-white/5 p-4 rounded-2xl text-center flex flex-col items-center gap-2 group hover:border-[#F5C76B]/40 transition-all shadow-xl"
                     >
                        <ArrowUpCircle size={24} className="text-white/20 group-hover:text-[#F5C76B]" />
                        <span className="text-[10px] font-black text-white tracking-widest uppercase">{nextJob.name}</span>
                        <div className="flex items-center gap-1.5">
                           <span className="text-[8px] font-black text-[#F5C76B]/40 uppercase tracking-tighter italic">Nivel {nextJob.evolution_requirements?.minLevel}+</span>
                        </div>
                     </motion.button>
                   ))}
                </div>
              ) : (
                <div className="bg-black/40 border border-white/5 p-8 rounded-3xl text-center flex flex-col items-center gap-3">
                   <div className="w-12 h-12 bg-[#F5C76B]/10 rounded-full flex items-center justify-center border border-[#F5C76B]/20">
                      <Star size={24} fill="#F5C76B" className="text-[#F5C76B]" />
                   </div>
                   <p className="text-[10px] text-white/60 font-black uppercase tracking-[0.2em]">Maestría Máxima Alcanzada</p>
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
                <h2 className="text-3xl font-black text-white tracking-[0.3em] uppercase italic text-glow-blue">Evolución Lograda</h2>
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
