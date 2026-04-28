'use client';
import { AssetService } from '@/lib/services/asset-service';
import { UIService } from '@/lib/services/ui-service';
import { NineSlicePanel } from '@/components/ui/NineSlicePanel';
import { RarityIcon } from '@/components/ui/RarityIcon';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, Box, Sparkles, Sword, Search, Filter } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { motion } from 'motion/react';
import { SkillDetailView } from './SkillDetailView';

interface InventoryViewProps {
  targetSlot: 'weapon' | 'card' | 'skill' | null;
  fromUnitDetails: boolean;
  onBack: () => void;
  onEquip: (item: any) => void;
}

export function InventoryView({ targetSlot, fromUnitDetails, onBack, onEquip }: InventoryViewProps) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'weapon' | 'card' | 'skill'>('all');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

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
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
              {fromUnitDetails ? 'Equipar a unidad' : 'Almacén de Equipo'}
            </span>
          </div>
        </div>
        {!targetSlot && (
          <div className="flex gap-2">
             <button onClick={() => setFilter(f => f === 'all' ? 'weapon' : f === 'weapon' ? 'card' : f === 'card' ? 'skill' : 'all')} className="p-2 bg-black/40 border border-white/10 rounded-lg text-white/60 hover:text-white transition-colors">
               {filter === 'all' ? <Box size={16} /> : filter === 'weapon' ? <Sword size={16} /> : filter === 'card' ? <Sparkles size={16} /> : <Box size={16} />}
             </button>
          </div>
        )}
      </div>

      {!targetSlot && (
        <div className="mb-4 z-10">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar objeto..."
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white text-xs placeholder:text-white/20 focus:outline-none focus:border-[#F5C76B]/40"
          />
        </div>
      )}

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-t-[#F5C76B] border-white/5 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar z-10">
            {items.filter(i => {
              if (filter !== 'all' && i.item_type !== filter) return false;
              if (search && !i.def?.name?.toLowerCase().includes(search.toLowerCase()) && !i.item_id?.toLowerCase().includes(search.toLowerCase())) return false;
              return true;
            }).map((item) => (
                <NineSlicePanel
                  key={item.id}
                  type="border"
                  variant="default"
                  className="p-4 flex items-center gap-4 hover:opacity-90 transition-all cursor-pointer group relative"
                  style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
                  onClick={() => {
                    if (targetSlot) {
                      onEquip(item);
                    } else if (item.item_type === 'skill_scroll') {
                      setSelectedSkill(item.item_id);
                    } else {
                      setSelectedItem(item);
                    }
                  }}
                  as={motion.div}
                  whileHover={{ x: 4 }}
                >
                    <RarityIcon
                      rarity={item.def?.rarity || 'C'}
                      size="md"
                      className="shrink-0"
                    >
                      {item.item_type === 'weapon' ? <Sword size={24} className="text-[#F5C76B]" /> :
                       item.item_type === 'card' ? <Sparkles size={24} className="text-purple-400" /> :
                       item.item_type === 'job_core' ? <img src={AssetService.getIconUrl(AssetService.getJobIconId(item.item_id.replace('core_', '')))} className="w-8 h-8 object-contain" /> :
                       <Box size={24} className="text-cyan-400" />}
                    </RarityIcon>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-black text-white uppercase tracking-wider text-sm truncate">{item.def?.name || item.item_id}</span>
                          <span className="text-[8px] font-black text-[#F5C76B] bg-[#F5C76B]/10 px-1.5 rounded-sm border border-[#F5C76B]/20">{item.def?.rarity || 'C'}</span>
                        </div>
                        <p className="text-[10px] text-white/40 leading-tight uppercase font-bold tracking-tight line-clamp-2">{item.def?.description || item.item_type}</p>
                        {item.quantity > 1 && <span className="text-[10px] text-white/40 mt-1">x{item.quantity}</span>}
                    </div>
                </NineSlicePanel>
            ))}

            {items.filter(i => {
              if (filter !== 'all' && i.item_type !== filter) return false;
              if (search && !i.def?.name?.toLowerCase().includes(search.toLowerCase()) && !i.item_id?.toLowerCase().includes(search.toLowerCase())) return false;
              return true;
            }).length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center gap-4 opacity-20">
                 <Box size={48} />
                 <p className="text-[10px] font-black tracking-widest uppercase">No se encontraron objetos</p>
              </div>
            )}
         </div>
       )}

        {selectedItem && !targetSlot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col p-6 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <button onClick={() => setSelectedItem(null)} className="p-2 bg-black/40 border border-white/10 rounded-xl text-white/60 hover:text-white transition-colors">
                <ChevronLeft size={20} />
              </button>
              <h2 className="text-lg font-black text-white tracking-widest uppercase">Detalles</h2>
              <div className="w-8" />
            </div>

            <div className="flex-1 flex flex-col items-center justify-center gap-6">
              <RarityIcon
                rarity={selectedItem.def?.rarity || 'C'}
                size="lg"
              >
                {selectedItem.item_type === 'weapon' ? <Sword size={40} className="text-[#F5C76B]" /> :
                 selectedItem.item_type === 'card' ? <Sparkles size={40} className="text-purple-400" /> :
                 selectedItem.item_type === 'skill_scroll' ? <Sparkles size={40} className="text-cyan-400" /> :
                 <Box size={40} className="text-white/40" />}
              </RarityIcon>

              <div className="text-center">
                <h3 className="text-xl font-black text-white uppercase">{selectedItem.def?.name || selectedItem.item_id}</h3>
                <span className="text-[10px] font-black text-[#F5C76B] bg-[#F5C76B]/10 px-2 py-0.5 rounded-sm border border-[#F5C76B]/20 mt-2 inline-block">
                  {selectedItem.def?.rarity || 'C'}
                </span>
              </div>

              <p className="text-[12px] text-white/60 text-center leading-relaxed max-w-xs">
                {selectedItem.def?.description || 'Sin descripción'}
              </p>

              {selectedItem.quantity > 1 && (
                <p className="text-[12px] text-white/40">Cantidad: x{selectedItem.quantity}</p>
              )}

              <NineSlicePanel
                type="border"
                variant="default"
                className="w-full p-4"
                style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
              >
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Tipo</p>
                <p className="text-white text-sm">{selectedItem.item_type}</p>
              </NineSlicePanel>
            </div>

            <button
              onClick={() => setSelectedItem(null)}
              className="w-full py-3 bg-white/5 border border-white/10 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors mt-4"
            >
              Cerrar
            </button>
          </motion.div>
        )}

       {selectedSkill && (
         <SkillDetailView
           skillId={selectedSkill}
           itemId={items.find(i => i.item_id === selectedSkill)?.id || ''}
           onBack={() => setSelectedSkill(null)}
           onEquip={(item) => { onEquip(item); setSelectedSkill(null); }}
           onDiscard={async (itemId) => {
             if (!confirm('¿Descartar este objeto?')) return;
             if (!supabase) return;
             await supabase.from('inventory').delete().eq('id', itemId);
             setSelectedSkill(null);
             // Reload inventory
             const { data: { user } } = await supabase.auth.getUser();
             if (user) {
               const { data } = await supabase.from('inventory').select('*').eq('player_id', user.id);
               if (data) setItems(data);
             }
           }}
         />
       )}
    </div>
  );
}
