'use client';
import { AssetService } from '@/lib/services/asset-service';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  Sword,
  Shield,
  Zap,
  Sparkles,
  ArrowUpCircle,
  Activity,
  Package,
  GripVertical
} from 'lucide-react';
import { UnitService } from '@/lib/services/unit-service';
import { EvolutionService } from '@/lib/rpg-system/evolution';
import { UnitStats, JobDefinition } from '@/lib/rpg-system/types';
import { AssetHelper } from '@/lib/utils/asset-helper';
import { GameTooltip } from '@/components/ui/GameTooltip';
import { useNotification } from '@/components/ui/NotificationOverlay';

interface UnitDetailsViewProps {
  unitId: string;
  onNavigate: (view: any) => void;
  onUpdate: () => void;
  onOpenInventory: (slot: 'weapon' | 'card' | 'skill') => void;
}

export function UnitDetailsView({ unitId, onNavigate, onUpdate, onOpenInventory }: UnitDetailsViewProps) {
  const [data, setData] = useState<any>(null);
  const [evolutions, setEvolutions] = useState<JobDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const { notify } = useNotification();

  useEffect(() => {
    async function load() {
      const details = await UnitService.getUnitDetails(unitId);
      setData(details);
      const nextJobs = await EvolutionService.getAvailableEvolutions(details.unit);
      setEvolutions(nextJobs);
      setLoading(false);
    }
    load();
  }, [unitId]);

  const handleEvolve = async (jobId: string) => {
    try {
      await UnitService.evolveUnit(unitId, jobId);
      notify('success', 'Evolución Completada', 'Tu héroe ha alcanzado un nuevo nivel de poder.');
      onUpdate();
      onNavigate('party');
    } catch (e: any) {
      notify('error', 'Error de Evolución', e.message || "Condiciones no cumplidas");
    }
  };

  if (loading || !data) return <div className="flex-1 bg-[#020508]" />;

  const { unit, job, weapon, cards, skills, finalStats } = data;
  const sprite = AssetHelper.getUnitSprite(job.id);

  return (
    <div className="flex flex-col h-full bg-[#020508] overflow-hidden relative font-sans">
      {/* Header */}
      <div className="p-6 flex items-center justify-between border-b border-white/5 bg-[#0B1A2A] z-10">
        <button onClick={() => onNavigate('party')} className="text-white/40 hover:text-white flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors"><ChevronLeft size={16} /> Plantel</button>
        <div className="flex flex-col items-center">
            <span className="text-[10px] text-[#F5C76B] font-black uppercase tracking-[0.4em] italic">Registro de Héroe</span>
            <span className="text-[9px] text-white/20 font-mono tracking-widest mt-0.5 uppercase">{unit.id.split('-')[0]}</span>
        </div>
        <div className="w-16"></div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8 pb-12">

        {/* Main Unit Card */}
        <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-t from-blue-600/10 to-transparent blur-3xl rounded-full" />
            <div className="relative bg-white/5 border border-white/10 rounded-[40px] p-8 overflow-hidden group">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex flex-col text-left">
                        <span className="text-2xl font-black text-white uppercase tracking-widest italic">{unit.name}</span>
                        <span className="text-[10px] font-black text-[#F5C76B] uppercase tracking-[0.2em]">{job.name} Tier {job.tier}</span>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-[#F5C76B] flex flex-col items-center justify-center text-black">
                        <span className="text-[8px] font-black uppercase leading-none">Nivel</span>
                        <span className="text-xl font-black italic leading-none">{unit.level}</span>
                    </div>
                </div>

                <div className="flex items-center justify-center py-6 relative">
                    <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="relative z-10">
                        <img
                          src={sprite}
                          className="w-48 transform translate-y-4"
                          style={{imageRendering: 'pixelated'}}
                        />
                    </motion.div>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-6">
                   <StatBox label="ATK" value={finalStats.atk} base={unit.base_stats.atk} icon={<Sword size={10} />} color="text-red-400" />
                   <StatBox label="DEF" value={finalStats.def} base={unit.base_stats.def} icon={<Shield size={10} />} color="text-blue-400" />
                   <StatBox label="AGI" value={finalStats.agi} base={unit.base_stats.agi} icon={<Activity size={10} />} color="text-green-400" />
                   <StatBox label="HP" value={finalStats.hp} base={unit.base_stats.hp} icon={<Zap size={10} />} color="text-cyan-400" />
                   <StatBox label="MATK" value={finalStats.matk} base={unit.base_stats.matk} icon={<Sparkles size={10} />} color="text-purple-400" />
                   <StatBox label="MDEF" value={finalStats.mdef} base={unit.base_stats.mdef} icon={<Shield size={10} />} color="text-indigo-400" />
                </div>
            </div>
        </div>

        {/* Equipment & Skills */}
        <div className="grid grid-cols-1 gap-4">
            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] px-2 flex items-center gap-2 text-left">
                <Package size={12} /> Configuración de Combate
            </h3>

            <EquipSlot label="Arma" item={weapon} onOpen={() => onOpenInventory('weapon')} icon={<Sword size={14} />} type="weapon" />

            <div className="grid grid-cols-3 gap-3">
                {[0, 1, 2].map(i => (
                    <EquipSlot key={i} mini label="Carta" item={cards[i]} onOpen={() => onOpenInventory('card')} icon={<Sparkles size={12} />} type="card" />
                ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
                {[0, 1].map(i => (
                    <EquipSlot key={i} label="Skill" item={skills[i]} onOpen={() => onOpenInventory('skill')} icon={<Zap size={14} />} type="skill" />
                ))}
            </div>
        </div>

        {/* Evolution Section */}
        {evolutions.length > 0 && (
            <div className="space-y-4">
                <h3 className="text-[10px] font-black text-[#F5C76B] uppercase tracking-[0.3em] px-2 flex items-center gap-2 text-left">
                    <ArrowUpCircle size={12} /> Sendas de Evolución
                </h3>
                <div className="grid grid-cols-1 gap-3">
                    {evolutions.map(evo => (
                        <button
                          key={evo.id}
                          onClick={() => handleEvolve(evo.id)}
                          className="w-full bg-white/5 border border-[#F5C76B]/20 hover:border-[#F5C76B]/60 p-4 rounded-3xl flex items-center justify-between transition-all group"
                        >
                            <div className="flex flex-col text-left">
                                <span className="text-xs font-black text-white uppercase tracking-wider">{evo.name}</span>
                                <span className="text-[8px] font-black text-white/40 uppercase tracking-widest mt-1">Tier {evo.tier} • Requerido Lvl {evo.evolution_requirements.minLevel}</span>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-[#F5C76B]/10 flex items-center justify-center text-[#F5C76B] group-hover:bg-[#F5C76B] group-hover:text-black transition-colors">
                                <ArrowUpCircle size={20} />
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
}

function StatBox({ label, value, base, icon, color }: any) {
    return (
        <GameTooltip content={
            <div className="flex flex-col gap-1">
                <span className="text-[9px] font-black text-white/60 uppercase tracking-widest">Base: {base}</span>
                <span className="text-[8px] text-white/40 uppercase font-bold">+ Modificadores Activos</span>
            </div>
        }>
            <div className="bg-black/40 border border-white/5 p-3 rounded-2xl flex flex-col gap-1 cursor-help">
                <div className={`flex items-center gap-1.5 ${color} opacity-60`}>
                    {icon}
                    <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
                </div>
                <span className="text-xs font-bold text-white font-mono">{value}</span>
            </div>
        </GameTooltip>
    );
}

function EquipSlot({ label, item, onOpen, icon, mini = false, type }: any) {
    const asset = item ? AssetHelper.getItemIcon(item.id, type) : null;

    return (
        <button
            onClick={onOpen}
            className={`relative bg-white/5 border border-white/10 rounded-3xl flex items-center transition-all hover:bg-white/10 active:scale-95 ${mini ? 'flex-col gap-2 p-3 text-center' : 'p-4 gap-4'}`}
        >
            <div className={`${mini ? 'w-10 h-10' : 'w-12 h-12'} rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center text-white/20 overflow-hidden`}>
                {asset ? <img src={asset} className="w-full h-full object-cover" /> : icon}
            </div>
            <div className={`flex flex-col ${mini ? 'items-center' : 'items-start'}`}>
                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">{label}</span>
                <span className={`font-black uppercase tracking-wider ${mini ? 'text-[9px]' : 'text-xs'} ${item ? 'text-white' : 'text-white/10'}`}>
                    {item ? item.name : 'Vacio'}
                </span>
            </div>
        </button>
    );
}
