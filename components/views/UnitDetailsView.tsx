'use client';
import React, { useState, useEffect } from 'react';
import { AssetService } from '@/lib/services/asset-service';
import { supabase } from '@/lib/supabase';
import { UnitService } from '@/lib/services/unit-service';
import { EquipmentService } from '@/lib/services/equipment-service';
import { PanelButton } from '@/components/ui/PanelButton';
import { NineSlicePanel } from '@/components/ui/NineSlicePanel';
import { RarityIcon } from '@/components/ui/RarityIcon';
import { SpriteAtlasIcon } from '@/components/ui/SpriteAtlasIcon';
import { RARITY_COLORS, getRarityCode } from '@/lib/config/assets-config';
import { SPRITE_INDEX } from '@/lib/config/sprite-atlas-config';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Shield, Sword, Zap, Heart, Star, Briefcase, Sparkles, Box, Plus, X, ArrowUpCircle, ShieldAlert } from 'lucide-react';

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
  const [selectedSkill, setSelectedSkill] = useState<any>(null);
  const [showLearnSkill, setShowLearnSkill] = useState(false);
  const [availableSkills, setAvailableSkills] = useState<any[]>([]);
  const [loadingSkills, setLoadingSkills] = useState(false);

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

  const loadAvailableSkills = async () => {
    if (!supabase) return;
    setLoadingSkills(true);
    try {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .order('rarity', { ascending: true });
      if (!error && data) {
        setAvailableSkills(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSkills(false);
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
        <NineSlicePanel
          type="border"
          variant="default"
          className="p-8 flex flex-col items-center gap-4"
          glassmorphism={true}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-t-[#F5C76B] border-white/10 rounded-full"
          />
          <p className="text-[10px] font-black text-white/40 tracking-[0.5em] uppercase">Sincronizando Archivos...</p>
        </NineSlicePanel>
      </div>
    );
  }

   if (error || !data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#0B1A2A] p-8 text-center gap-6">
        <NineSlicePanel
          type="border"
          variant="default"
          className="p-8 flex flex-col items-center gap-6"
          glassmorphism={true}
        >
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
        </NineSlicePanel>
      </div>
    );
  }

  const { unit, job, weapon, cards, skills, finalStats } = data;

  return (
    <div className="flex flex-col h-full bg-[#0B1A2A] bg-cover bg-center bg-no-repeat overflow-hidden relative" style={{ backgroundImage: `url('${AssetService.getBgUrl('party')}')` }}>
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-transparent to-transparent pointer-events-none" />

      {/* Top Navigation */}
      <div className="flex items-center justify-between p-6 z-20 sticky top-0 bg-[#0B1A2A]/40 backdrop-blur-md border-b border-white/5">
         <button 
           onClick={() => onNavigate('party')} 
           className="p-3 bg-white/5 border border-white/10 rounded-2xl text-white/60 hover:text-white hover:bg-white/10 transition-all active:scale-95 shadow-xl"
         >
            <ChevronLeft size={20} />
         </button>
         <div className="text-right flex flex-col items-end">
            <motion.h1 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="text-2xl font-black text-white tracking-tighter uppercase italic leading-none drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
            >
              {unit.name}
            </motion.h1>
            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-2 mt-1"
            >
              <div className="h-[1px] w-8 bg-gradient-to-l from-[#F5C76B] to-transparent" />
              <p className="text-[10px] font-black text-[#F5C76B] tracking-[0.2em] uppercase italic">{job.name}</p>
            </motion.div>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-12 space-y-8 custom-scrollbar z-10">
        {/* Unit Sprite & Level */}
        <div className="relative aspect-video bg-white/5 rounded-[40px] border border-white/10 flex items-center justify-center overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
           <div className="absolute inset-0 bg-gradient-to-t from-[#0B1A2A] via-transparent to-white/5 opacity-40" />
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(245,199,107,0.1),transparent_70%)]" />
           
           <motion.img
             initial={{ scale: 0.8, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             transition={{ type: 'spring', damping: 15 }}
             src={AssetService.getSpriteUrl(unit.sprite_id)}
             className="w-[120%] transform translate-y-4 brightness-110 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
             style={{ imageRendering: 'pixelated' }}
             onError={(e) => {
               (e.target as HTMLImageElement).src = AssetService.getSpriteUrl('novice_idle.png');
             }}
           />

           <div className="absolute top-6 left-6 flex flex-col gap-1">
              <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] italic">Unit Level</span>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-white italic tracking-tighter drop-shadow-2xl">{unit.level}</span>
                <span className="text-[10px] font-black text-[#F5C76B] uppercase tracking-widest">EXP</span>
              </div>
              <div className="w-32 h-1.5 bg-white/5 rounded-full mt-1 overflow-hidden border border-white/5 backdrop-blur-sm">
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: '66.6%' }}
                   transition={{ duration: 1.5, ease: "easeOut" }}
                   className="h-full bg-gradient-to-r from-[#F5C76B] to-[#FFD88F] shadow-[0_0_15px_rgba(245,199,107,0.6)]" 
                 />
              </div>
           </div>

           <div className="absolute bottom-6 right-6 flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 shadow-2xl">
              <div className="relative">
                <Star size={14} fill="#F5C76B" className="text-[#F5C76B] animate-pulse" />
                <div className="absolute inset-0 bg-[#F5C76B] blur-md opacity-20 scale-150" />
              </div>
              <span className="text-[10px] font-black text-white tracking-[0.2em] uppercase italic">
                {job.tier === 3 ? 'Ultra Rare' : job.tier === 2 ? 'Super Rare' : 'Rare Spec'}
              </span>
           </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-3">
           {[
             { label: 'HP', val: finalStats.hp, icon: Heart, color: 'text-red-400', bg: 'bg-red-400/5', border: 'border-red-400/10' },
             { label: 'ATK', val: finalStats.atk, icon: Sword, color: 'text-[#F5C76B]', bg: 'bg-[#F5C76B]/5', border: 'border-[#F5C76B]/10' },
             { label: 'DEF', val: finalStats.def, icon: Shield, color: 'text-blue-400', bg: 'bg-blue-400/5', border: 'border-blue-400/10' },
             { label: 'SPD', val: finalStats.agi, icon: Zap, color: 'text-cyan-400', bg: 'bg-cyan-400/5', border: 'border-cyan-400/10' }
           ].map((stat, i) => (
             <motion.div
               key={stat.label}
               initial={{ y: 20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               transition={{ delay: 0.2 + (i * 0.05) }}
               className={`p-4 flex flex-col items-center justify-center gap-1 rounded-3xl backdrop-blur-xl border ${stat.border} ${stat.bg} shadow-2xl relative overflow-hidden group`}
             >
               <div className={`absolute top-0 right-0 w-8 h-8 ${stat.bg} blur-2xl group-hover:scale-150 transition-transform`} />
               <stat.icon size={16} className={`${stat.color} drop-shadow-[0_0_10px_rgba(0,0,0,0.5)] mb-1`} />
               <span className="text-lg font-black text-white tracking-tighter leading-none">{stat.val}</span>
               <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">{stat.label}</span>
             </motion.div>
           ))}
        </div>

        {/* Arsenal */}
        <div className="space-y-4">
           <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-black text-white/60 tracking-[0.4em] uppercase flex items-center gap-2 italic">
                <div className="w-1.5 h-1.5 bg-[#F5C76B] rounded-full shadow-[0_0_8px_#F5C76B]" />
                Arsenal de Combate
              </h3>
              <div className="px-2 py-0.5 bg-white/5 rounded-full border border-white/5">
                <span className="text-[8px] font-black text-[#F5C76B]/60 uppercase tracking-widest italic">Slot {(weapon ? 1 : 0) + (cards?.length || 0)} / 5</span>
              </div>
           </div>
           <div className="grid grid-cols-5 gap-3">
              <motion.div
                whileTap={{ scale: 0.9 }}
                onClick={() => !weapon && onOpenInventory('weapon')}
                className={`aspect-square flex items-center justify-center relative rounded-2xl border backdrop-blur-xl transition-all cursor-pointer group shadow-xl ${
                  weapon 
                    ? '' 
                    : 'border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/10'
                }`}
                style={weapon ? {
                  borderColor: `${RARITY_COLORS[getRarityCode(weapon.rarity)]}66`,
                  backgroundColor: `${RARITY_COLORS[getRarityCode(weapon.rarity)]}11`
                } : {}}
              >
                {weapon ? (
                  <>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(245,199,107,0.2),transparent_70%)]" />
                    <RarityIcon rarity={getRarityCode(weapon.rarity)} size="sm" glass={true}>
                       <SpriteAtlasIcon index={SPRITE_INDEX.weapon_sword} size={24} className="drop-shadow-[0_0_10px_rgba(245,199,107,0.4)]" />
                     </RarityIcon>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleUnequip(weapon.id, 'weapon'); }} 
                      className="absolute -top-1.5 -right-1.5 bg-red-500 rounded-full p-1 border border-white/20 shadow-lg text-white z-20 hover:scale-110 transition-transform"
                    >
                      <X size={10} strokeWidth={3} />
                    </button>
                  </>
                ) : <Plus size={20} className="text-white/10 group-hover:text-white/30 transition-colors" />}
              </motion.div>

              {[0, 1, 2, 3].map((idx, i) => {
                const card = cards[idx];
                return (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.3 + (i * 0.05) }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => !card && onOpenInventory('card')}
                    className={`aspect-square flex items-center justify-center relative rounded-2xl border backdrop-blur-xl transition-all cursor-pointer group shadow-xl ${
                      card 
                        ? '' 
                        : 'border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/10'
                    }`}
                    style={card ? {
                      borderColor: `${RARITY_COLORS[getRarityCode(card.rarity)]}66`,
                      backgroundColor: `${RARITY_COLORS[getRarityCode(card.rarity)]}11`
                    } : {}}
                  >
                    {card ? (
                      <>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(168,85,247,0.2),transparent_70%)]" />
                        <RarityIcon rarity={getRarityCode(card.rarity)} size="sm" glass={true}>
                           <SpriteAtlasIcon index={SPRITE_INDEX.card_common} size={24} className="drop-shadow-[0_0_10px_rgba(168,85,247,0.4)]" />
                         </RarityIcon>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleUnequip(card.id, 'card'); }} 
                          className="absolute -top-1.5 -right-1.5 bg-red-500 rounded-full p-1 border border-white/20 shadow-lg text-white z-20 hover:scale-110 transition-transform"
                        >
                          <X size={10} strokeWidth={3} />
                        </button>
                      </>
                    ) : <Plus size={20} className="text-white/10 group-hover:text-white/30 transition-colors" />}
                  </motion.div>
                );
              })}
           </div>
        </div>

        {/* Techniques */}
        <div className="space-y-4">
           <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-black text-white/60 tracking-[0.4em] uppercase flex items-center gap-2 italic">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_8px_#22d3ee]" />
                Técnicas Especiales
              </h3>
           </div>
           <div className="grid grid-cols-5 gap-3">
              {[0, 1, 2, 3, 4].map((idx, i) => {
                const skill = skills[idx];
                const limit = job.tier === 0 ? 1 : job.tier === 1 ? 2 : job.tier === 2 ? 3 : 5;
                const isLocked = idx >= limit;
                return (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4 + (i * 0.05) }}
                    whileTap={isLocked ? {} : { scale: 0.9 }}
                    onClick={() => {
                      if (skill) {
                        setSelectedSkill(skill);
                      } else if (!isLocked) {
                        onOpenInventory('skill');
                      }
                    }}
                    className={`aspect-square flex items-center justify-center relative rounded-2xl border backdrop-blur-xl transition-all cursor-pointer group shadow-xl ${
                      skill 
                        ? '' 
                        : isLocked 
                          ? 'border-white/5 bg-black/40 opacity-40 cursor-not-allowed'
                          : 'border-white/5 bg-white/5 hover:border-white/10 hover:bg-white/10'
                    }`}
                    style={skill ? {
                      borderColor: `${RARITY_COLORS[getRarityCode(skill.rarity)]}66`,
                      backgroundColor: `${RARITY_COLORS[getRarityCode(skill.rarity)]}11`
                    } : {}}
                  >
                    {skill ? (
                      <>
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(34,211,238,0.2),transparent_70%)]" />
                        <RarityIcon rarity={getRarityCode(skill.rarity)} size="sm" glass={true}>
                           <SpriteAtlasIcon index={SPRITE_INDEX.skill_attack} size={32} />
                         </RarityIcon>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleUnequip(skill.id, 'skill'); }} 
                          className="absolute -top-1.5 -right-1.5 bg-red-500 rounded-full p-1 border border-white/20 shadow-lg text-white z-20 hover:scale-110 transition-transform"
                        >
                          <X size={10} strokeWidth={3} />
                        </button>
                      </>
                    ) : isLocked ? (
                      <ShieldAlert size={18} className="text-white/10" />
                    ) : (
                      <Plus size={20} className="text-white/10 group-hover:text-white/30 transition-colors" />
                    )}
                  </motion.div>
                );
               })}
            </div>
          </div>

          {/* Learn Skill Button */}
          {data && (
            <div className="flex justify-center mt-4">
              <button
                onClick={() => { setShowLearnSkill(true); loadAvailableSkills(); }}
                className="px-6 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400 text-[10px] font-black uppercase tracking-widest hover:bg-cyan-500/20 transition-colors shadow-[0_0_20px_rgba(34,211,238,0.1)]"
              >
                Aprender Habilidad
              </button>
            </div>
          )}

          {/* Skill Detail Modal */}
          {selectedSkill && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-50 bg-[#0B1A2A]/90 backdrop-blur-3xl flex flex-col p-8 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <button onClick={() => setSelectedSkill(null)} className="p-3 bg-white/5 border border-white/10 rounded-2xl text-white/60 hover:text-white transition-all active:scale-95">
                  <ChevronLeft size={20} />
                </button>
                <h2 className="text-lg font-black text-white tracking-[0.3em] uppercase italic">Archivo de Técnica</h2>
                <div className="w-10" />
              </div>

              <div className="flex-1 flex flex-col items-center justify-center gap-8">
                <div className="relative">
                  <RarityIcon
                    rarity={getRarityCode(selectedSkill.def?.rarity)}
                    size="lg"
                    glass={true}
                  >
                    <Zap size={60} className="text-cyan-400 drop-shadow-[0_0_30px_rgba(34,211,238,0.6)]" />
                  </RarityIcon>
                  <div className="absolute inset-0 bg-cyan-400/20 blur-3xl rounded-full scale-150 -z-10" />
                </div>

                <div className="text-center space-y-2">
                  <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">{selectedSkill.def?.name || selectedSkill.item_id}</h3>
                  <div className="flex justify-center">
                    <span className="text-[10px] font-black text-cyan-400 bg-cyan-400/10 px-4 py-1 rounded-full border border-cyan-400/20 uppercase tracking-widest">
                      {selectedSkill.def?.rarity || 'COMMON'} Rank
                    </span>
                  </div>
                </div>

                {selectedSkill.def?.description && (
                  <div className="w-full p-6 bg-white/5 rounded-[32px] border border-white/10 backdrop-blur-xl shadow-2xl">
                    <p className="text-white/70 text-sm text-center leading-relaxed font-medium italic">"{selectedSkill.def.description}"</p>
                  </div>
                )}

                <div className="w-full grid grid-cols-2 gap-4">
                  <div className="p-5 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-xl flex flex-col items-center">
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] mb-1">Recarga</p>
                    <p className="text-white text-2xl font-black italic">{selectedSkill.def?.cooldown || 0}s</p>
                  </div>
                  <div className="p-5 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-xl flex flex-col items-center">
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] mb-1">Potencia</p>
                     <p className="text-white text-2xl font-black italic">
                       {selectedSkill.def?.scaling 
                         ? (typeof selectedSkill.def.scaling === 'string' 
                           ? JSON.parse(selectedSkill.def.scaling).mult + 'x' 
                           : selectedSkill.def.scaling.mult + 'x')
                         : '1.0x'}
                     </p>
                  </div>
                </div>

                {selectedSkill.def?.effect && (
                  <div className="w-full p-6 bg-cyan-500/5 rounded-[32px] border border-cyan-500/10 backdrop-blur-xl">
                    <p className="text-[9px] font-black text-cyan-400/60 uppercase tracking-[0.3em] mb-2">Protocolo de Efecto</p>
                    <p className="text-white/80 text-sm font-medium">{selectedSkill.def.effect}</p>
                  </div>
                )}
              </div>

               <button
                 onClick={() => setSelectedSkill(null)}
                 className="w-full py-5 bg-white/5 border border-white/10 rounded-[32px] text-white text-[10px] font-black uppercase tracking-[0.5em] hover:bg-white/10 transition-all active:scale-95 mt-8 shadow-2xl"
               >
                 Cerrar Transmisión
               </button>
            </motion.div>
          )}

          {/* Learn Skill Modal */}
          {showLearnSkill && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-50 bg-[#0B1A2A]/95 backdrop-blur-3xl flex flex-col p-8 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <button onClick={() => setShowLearnSkill(false)} className="p-3 bg-white/5 border border-white/10 rounded-2xl text-white/60 hover:text-white transition-all active:scale-95">
                  <ChevronLeft size={20} />
                </button>
                <h2 className="text-lg font-black text-white tracking-[0.3em] uppercase italic">Centro de Entrenamiento</h2>
                <div className="w-10" />
              </div>

              {loadingSkills ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                  <div className="w-12 h-12 border-4 border-t-cyan-400 border-white/10 rounded-full animate-spin"></div>
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em]">Escaneando Datos...</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar">
                  {availableSkills.map((skill) => {
                    const isLearned = data?.job?.skills_unlocked?.some((s: any) => s.id === skill.id);
                    return (
                      <motion.div
                        key={skill.id}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        whileHover={isLearned ? {} : { x: 8 }}
                        onClick={async () => {
                          if (isLearned) return;
                          if (!confirm(`¿Aprender ${skill.name} por 500 Zeny?`)) return;
                          try {
                            // Handle scaling which might be an object or JSON string
                            let scalingMult = 1.0;
                            if (skill.scaling) {
                              if (typeof skill.scaling === 'string') {
                                try {
                                  const parsed = JSON.parse(skill.scaling);
                                  scalingMult = parsed.mult || 1.0;
                                } catch {
                                  scalingMult = 1.0;
                                }
                              } else if (typeof skill.scaling === 'object') {
                                scalingMult = skill.scaling.mult || 1.0;
                              }
                            }
                            
                             const { data: inventoryId, error } = await supabase.rpc('rpc_learn_skill', {
                               p_unit_id: unitId,
                               p_skill_id: skill.id,
                               p_skill_data: JSON.stringify({
                                 id: skill.id,
                                 name: skill.name,
                                 type: 'active',
                                 powerMod: scalingMult,
                                 cooldown: skill.cooldown || 2,
                                 description: skill.description || ''
                               })
                             });
                             
                             if (error) throw error;
                             
                             // Auto-equip the learned skill
                             if (inventoryId) {
                               await supabase.rpc('rpc_equip_skill', {
                                 p_unit_id: unitId,
                                 p_inventory_id: inventoryId
                               });
                             }
                             
                             alert('Habilidad aprendida y equipada!');
                             setShowLearnSkill(false);
                             loadData();
                          } catch (e: any) {
                            alert(e.message || 'Error al aprender habilidad');
                          }
                        }}
                        className={`p-6 rounded-[32px] border backdrop-blur-xl transition-all shadow-2xl ${
                          isLearned 
                            ? 'border-white/5 bg-white/5 opacity-40 cursor-not-allowed' 
                            : 'border-white/10 bg-white/5 cursor-pointer hover:border-cyan-400/40 hover:bg-cyan-400/5'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-black text-white uppercase italic tracking-wider text-lg">{skill.name}</span>
                          <span className={`text-[9px] font-black px-3 py-1 rounded-full border ${
                            skill.rarity === 'epic' ? 'text-purple-400 bg-purple-400/10 border-purple-400/20' :
                            skill.rarity === 'rare' ? 'text-blue-400 bg-blue-400/10 border-blue-400/20' :
                            'text-white/40 bg-white/5 border-white/10'
                          }`}>
                            {skill.rarity?.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-white/50 leading-relaxed italic">{skill.description}</p>
                        {isLearned && (
                          <div className="flex items-center gap-2 mt-4 text-green-400">
                            <Sparkles size={12} />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em]">Habilidad Integrada</p>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}

              <button
                onClick={() => setShowLearnSkill(false)}
                className="w-full py-5 bg-white/5 border border-white/10 rounded-[32px] text-white text-[10px] font-black uppercase tracking-[0.5em] hover:bg-white/10 transition-all active:scale-95 mt-8 shadow-2xl"
              >
                Cerrar Protocolo
              </button>
            </motion.div>
          )}

          {/* Dynamic Evolution */}
         <div className="space-y-4 pb-12">
            <h3 className="text-[10px] font-black text-white/60 tracking-[0.4em] uppercase flex items-center gap-2 italic px-2">
              <ArrowUpCircle size={12} className="text-[#F5C76B]" /> Senda de Evolución
            </h3>
            <div className="flex flex-col gap-4">
               {nextJobs.length > 0 ? (
                 <div className={`grid gap-4 ${nextJobs.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {nextJobs.map((nextJob) => (
                      <motion.div
                       key={nextJob.id}
                       whileHover={{ scale: 1.02, y: -4 }}
                       whileTap={{ scale: 0.98 }}
                       onClick={() => handleEvolve(nextJob.id, nextJob.name)}
                       className="p-6 text-center flex flex-col items-center gap-3 cursor-pointer bg-gradient-to-b from-white/10 to-white/5 border border-white/10 rounded-[40px] shadow-2xl group transition-all"
                      >
                         <div className="w-16 h-16 rounded-3xl bg-[#F5C76B]/10 border border-[#F5C76B]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                           <ArrowUpCircle size={32} className="text-[#F5C76B]" />
                         </div>
                         <span className="text-sm font-black text-white tracking-widest uppercase italic">{nextJob.name}</span>
                         <div className="px-3 py-1 bg-[#F5C76B]/10 rounded-full border border-[#F5C76B]/20">
                            <span className="text-[8px] font-black text-[#F5C76B] uppercase tracking-widest">Nivel {nextJob.evolution_requirements?.minLevel}+</span>
                         </div>
                      </motion.div>
                    ))}
                 </div>
               ) : (
                 <div className="p-10 text-center flex flex-col items-center gap-4 bg-white/5 border border-white/10 rounded-[40px] backdrop-blur-xl">
                    <div className="relative">
                      <Star size={40} fill="#F5C76B" className="text-[#F5C76B]" />
                      <div className="absolute inset-0 bg-[#F5C76B] blur-2xl opacity-20 scale-150" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-lg font-black text-white uppercase italic tracking-tighter">Maestría Máxima</p>
                      <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.3em]">Destino Alcanzado</p>
                    </div>
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
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/98 backdrop-blur-3xl flex flex-col items-center justify-center p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0.5, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ type: 'spring', damping: 20 }}
              className="flex flex-col items-center gap-10"
            >
              <div className="relative">
                <Sparkles size={160} className="text-[#F5C76B] animate-pulse drop-shadow-[0_0_80px_rgba(245,199,107,0.5)]" />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-4 border-dashed border-[#F5C76B]/20 rounded-full scale-[1.8]"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-2 border-dotted border-cyan-400/20 rounded-full scale-[2.2]"
                />
              </div>
              <div className="space-y-4">
                <h2 className="text-5xl font-black text-white tracking-[0.2em] uppercase italic drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">Ascensión</h2>
                <div className="h-[2px] w-40 bg-gradient-to-r from-transparent via-[#F5C76B] to-transparent mx-auto" />
                <p className="text-[#F5C76B] tracking-[0.5em] text-3xl font-black uppercase italic">{evolvedJobName}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 50px rgba(245,199,107,0.4)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setEvolvedJobName(null)}
                className="mt-12 bg-gradient-to-r from-[#F5C76B] to-[#b88c3a] text-black font-black py-5 px-20 rounded-[32px] uppercase tracking-[0.4em] italic shadow-2xl"
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
