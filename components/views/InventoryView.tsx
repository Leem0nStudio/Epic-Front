'use client';
import { AssetService } from '@/lib/services/asset-service';
import { UIService } from '@/lib/services/ui-service';
import { NineSlicePanel } from '@/components/ui/NineSlicePanel';
import { RarityIcon } from '@/components/ui/RarityIcon';
import { SpriteAtlasIcon } from '@/components/ui/SpriteAtlasIcon';
import { Button } from '@/components/ui/Button';
import { SPRITE_INDEX } from '@/lib/config/sprite-atlas-config';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Box, Sparkles, Sword, Search, Filter, Zap } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { motion } from 'motion/react';
import { SkillDetailView } from './SkillDetailView';
import { useToast } from '@/lib/contexts/ToastContext';

interface InventoryViewProps {
  targetSlot: 'weapon' | 'card' | 'skill' | null;
  fromUnitDetails: boolean;
  onBack: () => void;
  onEquip: (item: any) => void;
  onOpenCardDetails: (cardId: string, itemId: string) => void;
}

export function InventoryView({ targetSlot, fromUnitDetails, onBack, onEquip, onOpenCardDetails }: InventoryViewProps) {
  const { confirm: confirmToast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'weapon' | 'card' | 'skill' | 'material' | 'job_core'>('all');
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
               if (inv.item_type === 'skill' || inv.item_type === 'skill_scroll') table = 'skills';
               if (inv.item_type === 'material') table = 'materials';
               if (inv.item_type === 'job_core') table = 'jobs';
               
               const { data: def } = await supabase.from(table).select('*').eq('id', inv.item_id).single();
               return { ...inv, def };
           }));
           
           let filtered = enriched;
           if (targetSlot) {
             filtered = enriched.filter(i => 
               (targetSlot === 'weapon' && i.item_type === 'weapon') || 
               (targetSlot === 'card' && i.item_type === 'card') || 
               (targetSlot === 'skill' && (i.item_type === 'skill' || i.item_type === 'skill_scroll'))
             );
           }
           setItems(filtered);
       }
      setLoading(false);
    }
    loadInventory();
  }, [targetSlot]);

  return (
    <div className="flex flex-col h-full bg-[#0B1A2A] p-6 overflow-hidden relative">
      <div className="absolute inset-0 view-overlay pointer-events-none" />

        <div className="flex items-center justify-between mb-6 z-10">
         <div className="flex items-center gap-4">
           <Button 
             onClick={onBack} 
             variant="secondary"
             size="sm"
             className="!rounded-xl btn-back"
           >
             <ChevronLeft size={20} />
           </Button>
           <div className="flex flex-col">
             <h1 className="view-title">
               {targetSlot ? `Seleccionar ${targetSlot}` : 'Inventario'}
             </h1>
             <span className="text-[10px] font-black text-white/40 uppercase tracking-widest mt-0.5">
               {fromUnitDetails ? 'Equipar a unidad' : 'Almacén de Equipo'}
             </span>
           </div>
         </div>
         {!targetSlot && (
           <div className="flex gap-2">
              <div className="flex bg-black/40 p-1 rounded-xl border border-white/5 backdrop-blur-md">
                {[
                  { id: 'all', icon: Box },
                  { id: 'weapon', icon: Sword },
                  { id: 'card', icon: Sparkles },
                  { id: 'skill', icon: Zap },
                  { id: 'material', icon: Box }
                ].map((btn) => (
                  <button
                    key={btn.id}
                    onClick={() => setFilter(btn.id as any)}
                    className={`p-2 rounded-lg transition-all ${filter === btn.id ? 'bg-[#F5C76B] text-black shadow-lg' : 'text-white/40 hover:text-white/60'}`}
                  >
                    <btn.icon size={16} />
                  </button>
                ))}
              </div>
           </div>
         )}
       </div>

      {!targetSlot && (
        <div className="mb-5 z-10">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
             <input
               type="text"
               value={search}
               onChange={e => setSearch(e.target.value)}
               placeholder="Buscar objeto..."
               className="w-full bg-black/50 backdrop-blur-md border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#F5C76B]/40 transition-colors glass-frosted"
             />
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-t-[#F5C76B] border-white/5 rounded-full animate-spin shadow-[0_0_20px_rgba(245,199,107,0.3)]"></div>
            <p className="text-[10px] font-black text-white/30 tracking-[0.3em] uppercase">Cargando inventario...</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar z-10">
            {items.filter(i => {
              if (filter !== 'all' && i.item_type !== filter) return false;
              if (search && !i.def?.name?.toLowerCase().includes(search.toLowerCase()) && !i.item_id?.toLowerCase().includes(search.toLowerCase())) return false;
              return true;
            }).map((item) => (
                <NineSlicePanel
                  key={item.id}
                  type="border"
                  variant="default"
                  className="p-4 flex items-center gap-4 hover:border-[#F5C76B]/30 transition-all cursor-pointer group relative rounded-2xl glass-frosted frame-earthstone"
                  onClick={() => {
                    if (targetSlot) {
                      onEquip(item);
                    } else if (item.item_type === 'skill' || item.item_type === 'skill_scroll') {
                      setSelectedSkill(item.item_id);
                    } else if (item.item_type === 'card') {
                      onOpenCardDetails(item.item_id, item.id);
                    } else {
                      setSelectedItem(item);
                    }
                  }}
                  as={motion.div}
                  whileHover={{ x: 6, transition: { duration: 0.2 } }}
                >
                    <RarityIcon
                      rarity={item.def?.rarity || 'C'}
                      size="md"
                      className="shrink-0"
                      glass={true}
                    >
                      {item.item_type === 'weapon' ? <SpriteAtlasIcon index={SPRITE_INDEX.weapon_sword} size={24} className="drop-shadow-[0_0_8px_rgba(245,199,107,0.4)]" /> :
                       item.item_type === 'card' ? <img src={AssetService.getCardUrl(item.item_id)} className="w-8 h-8 object-contain drop-shadow-[0_0_5px_rgba(168,85,247,0.4)]" alt="card" /> :
                       item.item_type === 'job_core' ? <SpriteAtlasIcon index={SPRITE_INDEX.icon_novice} size={24} className="brightness-125" /> :
                       item.item_type === 'skill' || item.item_type === 'skill_scroll' ? <SpriteAtlasIcon index={SPRITE_INDEX.skill_attack} size={24} className="text-cyan-400" /> :
                       <SpriteAtlasIcon index={SPRITE_INDEX.resource_gold} size={24} className="drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]" />}
                    </RarityIcon>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-black text-white uppercase tracking-wider text-sm truncate drop-shadow-sm">{item.def?.name || item.item_id}</span>
                          <span className="text-[8px] font-black text-[#F5C76B] bg-[#F5C76B]/10 px-2 py-0.5 rounded-full border border-[#F5C76B]/20">{item.def?.rarity || 'C'}</span>
                        </div>
                        <p className="text-[10px] text-white/50 leading-relaxed font-medium line-clamp-2">{item.def?.description || item.item_type}</p>
                        {item.quantity > 1 && <span className="text-[10px] text-white/40 mt-1 font-bold">x{item.quantity}</span>}
                    </div>
                    <ChevronRight size={16} className="text-white/10 group-hover:text-[#F5C76B] transition-colors shrink-0" />
                </NineSlicePanel>
            ))}

            {items.filter(i => {
              if (filter !== 'all' && i.item_type !== filter) return false;
              if (search && !i.def?.name?.toLowerCase().includes(search.toLowerCase()) && !i.item_id?.toLowerCase().includes(search.toLowerCase())) return false;
              return true;
            }).length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center gap-4">
                 <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center">
                   <Box size={28} className="text-white/10" />
                 </div>
                 <p className="text-[10px] font-black tracking-[0.3em] uppercase text-white/20">No se encontraron objetos</p>
              </div>
            )}
         </div>
       )}

        {selectedItem && !targetSlot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 bg-[#0B1A2A]/95 backdrop-blur-2xl flex flex-col p-8 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-8">
              <Button 
                onClick={() => setSelectedItem(null)} 
                variant="secondary"
                size="sm"
                className="!rounded-xl"
              >
                <ChevronLeft size={20} />
              </Button>
              <h2 className="text-lg font-black text-white tracking-widest uppercase italic">Detalles del Objeto</h2>
              <div className="w-10" />
            </div>

            <div className="flex-1 flex flex-col items-center justify-center gap-8">
              <RarityIcon
                rarity={selectedItem.def?.rarity || 'C'}
                size="lg"
                glass={true}
              >
                {selectedItem.item_type === 'weapon' ? <Sword size={48} className="text-[#F5C76B] drop-shadow-[0_0_20px_rgba(245,199,107,0.5)]" /> :
                 selectedItem.item_type === 'card' ? <Sparkles size={48} className="text-purple-400 drop-shadow-[0_0_20px_rgba(168,85,247,0.5)]" /> :
                 selectedItem.item_type === 'skill_scroll' ? <Sparkles size={48} className="text-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]" /> :
                 <Box size={48} className="text-white/40" />}
              </RarityIcon>

              <div className="text-center">
                <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">{selectedItem.def?.name || selectedItem.item_id}</h3>
                <span className="text-[10px] font-black text-[#F5C76B] bg-[#F5C76B]/10 px-3 py-1 rounded-full border border-[#F5C76B]/20 mt-3 inline-block tracking-widest">
                  {selectedItem.def?.rarity || 'C'}
                </span>
              </div>

              <p className="text-sm text-white/60 text-center leading-relaxed max-w-sm italic">
                &quot;{selectedItem.def?.description || 'Sin descripción'}&quot;
              </p>

              {selectedItem.quantity > 1 && (
                <div className="px-4 py-2 bg-[#F5C76B]/10 rounded-full border border-[#F5C76B]/20">
                  <p className="text-sm text-[#F5C76B] font-black">Cantidad: x{selectedItem.quantity}</p>
                </div>
              )}

              <NineSlicePanel
                type="border"
                variant="default"
                className="w-full p-5 glass-frosted frame-earthstone"
                glassmorphism={true}
              >
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-2 font-stats">Tipo de Objeto</p>
                <p className="text-white text-sm font-bold tracking-wide font-stats">{selectedItem.item_type}</p>
              </NineSlicePanel>
            </div>

             <Button
               onClick={() => setSelectedItem(null)}
               variant="secondary"
               size="lg"
               className="w-full mt-8"
             >
               Cerrar
             </Button>
          </motion.div>
        )}

       {selectedSkill && (
          <SkillDetailView
            skillId={selectedSkill}
            itemId={items.find(i => i.item_id === selectedSkill)?.id || ''}
            onBack={() => setSelectedSkill(null)}
            onEquip={(item) => { onEquip(item); setSelectedSkill(null); }}
            onDiscard={async (itemId) => {
               const confirmed = await confirmToast('¿Descartar este objeto?');
               if (!confirmed) return;
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
