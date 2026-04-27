import { AssetService } from '@/lib/services/asset-service';
'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, Box, Sparkles, Sword, Search, Filter } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { motion } from 'motion/react';

interface InventoryViewProps {
  targetSlot: 'weapon' | 'card' | 'skill' | null;
  onBack: () => void;
  onEquip: (item: any) => void;
}

export function InventoryView({ targetSlot, onBack, onEquip }: InventoryViewProps) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInventory() {
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase.from('inventory').select('*').eq('player_id', user.id);
      if (!error) {
          const enriched = await Promise.all(data.map(async (inv) => {
              let table = 'cards';
              if (inv.item_type === 'weapon') table = 'weapons';
              if (inv.item_type === 'skill_scroll') table = 'skills';
              const { data: def } = await supabase.from(table).select('*').eq('id', inv.item_id).single();
              return { ...inv, def };
          }));
          setItems(targetSlot ? enriched.filter(i => (targetSlot === 'weapon' && i.item_type === 'weapon') || (targetSlot === 'card' && i.item_type === 'card') || (targetSlot === 'skill' && i.item_type === 'skill_scroll')) : enriched);
      }
      setLoading(false);
    }
    loadInventory();
  }, [targetSlot]);

  return (
    <div className="flex flex-col h-full bg-[#0B1A2A] p-4 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 via-transparent to-transparent pointer-events-none" />

      <div className="flex items-center justify-between mb-6 z-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 bg-black/40 border border-white/10 rounded-xl text-white/60 hover:text-white transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div className="flex flex-col">
            <h1 className="text-xl font-black text-white tracking-widest uppercase italic">
              {targetSlot ? `Seleccionar ${targetSlot}` : 'Inventario'}
            </h1>
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Almacén de Equipo</span>
          </div>
        </div>
        <div className="flex gap-2">
           <button className="p-2 bg-black/40 border border-white/10 rounded-lg text-white/40"><Search size={16} /></button>
           <button className="p-2 bg-black/40 border border-white/10 rounded-lg text-white/40"><Filter size={16} /></button>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-t-[#F5C76B] border-white/5 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar z-10">
            {items.map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ x: 4 }}
                  onClick={() => onEquip(item)}
                  className="bg-black/40 border border-white/5 p-4 rounded-2xl flex items-center gap-4 hover:border-white/10 transition-all cursor-pointer group"
                >
                    <div className="w-14 h-14 bg-black/60 border border-white/10 rounded-xl flex items-center justify-center shrink-0 relative overflow-hidden">
                        {item.item_type === 'weapon' ? <Sword size={24} className="text-[#F5C76B]" /> :
                       item.item_type === 'card' ? <Sparkles size={24} className="text-purple-400" /> :
                       item.item_type === 'job_core' ? <img src={AssetService.getIconUrl(AssetService.getJobIconId(item.item_id.replace('core_', '')))} className="w-8 h-8 object-contain" /> :
                       <Box size={24} className="text-cyan-400" />}
                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-black text-white uppercase tracking-wider text-sm truncate">{item.def?.name || item.item_id}</span>
                          <span className="text-[8px] font-black text-[#F5C76B] bg-[#F5C76B]/10 px-1.5 rounded-sm border border-[#F5C76B]/20">UR</span>
                        </div>
                        <p className="text-[10px] text-white/40 leading-tight uppercase font-bold tracking-tight line-clamp-2">{item.def?.description || item.item_type}</p>
                    </div>
                </motion.div>
            ))}

            {items.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center gap-4 opacity-20">
                 <Box size={48} />
                 <p className="text-[10px] font-black tracking-widest uppercase">No se encontraron objetos</p>
              </div>
            )}
        </div>
      )}
    </div>
  );
}
