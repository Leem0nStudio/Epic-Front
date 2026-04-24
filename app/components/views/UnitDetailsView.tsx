import React, { useState, useEffect } from 'react';
import { ChevronLeft, Shield, Sword, Heart, Zap, Sparkles, Wand2, Info, ArrowUpCircle, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UnitService } from '@/lib/services/unit-service';
import { EquipmentService } from '@/lib/services/equipment-service';
import { calculateFinalStats } from '@/lib/services/build-calculator';
import { supabase } from '@/lib/supabase';

interface UnitDetailsViewProps {
  unitId: string;
  onNavigate: (view: any) => void;
  onUpdate: () => void;
  onOpenInventory: (slot: 'weapon' | 'card' | 'skill') => void;
}

export function UnitDetailsView({ unitId, onNavigate, onUpdate, onOpenInventory }: UnitDetailsViewProps) {
  const [unit, setUnit] = useState<any>(null);
  const [jobDef, setJobDef] = useState<any>(null);
  const [isEvolving, setIsEvolving] = useState(false);
  const [evolvedJobName, setEvolvedJobName] = useState<string | null>(null);
  const [equippedWeapon, setEquippedWeapon] = useState<any>(null);
  const [equippedCards, setEquippedCards] = useState<any[]>([]);

  useEffect(() => {
    async function loadUnit() {
      if (!supabase) return;
      const { data: u } = await supabase.from('units').select('*').eq('id', unitId).single();
      const { data: j } = await supabase.from('job_definitions').select('*').eq('id', u.current_job_id).single();

      setUnit(u);
      setJobDef(j);

      // Fetch equipment details
      if (u.equipped_weapon_instance_id) {
        const { data: w } = await supabase.from('inventory_items').select('*, definition:item_definitions(*)').eq('id', u.equipped_weapon_instance_id).single();
        setEquippedWeapon(w);
      } else {
        setEquippedWeapon(null);
      }

      if (u.equipped_cards_instances_ids?.length > 0) {
        const { data: cards } = await supabase.from('inventory_items').select('*, definition:item_definitions(*)').in('id', u.equipped_cards_instances_ids);
        setEquippedCards(cards || []);
      } else {
        setEquippedCards([]);
      }
    }
    loadUnit();
  }, [unitId]);

  if (!unit || !jobDef) return null;

  const finalStats = calculateFinalStats(unit, jobDef, equippedWeapon?.definition, equippedCards.map(c => c.definition));

  const handleEvolve = async (targetJobId: string, jobName: string) => {
    setIsEvolving(true);
    try {
      await UnitService.evolveUnit(unit.id, targetJobId);
      setEvolvedJobName(jobName);
      onUpdate();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsEvolving(false);
    }
  };

  const handleUnequip = async (itemId: string, slot: any) => {
    try {
      await EquipmentService.unequipItem(unit.id, itemId, slot);
      onUpdate();
      // local refresh would be better, but onUpdate triggers a refresh in parent which eventually hits this via props
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300 overflow-y-auto custom-scrollbar pr-1 overflow-x-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate('party')} className="p-2 bg-[#382618] border border-[#5a4227] rounded-full hover:bg-[#4a3423] transition-colors">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-serif font-bold text-[#eacf9b] tracking-wider uppercase">{unit.name}</h1>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative w-full aspect-video bg-gradient-to-b from-[#2c1d11] to-[#1a110a] rounded border-2 border-[#5a4227] overflow-hidden mb-6 flex items-center justify-center">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
         <img src="https://raw.githubusercontent.com/Leem0nGames/gameassets/main/RO/abbys_sprite_001.png" className="w-[120%] transform translate-y-8 brightness-110 drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]" style={{imageRendering: 'pixelated'}} />

         <div className="absolute top-4 left-4 flex flex-col gap-1">
            <span className="bg-[#b53c22] text-white text-[10px] font-bold px-2 py-0.5 rounded border border-[#ea7a5d] shadow-lg">LV. {unit.level}</span>
            <span className="bg-[#1a110a]/80 text-[#eacf9b] text-[10px] font-bold px-2 py-0.5 rounded border border-[#382618] uppercase">{jobDef.name}</span>
         </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
         {[
           { label: 'HP', val: finalStats.hp, icon: Heart, color: 'text-[#ea7a5d]' },
           { label: 'ATK', val: finalStats.atk, icon: Sword, color: 'text-[#ead15d]' },
           { label: 'DEF', val: finalStats.def, icon: Shield, color: 'text-[#a68a68]' },
           { label: 'SPD', val: finalStats.agi, icon: Zap, color: 'text-[#44aaff]' },
         ].map((stat) => (
           <div key={stat.label} className="bg-[#1a110a] border border-[#382618] p-3 rounded flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <stat.icon size={16} className={stat.color} />
                 <span className="text-[10px] font-bold text-[#a68a68] uppercase">{stat.label}</span>
              </div>
              <span className="text-sm font-mono font-bold text-[#eacf9b]">{stat.val}</span>
           </div>
         ))}
      </div>

      {/* Equipment Slots */}
      <div className="mb-6">
         <h3 className="text-xs font-bold text-[#a68a68] tracking-[0.2em] uppercase mb-3 flex items-center gap-2">
           <Briefcase size={14} className="text-[#c79a5d]" /> EQUIPAMIENTO
         </h3>
         <div className="grid grid-cols-4 gap-2">
            {/* Weapon Slot */}
            <div
              onClick={() => !equippedWeapon && onOpenInventory('weapon')}
              className={`aspect-square rounded border-2 border-[#382618] flex items-center justify-center relative cursor-pointer hover:border-[#5a4227] transition-all ${equippedWeapon ? 'bg-[#2c1d11]' : 'bg-black/20'}`}
            >
               {equippedWeapon ? (
                 <>
                   <Sword size={24} className="text-[#eacf9b]" />
                   <button
                     onClick={(e) => { e.stopPropagation(); handleUnequip(equippedWeapon.id, 'weapon'); }}
                     className="absolute -top-2 -right-2 bg-[#b53c22] rounded-full p-0.5 border border-[#ea7a5d]"
                   >
                     <X size={10} />
                   </button>
                 </>
               ) : <Plus size={20} className="text-[#382618]" />}
               <span className="absolute -bottom-1 text-[7px] font-bold text-[#a68a68] bg-[#1a110a] px-1 uppercase">Arma</span>
            </div>

            {/* Card Slots */}
            {[0, 1, 2, 3].map(idx => {
                const card = equippedCards[idx];
                return (
                    <div
                        key={idx}
                        onClick={() => !card && onOpenInventory('card')}
                        className={`aspect-square rounded border-2 border-[#382618] flex items-center justify-center relative cursor-pointer hover:border-[#5a4227] transition-all ${card ? 'bg-[#2c1d11]' : 'bg-black/20'}`}
                    >
                        {card ? (
                             <>
                             <Sparkles size={24} className="text-[#cc44ff]" />
                             <button
                               onClick={(e) => { e.stopPropagation(); handleUnequip(card.id, 'card'); }}
                               className="absolute -top-2 -right-2 bg-[#b53c22] rounded-full p-0.5 border border-[#ea7a5d]"
                             >
                               <X size={10} />
                             </button>
                           </>
                        ) : <Plus size={20} className="text-[#382618]" />}
                        <span className="absolute -bottom-1 text-[7px] font-bold text-[#a68a68] bg-[#1a110a] px-1 uppercase">Carta</span>
                    </div>
                );
            })}
         </div>
      </div>

      {/* Evolution Section */}
      <div className="mb-6">
         <h3 className="text-xs font-bold text-[#a68a68] tracking-[0.2em] uppercase mb-3 flex items-center gap-2">
           <ArrowUpCircle size={14} className="text-[#c79a5d]" /> EVOLUCIÓN DE CLASE
         </h3>

         <div className="flex flex-col gap-2">
            {unit.current_job_id === 'novice' ? (
              <div className="grid grid-cols-2 gap-2">
                 <button
                   onClick={() => handleEvolve('swordman', 'Swordman')}
                   disabled={isEvolving || unit.level < 10}
                   className="bg-gradient-to-br from-[#35251a] to-[#1a110a] border border-[#5a4227] p-4 rounded text-left group hover:border-[#c79a5d] transition-all disabled:opacity-50"
                 >
                    <span className="block text-[#eacf9b] font-bold text-sm mb-1 group-hover:text-white uppercase">Swordman</span>
                    <span className="block text-[9px] text-[#a68a68]">Especialista físico</span>
                    {unit.level < 10 && <span className="block text-[8px] text-[#b53c22] mt-2 font-bold">REQ. NIVEL 10</span>}
                 </button>
                 <button
                   onClick={() => handleEvolve('mage', 'Mage')}
                   disabled={isEvolving || unit.level < 10}
                   className="bg-gradient-to-br from-[#35251a] to-[#1a110a] border border-[#5a4227] p-4 rounded text-left group hover:border-[#c79a5d] transition-all disabled:opacity-50"
                 >
                    <span className="block text-[#eacf9b] font-bold text-sm mb-1 group-hover:text-white uppercase">Mage</span>
                    <span className="block text-[9px] text-[#a68a68]">Artes místicas</span>
                    {unit.level < 10 && <span className="block text-[8px] text-[#b53c22] mt-2 font-bold">REQ. NIVEL 10</span>}
                 </button>
              </div>
            ) : (
              <div className="bg-[#2c1d11] border border-[#382618] p-4 rounded text-center">
                 <p className="text-xs text-[#a68a68] italic uppercase tracking-widest">Ramas avanzadas bloqueadas</p>
              </div>
            )}
         </div>
      </div>

      <AnimatePresence>
        {evolvedJobName && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-8 text-center"
          >
             <motion.div
               initial={{ scale: 0.5, y: 20 }}
               animate={{ scale: 1, y: 0 }}
               className="flex flex-col items-center gap-6"
             >
                <Sparkles size={80} className="text-[#ffcc00] animate-pulse" />
                <h2 className="text-3xl font-serif font-black text-[#eacf9b] tracking-[0.2em] uppercase">¡CAMBIO DE CLASE!</h2>
                <div className="flex items-center gap-4 text-xl font-bold">
                   <span className="text-[#a68a68] line-through">Novice</span>
                   <Sparkles size={24} className="text-[#c79a5d]" />
                   <span className="text-[#ffcc00] uppercase tracking-widest">{evolvedJobName}</span>
                </div>
                <p className="text-[#a68a68] text-sm max-w-xs">Has desbloqueado nuevos horizontes y habilidades para tu unidad.</p>
                <button
                  onClick={() => { setEvolvedJobName(null); onNavigate('unit_details'); }}
                  className="mt-8 bg-[#c79a5d] text-[#1a110a] font-black py-4 px-12 rounded tracking-[0.2em] hover:brightness-110 active:scale-95 transition-all"
                >
                  CONTINUAR
                </button>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

function Briefcase({ size, className }: { size: number, className?: string }) {
    return <Sword size={size} className={className} />
}
