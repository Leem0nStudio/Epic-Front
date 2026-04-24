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

      const { data, error } = await supabase
        .from('inventory_items')
        .select(`
            *,
            definition:item_definitions (*)
        `)
        .eq('owner_id', user.id);

      if (error) {
          console.error(error);
      } else {
          // Filter by type if targetSlot is provided
          const filtered = targetSlot
            ? data.filter(i => i.definition.type === targetSlot)
            : data;
          setItems(filtered);
      }
      setLoading(false);
    }
    loadInventory();
  }, [targetSlot]);

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 bg-[#382618] border border-[#5a4227] rounded-full hover:bg-[#4a3423] transition-colors">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl font-serif font-bold text-[#eacf9b] tracking-wider uppercase">
            {targetSlot ? `EQUIPAR ${targetSlot}` : 'INVENTARIO'}
        </h1>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-t-[#c79a5d] border-[#382618] rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar flex flex-col gap-2">
            {items.map((item) => (
                <div
                    key={item.id}
                    onClick={() => onEquip(item)}
                    className="bg-[#2c1d11] border border-[#5a4227] p-3 rounded flex items-center gap-4 hover:border-[#c79a5d] transition-all cursor-pointer group"
                >
                    <div className="w-12 h-12 bg-black/40 rounded flex items-center justify-center border border-[#382618]">
                        {item.definition.type === 'weapon' ? <Sword size={20} className="text-[#ead15d]" /> : <Box size={20} className="text-[#a68a68]" />}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-[#f2e6d5]">{item.definition.name}</span>
                            <span className={`text-[9px] font-bold uppercase ${
                                item.definition.rarity === 'legendary' ? 'text-[#ffaa00]' :
                                item.definition.rarity === 'epic' ? 'text-[#cc44ff]' :
                                'text-[#a68a68]'
                            }`}>{item.definition.rarity}</span>
                        </div>
                        <p className="text-[10px] text-[#a68a68] leading-tight mt-1">{item.definition.description}</p>
                    </div>
                </div>
            ))}

            {items.length === 0 && (
                <div className="py-20 text-center opacity-40 italic text-sm">
                    No se encontraron objetos de este tipo.
                </div>
            )}
        </div>
      )}
    </div>
  );
}
