'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, TrendingUp, Sparkles, Target, Flame } from 'lucide-react';
import { TrainingService, TrainingResult } from '@/lib/services/training-service';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/lib/contexts/ToastContext';
import { ViewShell } from '@/components/ui/ViewShell';

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
      onUpdate();
      if (res.success) showToast('¡Entrenamiento completado!', 'success');
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setTraining(false);
    }
  };

  return (
    <ViewShell title="ENTRENAMIENTO" subtitle={unitName} onBack={onBack}>
      <div className="flex-1 flex flex-col p-6 space-y-6">

        <div className="relative flex-1 bg-black/40 border border-white/5 rounded-[40px] flex items-center justify-center overflow-hidden">
           <AnimatePresence mode="wait">
             {training ? (
               <motion.div
                 key="training"
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                 className="flex flex-col items-center gap-6"
               >
                  <motion.div
                    animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-24 h-24 border-4 border-t-[#F5C76B] border-white/10 rounded-full"
                  />
                  <p className="text-[#F5C76B] text-[11px] font-black uppercase tracking-[0.5em] animate-pulse">POTENCIANDO HABILIDADES...</p>
               </motion.div>
             ) : result?.success ? (
               <motion.div
                 key="result"
                 initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                 className="text-center p-8"
               >
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/40">
                     <TrendingUp size={40} className="text-green-400" />
                  </div>
                  <h3 className="text-2xl font-black text-white uppercase font-display mb-2">¡EXITO!</h3>
                  <div className="flex flex-col gap-1">
                     <span className="text-[10px] text-white/40 uppercase font-black">EXPERIENCIA GANADA</span>
                     <span className="text-green-400 font-black text-xl">+{result.expGained} EXP</span>
                  </div>
                  <Button variant="secondary" size="sm" className="mt-8" onClick={() => setResult(null)}>ENTRENAR MÁS</Button>
               </motion.div>
             ) : (
               <motion.div
                 key="idle"
                 className="text-center p-8 flex flex-col items-center"
               >
                  <Target size={64} className="text-white/10 mb-6" />
                  <p className="text-white/40 text-[10px] font-black uppercase tracking-widest max-w-[200px]">Selecciona un régimen para mejorar las estadísticas de tu héroe</p>
               </motion.div>
             )}
           </AnimatePresence>

           <div className="absolute top-8 left-8 w-4 h-4 border-t-2 border-l-2 border-white/10" />
           <div className="absolute bottom-8 right-8 w-4 h-4 border-b-2 border-r-2 border-white/10" />
        </div>

        <div className="grid grid-cols-1 gap-4">
           {options.map((opt: any) => (
             <button
               key={opt.id}
               onClick={() => handleTrain(opt.id)}
               disabled={training}
               className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center gap-4 hover:border-[#F5C76B]/30 hover:bg-[#F5C76B]/5 transition-all group"
             >
                <div className={`w-12 h-12 rounded-xl bg-black/40 flex items-center justify-center ${opt.id === 'elite' ? 'text-purple-400' : opt.id === 'intensive' ? 'text-blue-400' : 'text-green-400'}`}>
                   {opt.id === 'elite' ? <Sparkles size={24} /> : opt.id === 'intensive' ? <Flame size={24} /> : <Zap size={24} />}
                </div>
                <div className="flex-1 text-left">
                   <h4 className="text-sm font-black text-white uppercase tracking-tight">{opt.name}</h4>
                   <p className="text-[9px] text-white/40 uppercase">{opt.description}</p>
                </div>
                <div className="text-right">
                   <div className="flex items-center gap-1 justify-end">
                      <Zap size={10} className="text-[#F5C76B]" />
                      <span className="text-[10px] font-black text-white">{opt.energyCost}</span>
                   </div>
                   <p className="text-[8px] text-white/20 uppercase font-black mt-1">COSTO</p>
                </div>
             </button>
           ))}
        </div>
      </div>
    </ViewShell>
  );
}
