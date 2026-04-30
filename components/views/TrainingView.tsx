'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, ArrowLeft, TrendingUp, Star, Sparkles, Target, Flame } from 'lucide-react';
import { TrainingService, TrainingResult } from '@/lib/services/training-service';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/lib/contexts/ToastContext';
import { NineSlicePanel } from '@/components/ui/NineSlicePanel';

interface TrainingViewProps {
  unitId: string;
  unitName: string;
  onBack: () => void;
  onUpdate: () => void;
}

export function TrainingView({ unitId, unitName, onBack, onUpdate }: TrainingViewProps) {
  const { showToast } = useToast();
  const [training, setTraining] = useState(false);
  const [result, setResult] = useState<TrainingResult | null>(null);

  const options = TrainingService.getTrainingOptions();

  const handleTrain = async (type: 'basic' | 'intensive' | 'elite') => {
    setTraining(true);
    setResult(null);

    try {
      const res = await TrainingService.trainUnit(unitId, type);
      setResult(res);

      if (res.success) {
        showToast(res.message || '¡Entrenamiento completado!', 'success');
        onUpdate();
      } else {
        showToast(res.message || 'Error en entrenamiento', 'error');
      }
    } catch (e: any) {
      showToast(e.message || 'Error desconocido', 'error');
    } finally {
      setTraining(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0B1A2A] p-6 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-b from-[#F5C76B]/5 via-transparent to-transparent pointer-events-none" />
      
      {/* Background Animated Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] aspect-square bg-[#F5C76B]/5 blur-[120px] rounded-full pointer-events-none animate-pulse" />

      {/* Header */}
      <div className="flex items-center gap-5 mb-8 z-10">
        <button 
          onClick={onBack} 
          className="p-3 bg-white/5 border border-white/10 rounded-2xl text-white/60 hover:text-white hover:bg-white/10 transition-all active:scale-95 shadow-lg btn-back"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex flex-col">
          <h1 className="text-2xl font-black text-white italic tracking-tighter uppercase font-display leading-none">
            Campo de Entrenamiento
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <div className="h-[1px] w-8 bg-gradient-to-l from-[#F5C76B] to-transparent" />
            <span className="text-[10px] font-black text-[#F5C76B] uppercase tracking-widest font-stats">
              {unitName}
            </span>
          </div>
        </div>
      </div>

      {/* Training Options */}
      <div className="flex-1 overflow-y-auto space-y-5 pr-1 custom-scrollbar z-10 pb-8">
        {options.map((opt, idx) => (
          <motion.div
            key={opt.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <NineSlicePanel
              type="border"
              variant="default"
              className="p-6 glass-frosted frame-earthstone group transition-all hover:border-[#F5C76B]/40"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                    {opt.id === 'basic' ? <Target className="text-blue-400" /> : 
                     opt.id === 'intensive' ? <Flame className="text-orange-400" /> : 
                     <Sparkles className="text-[#F5C76B]" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white uppercase italic tracking-wider font-display">
                      {opt.name}
                    </h3>
                    <p className="text-[10px] text-white/50 uppercase tracking-widest font-stats leading-tight max-w-[200px]">
                      {opt.description}
                    </p>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <div className="flex items-center gap-1.5 text-[#F5C76B] bg-[#F5C76B]/10 px-3 py-1 rounded-full border border-[#F5C76B]/20">
                    <TrendingUp size={12} />
                    <span className="text-xs font-black font-stats">+{opt.expGain} EXP</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-white/5 pt-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                    <Zap size={14} className="text-purple-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-white/30 uppercase tracking-widest leading-none mb-1">Costo de Energía</span>
                    <span className="text-xs font-black text-white leading-none font-stats">{opt.energyCost} ZAP</span>
                  </div>
                </div>

                <Button
                  onClick={() => handleTrain(opt.id as any)}
                  disabled={training}
                  variant="primary"
                  className="!rounded-2xl px-8 font-black uppercase italic tracking-widest text-xs"
                >
                  {training ? 'PROCESANDO...' : 'ENTRENAR'}
                </Button>
              </div>
            </NineSlicePanel>
          </motion.div>
        ))}
      </div>

      {/* Result Backdrop Overlay */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-6"
            onClick={() => setResult(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <NineSlicePanel type="border" className="p-8 max-w-sm w-full glass-frosted frame-earthstone text-center">
                {result.success ? (
                  <>
                    <div className="relative inline-block mb-6">
                      <Sparkles size={64} className="text-[#F5C76B] animate-pulse" />
                      <div className="absolute inset-0 bg-[#F5C76B] blur-3xl opacity-20 scale-150" />
                    </div>
                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter font-display mb-2">
                      ¡Entrenamiento Exitoso!
                    </h2>
                    <p className="text-white/60 text-[10px] uppercase tracking-[0.2em] font-stats mb-6">
                      Sincronización de datos completada
                    </p>
                    
                    <div className="grid grid-cols-1 gap-3 mb-8">
                       <div className="p-4 bg-[#F5C76B]/10 border border-[#F5C76B]/20 rounded-2xl">
                          <span className="text-[9px] font-black text-[#F5C76B]/60 uppercase tracking-widest block mb-1">Experiencia Ganada</span>
                          <span className="text-2xl font-black text-[#F5C76B] font-display italic">+{result.expGained} EXP</span>
                       </div>
                       {result.newLevel && (
                         <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                            <span className="text-[9px] font-black text-blue-400/60 uppercase tracking-widest block mb-1">Nueva Capacidad</span>
                            <span className="text-2xl font-black text-white font-display italic">Nivel {result.newLevel}</span>
                         </div>
                       )}
                    </div>
                  </>
                ) : (
                  <>
                    <Zap size={64} className="text-red-400 mx-auto mb-6" />
                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter font-display mb-2">
                      Falla de Sistema
                    </h2>
                    <p className="text-red-400/80 text-xs font-black uppercase tracking-widest font-stats mb-8">
                      {result.message}
                    </p>
                  </>
                )}
                
                <Button onClick={() => setResult(null)} variant="secondary" className="w-full !rounded-2xl font-black py-4">
                  CONTINUAR
                </Button>
              </NineSlicePanel>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
