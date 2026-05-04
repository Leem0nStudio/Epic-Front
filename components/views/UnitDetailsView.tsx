'use client';
import React, { useState, useEffect } from 'react';
import { AssetService } from '@/lib/services/asset-service';
import { UnitService } from '@/lib/services/unit-service';
import { EquipmentService } from '@/lib/services/equipment-service';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Sword, Zap, Heart, Star, Briefcase, Sparkles, Box, Plus, ArrowUpCircle } from 'lucide-react';
import { ViewShell } from '@/components/ui/ViewShell';
import { Button } from '@/components/ui/Button';

interface UnitDetailsViewProps {
  unitId: string;
  onNavigate: (view: any) => void;
  onUpdate: () => void;
  onOpenInventory: (type: 'card' | 'weapon' | 'skill') => void;
  onOpenCardDetails: (cardId: string, itemId: string) => void;
}

export function UnitDetailsView({ unitId, onNavigate, onUpdate, onOpenInventory, onOpenCardDetails }: UnitDetailsViewProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const details = await UnitService.getUnitDetails(unitId);
        setData(details);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [unitId]);

  const handleEvolve = async (jobId: string) => {
    try {
      await UnitService.evolveUnit(unitId, jobId);
      const details = await UnitService.getUnitDetails(unitId);
      setData(details);
      onUpdate();
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <ViewShell
      title="DETALLES"
      subtitle={data?.unit?.name || "Cargando..."}
      onBack={() => onNavigate('party')}
      loading={loading}
      error={error}
    >
      <div className="flex-1 flex flex-col p-6 space-y-6 overflow-y-auto custom-scrollbar pb-24">

        {/* Character Hero Section */}
        <div className="relative h-64 flex items-center justify-center">
           <div className="absolute inset-0 bg-gradient-to-b from-[#F5C76B]/5 to-transparent rounded-[40px]" />
           <motion.img
             initial={{ scale: 0.8, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             src={AssetService.getSpriteUrl(data?.unit?.sprite_id)}
             className="w-64 h-64 object-contain pixel-art drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)] z-10"
             alt=""
           />
           <div className="absolute bottom-4 w-40 h-8 bg-black/60 blur-xl rounded-[100%] scale-x-150" />
        </div>

        {/* Level & Job */}
        <div className="flex items-center justify-between bg-white/5 border border-white/5 rounded-2xl p-4">
           <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#F5C76B] flex items-center justify-center text-[#0B1A2A] font-black text-lg">
                 {data?.unit?.level || 1}
              </div>
              <div>
                 <p className="text-[10px] font-black text-[#F5C76B] uppercase tracking-widest leading-none">CLASE ACTUAL</p>
                 <h3 className="text-xl font-black text-white uppercase font-display tracking-tight mt-1">{data?.unit?.current_job_id}</h3>
              </div>
           </div>
           <Button variant="ghost" size="sm" onClick={() => {}} className="border-[#F5C76B]/20 text-[#F5C76B]">
              <ArrowUpCircle size={14} className="mr-2" />
              EVOLUCIONAR
           </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
           <StatBox label="ATAQUE" value={data?.calculatedStats?.atk} icon={Sword} color="text-red-400" />
           <StatBox label="SALUD" value={data?.calculatedStats?.hp} icon={Heart} color="text-green-400" />
           <StatBox label="DEFENSA" value={data?.calculatedStats?.def} icon={Shield} color="text-blue-400" />
           <StatBox label="VELOCIDAD" value={data?.calculatedStats?.agi} icon={Zap} color="text-cyan-400" />
        </div>

        {/* Equipment Section */}
        <div className="space-y-4">
           <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">EQUIPAMIENTO</h3>
           <div className="grid grid-cols-3 gap-4">
              <EquipSlot
                type="weapon"
                item={data?.equipment?.weapon}
                onClick={() => onOpenInventory('weapon')}
              />
              <EquipSlot
                type="card"
                item={data?.equipment?.cards?.[0]}
                onClick={() => onOpenInventory('card')}
              />
              <EquipSlot
                type="skill"
                item={data?.equipment?.skills?.[0]}
                onClick={() => onOpenInventory('skill')}
              />
           </div>
        </div>
      </div>
    </ViewShell>
  );
}

function StatBox({ label, value, icon: Icon, color }: any) {
  return (
    <div className="bg-black/40 border border-white/5 p-4 rounded-2xl flex items-center gap-3">
       <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${color}`}>
          <Icon size={18} />
       </div>
       <div>
          <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">{label}</p>
          <p className="text-lg font-black text-white tabular-nums leading-none">{value || 0}</p>
       </div>
    </div>
  );
}

function EquipSlot({ type, item, onClick }: any) {
  const isWeapon = type === 'weapon';
  const isCard = type === 'card';
  const isSkill = type === 'skill';

  return (
    <div
      onClick={onClick}
      className={`aspect-square rounded-2xl border-2 border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#F5C76B]/40 hover:bg-[#F5C76B]/5 transition-all relative overflow-hidden group ${item ? 'border-solid border-[#F5C76B]/40 bg-[#F5C76B]/5' : ''}`}
    >
       {item ? (
         <>
            {isCard && <img src={AssetService.getCardUrl(item.item_id)} className="w-full h-full object-cover" alt=""
                            onError={(e) => { e.currentTarget.src = AssetService.getCardUrlFallback(item.item_id); }} />}
            {isWeapon && <Sword size={24} className="text-[#F5C76B]" />}
            {isSkill && <Sparkles size={24} className="text-[#F5C76B]" />}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
               <span className="text-[8px] font-black text-white">CAMBIAR</span>
            </div>
         </>
       ) : (
         <>
            {isWeapon && <Sword size={20} className="opacity-10" />}
            {isCard && <Box size={20} className="opacity-10" />}
            {isSkill && <Sparkles size={20} className="opacity-10" />}
            <span className="text-[8px] font-black text-white/20 uppercase">{type}</span>
         </>
       )}
    </div>
  );
}
