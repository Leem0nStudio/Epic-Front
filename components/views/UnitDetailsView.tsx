'use client';
import React, { useState, useEffect } from 'react';
import { AssetService } from '@/lib/services/asset-service';
import { supabase } from '@/lib/supabase';
import { UnitService } from '@/lib/services/unit-service';
import { EquipmentService } from '@/lib/services/equipment-service';
import { PanelButton } from '@/components/ui/PanelButton';
import { NineSlicePanel } from '@/components/ui/NineSlicePanel';
import { RarityIcon } from '@/components/ui/RarityIcon';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { RARITY_COLORS, getRarityCode } from '@/lib/config/assets-config';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Shield, Sword, Zap, Heart, Star, Briefcase, Sparkles, Box, Plus, X, ArrowUpCircle, ShieldAlert } from 'lucide-react';
import { useToast } from '@/lib/contexts/ToastContext';

interface UnitDetailsViewProps {
  unitId: string;
  onNavigate: (view: any) => void;
  onUpdate: () => void;
  onOpenInventory: (type: 'card' | 'weapon' | 'skill') => void;
}

export function UnitDetailsView({ unitId, onNavigate, onUpdate, onOpenInventory }: UnitDetailsViewProps) {
  const { showToast, confirm } = useToast();
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
      showToast('Objeto desequipado', 'success');
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  const handleEvolve = async (targetJobId: string, jobName: string) => {
    const confirmed = await confirm(`¿Deseas evolucionar a ${jobName}?`);
    if (!confirmed) return;
    try {
      await UnitService.evolveUnit(unitId, targetJobId);
      setEvolvedJobName(jobName);
      loadData();
      onUpdate();
      showToast(`Evolucionado a ${jobName}`, 'success');
    } catch (e: any) {
      showToast("Requisitos insuficientes: " + e.message, 'error');
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
      <div className="flex-1 flex items-center justify-center bg-[#0B1A2A] p-8">
        <ErrorDisplay
          title="Error de Memoria"
          message={error || 'Datos no encontrados'}
          onRetry={() => onNavigate('party')}
        />
      </div>
    );
  }

  const { unit, job, weapon, cards, skills, finalStats } = data;

  return (
    <div className="flex flex-col h-full bg-[#0B1A2A] bg-cover bg-center bg-no-repeat overflow-hidden relative" style={{ backgroundImage: `url('${AssetService.getBgUrl('party')}')` }}>
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-transparent to-transparent pointer-events-none" />

       {/* Top Navigation */}
       <div className="flex items-center justify-between p-6 z-20 sticky top-0 bg-[#0B1A2A]/40 backdrop-blur-md border-b border-white/5">
          <Button 
            onClick={() => onNavigate('party')} 
            variant="secondary"
            size="sm"
            className="!rounded-2xl"
          >
             <ChevronLeft size={20} />
          </Button>
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
                <Sparkles size={14} className="mr-1.5" />
                Aprender Habilidad
              </Button>
            </div>
          )}
                  </motion.div>
                );
               })}
            </div>
          </div>

          {/* Learn Skill Button */}
          {data && (
            <div className="flex justify-center mt-4">
              <Button
                onClick={() => { setShowLearnSkill(true); loadAvailableSkills(); }}
                variant="secondary"
                size="sm"
                className="!rounded-xl border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20"
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
                <Button onClick={() => setSelectedSkill(null)} variant="secondary" size="sm" className="!rounded-2xl">
                  <ChevronLeft size={20} />
                </Button>
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
                  <div className="w-full p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-xl shadow-2xl">
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
                    <p className="text-white text-2xl font-black italic">{selectedSkill.def?.scaling ? JSON.parse(selectedSkill.def.scaling).mult + 'x' : '1.0x'}</p>
                  </div>
                </div>

                {selectedSkill.def?.effect && (
                  <div className="w-full p-6 bg-cyan-500/5 rounded-3xl border border-cyan-500/10 backdrop-blur-xl">
                    <p className="text-[9px] font-black text-cyan-400/60 uppercase tracking-[0.3em] mb-2">Protocolo de Efecto</p>
                    <p className="text-white/80 text-sm font-medium">{selectedSkill.def.effect}</p>
                  </div>
                )}
              </div>

               <Button
                  onClick={() => setSelectedSkill(null)}
                  variant="secondary"
                  size="lg"
                  className="w-full mt-8 !rounded-[32px]"
                >
                  Cerrar Transmisión
                </Button>
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
                <Button onClick={() => setShowLearnSkill(false)} variant="secondary" size="sm" className="!rounded-2xl">
                  <ChevronLeft size={20} />
                </Button>
                <h2 className="text-lg font-black text-white tracking-[0.3em] uppercase italic">Centro de Entrenamiento</h2>
                <div className="w-10" />
              </div>

              {loadingSkills ? (
                <div className="flex-1 flex items-center justify-center">
                  <LoadingSpinner text="Escaneando Datos..." />
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
                          const confirmed = await confirm(`¿Aprender ${skill.name} por 500 Zeny?`);
                          if (!confirmed) return;
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
                            showToast('Habilidad aprendida!', 'success');
                            setShowLearnSkill(false);
                            loadData();
                          } catch (e: any) {
                            showToast(e.message || 'Error al aprender habilidad', 'error');
                          }
                        }}
                        className={`p-6 rounded-3xl border backdrop-blur-xl transition-all shadow-2xl ${
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

              <Button
                onClick={() => setShowLearnSkill(false)}
                variant="secondary"
                size="lg"
                className="w-full mt-8 !rounded-[32px]"
              >
                Cerrar Protocolo
              </Button>
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
                        className="p-6 text-center flex flex-col items-center gap-3 cursor-pointer bg-gradient-to-b from-white/10 to-white/5 border border-white/10 rounded-3xl shadow-2xl group transition-all"
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
                  <div className="p-10 text-center flex flex-col items-center gap-4 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl">
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
              <Button
                onClick={() => setEvolvedJobName(null)}
                variant="primary"
                size="lg"
                className="mt-12 !rounded-[32px]"
              >
                Continuar Destino
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
