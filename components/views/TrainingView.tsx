'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Zap, ArrowLeft, TrendingUp, Star } from 'lucide-react';
import { TrainingService, TrainingResult } from '@/lib/services/training-service';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/lib/contexts/ToastContext';

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

      {/* Header */}
      <div className="flex items-center gap-4 mb-6 z-10">
        <button onClick={onBack} className="text-white/40 hover:text-white flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors">
          <ArrowLeft size={16} /> Volver
        </button>
        <div className="flex flex-col">
          <h1 className="view-title">Entrenamiento</h1>
          <span className="text-[10px] text-white/40 uppercase tracking-wider mt-0.5">
            {unitName}
          </span>
        </div>
      </div>

      {/* Training Options */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar z-10">
        {options.map((opt, idx) => (
          <motion.div
            key={opt.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white/5 border border-white/10 rounded-3xl p-5 hover:border-[#F5C76B]/40 transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#F5C76B]/10 border border-[#F5C76B]/20 flex items-center justify-center text-2xl">
                  {opt.icon}
                </div>
                <div>
                  <h3 className="text-white font-black text-lg uppercase tracking-wider">{opt.name}</h3>
                  <p className="text-[9px] text-white/40 uppercase tracking-wider">{opt.description}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-[#F5C76B]">
                  <TrendingUp size={14} />
                  <span className="text-sm font-black">+{opt.expGain} EXP</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-white/40">
                <Zap size={12} />
                <span className="text-[10px] font-bold">Costo: {opt.energyCost}</span>
              </div>

              <Button
                onClick={() => handleTrain(opt.id as any)}
                disabled={training}
                variant="action"
                size="md"
              >
                {training ? 'Entrenando...' : 'Entrenar'}
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Result */}
      {result && result.success && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 p-4 bg-[#34D399]/10 border border-[#34D399]/20 rounded-2xl flex items-center gap-3"
        >
          <Star size={20} className="text-[#34D399]" />
          <div>
            <p className="text-[#34D399] font-black text-sm">¡{result.message}!</p>
            {result.newLevel && (
              <p className="text-white/60 text-[10px]">¡Subiste al nivel {result.newLevel}!</p>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
