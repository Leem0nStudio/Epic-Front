'use client';
import React, { useState, useEffect } from 'react';
import { AssetService } from '@/lib/services/asset-service';
import { supabase } from '@/lib/supabase';
import { UnitService } from '@/lib/services/unit-service';
import { EquipmentService } from '@/lib/services/equipment-service';
import { PanelButton } from '@/components/ui/PanelButton';
import { NineSlicePanel } from '@/components/ui/NineSlicePanel';
import { RarityIcon } from '@/components/ui/RarityIcon';
import { getRarityCode } from '@/lib/config/assets-config';
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
             <NineSlicePanel
               key={stat.label}
               type="border"
               variant="default"
               className="p-3 flex flex-col items-center justify-center gap-1 min-w-0"
               glassmorphism={true}
             >
               <stat.icon size={14} className={stat.color} />
               <span className="text-[14px] font-black text-white truncate w-full text-center">{stat.val}</span>
               <span className="text-[7px] font-black text-white/40 uppercase tracking-tighter">{stat.label}</span>
             </NineSlicePanel>
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
              <NineSlicePanel
                type="border"
                variant={weapon ? 'fancy' : 'default'}
                className="aspect-square flex items-center justify-center relative group transition-all cursor-pointer"
                glassmorphism={true}
                onClick={() => !weapon && onOpenInventory('weapon')}
                as={motion.div}
                whileTap={{ scale: 0.9 }}
              >
                {weapon ? (
                  <>
                    <RarityIcon
                      rarity={getRarityCode(weapon.rarity)}
                      size="sm"
                    >
                      <Sword size={24} className="text-[#F5C76B]" />
                    </RarityIcon>
                    <button onClick={(e) => { e.stopPropagation(); handleUnequip(weapon.id, 'weapon'); }} className="absolute -top-1.5 -right-1.5 bg-red-500 rounded-full p-1 border border-white/20 shadow-lg text-white z-10">
                      <X size={8} />
                    </button>
                  </>
                ) : <Plus size={18} className="text-white/10 group-hover:text-white/20" />}
              </NineSlicePanel>
              {[0, 1, 2, 3].map(idx => {
                const card = cards[idx];
                return (
                  <NineSlicePanel
                    key={idx}
                    type="border"
                    variant={card ? 'fancy' : 'default'}
                    className="aspect-square flex items-center justify-center relative group transition-all cursor-pointer"
                    glassmorphism={true}
                    onClick={() => !card && onOpenInventory('card')}
                    as={motion.div}
                    whileTap={{ scale: 0.9 }}
                  >
                    {card ? (
                      <>
                        <RarityIcon
                          rarity={getRarityCode(card.rarity)}
                          size="sm"
                        >
                          <Sparkles size={24} className="text-purple-400" />
                        </RarityIcon>
                        <button onClick={(e) => { e.stopPropagation(); handleUnequip(card.id, 'card'); }} className="absolute -top-1.5 -right-1.5 bg-red-500 rounded-full p-1 border border-white/20 shadow-lg text-white z-10">
                          <X size={8} />
                        </button>
                      </>
                    ) : <Plus size={18} className="text-white/10 group-hover:text-white/20" />}
                  </NineSlicePanel>
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
                  <NineSlicePanel
                    key={idx}
                    type="border"
                    variant={skill ? 'fancy' : 'default'}
                    className={`aspect-square flex items-center justify-center relative group transition-all cursor-pointer ${isLocked ? 'opacity-20' : ''}`}
                    glassmorphism={true}
                    onClick={() => {
                      if (skill) {
                        setSelectedSkill(skill);
                      } else if (!isLocked) {
                        onOpenInventory('skill');
                      }
                    }}
                    as={motion.div}
                    whileTap={{ scale: isLocked ? 1 : 0.9 }}
                  >
                    {skill ? (
                      <>
                        <RarityIcon
                          rarity={getRarityCode(skill.rarity)}
                          size="sm"
                        >
                          <img src={AssetService.getIconUrl(unit.icon_id)} className="w-8 h-8 object-contain opacity-80" />
                        </RarityIcon>
                        <button onClick={(e) => { e.stopPropagation(); handleUnequip(skill.id, 'skill'); }} className="absolute -top-1.5 -right-1.5 bg-red-500 rounded-full p-1 border border-white/20 shadow-lg text-white z-10">
                          <X size={8} />
                        </button>
                      </>
                    ) : isLocked ? <ShieldAlert size={16} className="text-white/20" /> : <Plus size={18} className="text-white/10 group-hover:text-white/20" />}
                  </NineSlicePanel>
                );
               })}
            </div>
          </div>

          {/* Learn Skill Button */}
          {data && (
            <div className="flex justify-center mt-4">
              <button
                onClick={() => { setShowLearnSkill(true); loadAvailableSkills(); }}
                className="px-6 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400 text-[10px] font-black uppercase tracking-widest hover:bg-cyan-500/20 transition-colors"
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
              className="absolute inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col p-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <button onClick={() => setSelectedSkill(null)} className="p-2 bg-black/40 border border-white/10 rounded-xl text-white/60 hover:text-white transition-colors">
                  <ChevronLeft size={20} />
                </button>
                <h2 className="text-lg font-black text-white tracking-widest uppercase">Detalles</h2>
                <div className="w-8" />
              </div>

              <div className="flex-1 flex flex-col items-center justify-center gap-6">
                <RarityIcon
                  rarity={getRarityCode(selectedSkill.def?.rarity)}
                  size="lg"
                >
                  <Zap size={40} className="text-cyan-400" />
                </RarityIcon>

                <div className="text-center">
                  <h3 className="text-xl font-black text-white uppercase">{selectedSkill.def?.name || selectedSkill.item_id}</h3>
                  <span className="text-[10px] font-black text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-sm border border-cyan-400/20 mt-2 inline-block">
                    {selectedSkill.def?.rarity || 'COMMON'}
                  </span>
                </div>

                {selectedSkill.def?.description && (
                  <NineSlicePanel
                    type="border"
                    variant="default"
                    className="w-full p-4"
                    glassmorphism={true}
                  >
                    <p className="text-white/80 text-sm text-center leading-relaxed">{selectedSkill.def.description}</p>
                  </NineSlicePanel>
                )}

                <div className="w-full grid grid-cols-2 gap-3">
                  <NineSlicePanel
                    type="border"
                    variant="default"
                    className="p-4"
                    glassmorphism={true}
                  >
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Cooldown</p>
                    <p className="text-white text-lg font-black">{selectedSkill.def?.cooldown || 0}</p>
                  </NineSlicePanel>
                  <NineSlicePanel
                    type="border"
                    variant="default"
                    className="p-4"
                    glassmorphism={true}
                  >
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Power</p>
                    <p className="text-white text-lg font-black">{selectedSkill.def?.scaling ? JSON.parse(selectedSkill.def.scaling).mult + 'x' : '1.0x'}</p>
                  </NineSlicePanel>
                </div>

                {selectedSkill.def?.effect && (
                  <NineSlicePanel
                    type="border"
                    variant="default"
                    className="w-full p-4"
                    glassmorphism={true}
                  >
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Efecto</p>
                    <p className="text-white/80 text-sm">{selectedSkill.def.effect}</p>
                  </NineSlicePanel>
                )}
              </div>

               <button
                 onClick={() => setSelectedSkill(null)}
                 className="w-full py-3 bg-white/5 border border-white/10 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors mt-4"
               >
                 Cerrar
               </button>
            </motion.div>
          )}

          {/* Learn Skill Modal */}
          {showLearnSkill && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col p-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <button onClick={() => setShowLearnSkill(false)} className="p-2 bg-black/40 border border-white/10 rounded-xl text-white/60 hover:text-white transition-colors">
                  <ChevronLeft size={20} />
                </button>
                <h2 className="text-lg font-black text-white tracking-widest uppercase">Aprender Habilidad</h2>
                <div className="w-8" />
              </div>

              {loadingSkills ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-t-[#F5C76B] border-white/5 rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-3">
                  {availableSkills.map((skill) => {
                    const isLearned = data?.job?.skills_unlocked?.some((s: any) => s.id === skill.id);
                    return (
                      <NineSlicePanel
                        key={skill.id}
                        type="border"
                        variant="default"
                        className={`p-4 ${isLearned ? 'opacity-50' : 'cursor-pointer hover:border-white/20'}`}
                        glassmorphism={true}
                        onClick={async () => {
                          if (isLearned) return;
                          if (!confirm(`¿Aprender ${skill.name} por 500 Zeny?`)) return;
                          try {
                            await supabase.rpc('rpc_learn_skill', {
                              p_unit_id: unitId,
                              p_skill_id: skill.id,
                              p_skill_data: JSON.stringify({
                                id: skill.id,
                                name: skill.name,
                                type: 'active',
                                powerMod: skill.scaling ? JSON.parse(skill.scaling).mult : 1.0,
                                cooldown: skill.cooldown || 2,
                                description: skill.description || ''
                              })
                            });
                            alert('Habilidad aprendida!');
                            setShowLearnSkill(false);
                            loadData();
                          } catch (e: any) {
                            alert(e.message || 'Error al aprender habilidad');
                          }
                        }}
                        as={motion.div}
                        whileHover={{ x: 4 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-black text-white uppercase">{skill.name}</span>
                          <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-sm border ${
                            skill.rarity === 'epic' ? 'text-purple-400 bg-purple-400/10 border-purple-400/20' :
                            skill.rarity === 'rare' ? 'text-blue-400 bg-blue-400/10 border-blue-400/20' :
                            'text-white/60 bg-white/5 border-white/10'
                          }`}>
                            {skill.rarity?.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[10px] text-white/40">{skill.description}</p>
                        {isLearned && (
                          <p className="text-[10px] text-green-400 mt-2">✓ Ya aprendida</p>
                        )}
                      </NineSlicePanel>
                    );
                  })}
                </div>
              )}

              <button
                onClick={() => setShowLearnSkill(false)}
                className="w-full py-3 bg-white/5 border border-white/10 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors mt-4"
              >
                Cerrar
              </button>
            </motion.div>
          )}

          {/* Dynamic Evolution */}
         <div className="space-y-4 pb-12">
            <h3 className="text-[10px] font-black text-white/40 tracking-[0.3em] uppercase flex items-center gap-2">
             <ArrowUpCircle size={12} className="text-[#F5C76B]" /> Senda de Evolución
            </h3>
            <div className="flex flex-col gap-3">
               {nextJobs.length > 0 ? (
                 <div className={`grid gap-3 ${nextJobs.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {nextJobs.map((nextJob) => (
                      <NineSlicePanel
                       key={nextJob.id}
                       type="border"
                       variant="default"
                       className="p-4 text-center flex flex-col items-center gap-2 cursor-pointer"
                       glassmorphism={true}
                       onClick={() => handleEvolve(nextJob.id, nextJob.name)}
                       as={motion.div}
                       whileHover={{ scale: 1.02 }}
                       whileTap={{ scale: 0.98 }}
                      >
                         <ArrowUpCircle size={24} className="text-white/20 group-hover:text-[#F5C76B]" />
                         <span className="text-[10px] font-black text-white tracking-widest uppercase">{nextJob.name}</span>
                         <div className="flex items-center gap-1.5">
                            <span className="text-[8px] font-black text-[#F5C76B]/40 uppercase tracking-tighter italic">Nivel {nextJob.evolution_requirements?.minLevel}+</span>
                         </div>
                      </NineSlicePanel>
                    ))}
                 </div>
               ) : (
                 <NineSlicePanel
                    type="border"
                    variant="default"
                    className="p-8 text-center flex flex-col items-center gap-3"
                    glassmorphism={true}
                 >
                    <div className="w-12 h-12 bg-[#F5C76B]/10 rounded-full flex items-center justify-center border border-[#F5C76B]/20">
                       <Star size={24} fill="#F5C76B" className="text-[#F5C76B]" />
                    </div>
                    <p className="text-[10px] text-white/60 font-black uppercase tracking-[0.2em]">Maestría Máxima Alcanzada</p>
                 </NineSlicePanel>
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
