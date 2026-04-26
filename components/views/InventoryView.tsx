'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  Package,
  Sword,
  Sparkles,
  Zap,
  Search,
  CheckCircle2,
  Info
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AssetHelper } from '@/lib/utils/asset-helper';
import { GameTooltip } from '@/components/ui/GameTooltip';

interface InventoryViewProps {
  targetSlot: 'weapon' | 'card' | 'skill' | null;
  onBack: () => void;
  onEquip: (item: any) => void;
}

export function InventoryView({ targetSlot, onBack, onEquip }: InventoryViewProps) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('inventory')
        .select('*')
        .eq('player_id', user.id);

      const filtered = (data || []).filter(item => {
        if (targetSlot === 'weapon') return item.item_type === 'weapon';
        if (targetSlot === 'card') return item.item_type === 'card';
        if (targetSlot === 'skill') return item.item_type === 'skill' || item.item_type === 'skill_scroll';
        return true;
      });

      setItems(filtered.map(i => ({ ...i, name: i.item_id.split('_').map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ') })));
      setLoading(false);
    }
    load();
  }, [targetSlot]);

  return (
    <div className="flex flex-col h-full bg-[#020508] overflow-hidden relative">
      <div className="p-6 flex items-center justify-between border-b border-white/5 bg-[#0B1A2A] z-10">
        <button onClick={onBack} className="text-white/40 hover:text-white flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors"><ChevronLeft size={16} /> Detalle</button>
        <div className="flex flex-col items-center">
            <span className="text-[10px] text-[#F5C76B] font-black uppercase tracking-[0.4em] italic">Almacén de Equipo</span>
            <span className="text-[9px] text-white/20 font-mono tracking-widest mt-0.5 uppercase">Categoría: {targetSlot}</span>
        </div>
        <div className="w-16"></div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(168,85,247,0.05),transparent)] pointer-events-none" />

        {loading ? (
            <div className="flex justify-center py-20 opacity-20"><Package size={48} className="animate-bounce" /></div>
        ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-20 opacity-20">
                <Search size={48} />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Sin objetos disponibles</span>
            </div>
        ) : (
            <div className="grid grid-cols-1 gap-3">
                {items.map((item, i) => (
                    <motion.button
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => onEquip(item)}
                        className="group relative bg-white/5 border border-white/10 p-4 rounded-3xl flex items-center justify-between hover:border-[#F5C76B]/40 hover:bg-white/10 transition-all active:scale-95 overflow-hidden"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center text-[#F5C76B] overflow-hidden">
                                <img src={AssetHelper.getItemIcon(item.item_id, item.item_type)} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex flex-col text-left">
                                <span className="text-xs font-black text-white uppercase tracking-wider">{item.name}</span>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[7px] text-white/20 font-black uppercase tracking-widest">{item.item_type}</span>
                                    <div className="w-1 h-1 rounded-full bg-white/10" />
                                    <span className="text-[7px] text-[#F5C76B] font-black uppercase tracking-widest">Cantidad: {item.quantity}</span>
                                </div>
                            </div>
                        </div>
                        <CheckCircle2 size={18} className="text-white/5 group-hover:text-[#F5C76B] transition-colors" />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#F5C76B]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.button>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}
