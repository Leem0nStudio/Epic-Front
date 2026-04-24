'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, Box, Sparkles, Sword } from 'lucide-react';
import { supabase } from '@/lib/supabase';

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
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300 overflow-hidden">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 bg-[#382618] border border-[#5a4227] rounded-full hover:bg-[#4a3423] transition-colors"><ChevronLeft size={20} /></button>
        <h1 className="text-xl font-serif font-black text-[#eacf9b] tracking-wider uppercase">{targetSlot ? `Equipar ${targetSlot}` : 'Inventario'}</h1>
      </div>
      {loading ? (<div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-4 border-t-[#c79a5d] border-[#382618] rounded-full animate-spin"></div></div>) : (
        <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar flex flex-col gap-3">
            {items.map((item) => (
                <div key={item.id} onClick={() => onEquip(item)} className="bg-[#1a110a] border-2 border-[#382618] p-4 rounded-xl flex items-center gap-4 hover:border-[#c79a5d] transition-all cursor-pointer">
                    <div className="w-12 h-12 bg-[#0d0805] border border-[#382618] rounded-lg flex items-center justify-center shrink-0">
                        {item.item_type === 'weapon' ? <Sword size={24} className="text-[#ead15d]" /> : item.item_type === 'card' ? <Sparkles size={24} className="text-[#cc44ff]" /> : <Box size={24} className="text-[#44aaff]" />}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between"><span className="font-black text-[#f2e6d5] uppercase tracking-tight text-sm">{item.def?.name || item.item_id}</span></div>
                        <p className="text-[10px] text-[#a68a68] leading-tight mt-1 uppercase font-bold">{item.def?.description || item.item_type}</p>
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
}
