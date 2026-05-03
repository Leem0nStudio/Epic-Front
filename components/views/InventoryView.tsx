'use client';
import { AssetService } from '@/lib/services/asset-service';
import { RarityIcon } from '@/components/ui/RarityIcon';
import { RarityBorder } from '@/components/ui/RarityBadge';
import { ViewShell } from '@/components/ui/ViewShell';
import { getRarityCode, RARITY_COLORS } from '@/lib/config/assets-config';
import { InventoryService } from '@/lib/services/inventory-service';
import { useGameStore } from '@/lib/stores/game-store';

import React, { useState, useEffect } from 'react';
import { Search, Zap, Sword, Shield, Sparkles, Package } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { motion } from 'motion/react';
import { SkillDetailView } from './SkillDetailView';
import { CardDetailView } from './CardDetailView';
import { useToast } from '@/lib/contexts/ToastContext';
import { gameDebugger } from '@/lib/debug';

interface InventoryViewProps {
  targetSlot: 'weapon' | 'card' | 'skill' | null;
  fromUnitDetails: boolean;
  onBack: () => void;
  onEquip: (item: any) => void;
  onOpenCardDetails: (cardId: string, itemId: string) => void;
}

const FILTERS: { key: 'all' | 'weapon' | 'card' | 'skill' | 'material' | 'job_core'; label: string }[] = [
  { key: 'all', label: 'Todo' },
  { key: 'weapon', label: 'Armas' },
  { key: 'card', label: 'Cartas' },
  { key: 'skill', label: 'Skills' },
  { key: 'material', label: 'Mat.' },
  { key: 'job_core', label: 'Jobs' },
];

export function InventoryView({ targetSlot, fromUnitDetails, onBack, onEquip, onOpenCardDetails }: InventoryViewProps) {
  const { confirm: confirmToast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'weapon' | 'card' | 'skill' | 'material' | 'job_core'>('all');
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  // Get inventory from store (already enriched with definitions)
  const storeInventory = useGameStore(state => state.inventory);
  
  // Debug: log inventory changes
  useEffect(() => {
    gameDebugger.info('inventory', 'Store inventory changed', { 
      count: storeInventory.length,
      firstItems: storeInventory.slice(0, 2).map(i => ({ id: i.id, type: i.item_type, itemId: i.item_id }))
    });
  }, [storeInventory]);

  // Use store inventory directly - already has definitions loaded
  useEffect(() => {
    // Filter based on targetSlot if provided
    let filtered = storeInventory;
    
    if (targetSlot) {
      filtered = storeInventory.filter(i => 
        (targetSlot === 'weapon' && i.item_type === 'weapon') || 
        (targetSlot === 'card' && i.item_type === 'card') || 
        (targetSlot === 'skill' && (i.item_type === 'skill' || i.item_type === 'skill_scroll'))
      );
    }
    
    setItems(filtered);
    setLoading(false);
    
    gameDebugger.info('inventory', 'Using store inventory', { 
      count: storeInventory.length,
      filtered: filtered.length 
    });
  }, [storeInventory, targetSlot]);

  const filteredItems = items.filter(item => {
    const matchesFilter = filter === 'all' || item.item_type === filter;
    const matchesSearch = !search || item.definition?.name?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (selectedSkill) {
    return <SkillDetailView skillId={selectedSkill} itemId={items.find(i => i.item_id === selectedSkill)?.id || ''} onBack={() => setSelectedSkill(null)} onEquip={(item) => { onEquip(item); setSelectedSkill(null); }} onDiscard={async (itemId) => { const confirmed = await confirmToast('¿Descartar este objeto?'); if (!confirmed || !supabase) return; await supabase.from('inventory').delete().eq('id', itemId); setSelectedSkill(null); }} />;
  }

  if (selectedCard) {
    const item = items.find(i => i.item_id === selectedCard);
    return <CardDetailView cardId={selectedCard} itemId={item?.id || ''} onBack={() => setSelectedCard(null)} onEquip={(item) => { onEquip(item); setSelectedCard(null); }} onDiscard={async (itemId) => { const confirmed = await confirmToast('¿Descartar este objeto?'); if (!confirmed || !supabase) return; await supabase.from('inventory').delete().eq('id', itemId); setSelectedCard(null); }} />;
  }

  return (
    <ViewShell title="Inventario" subtitle={`${items.length} objetos`} onBack={onBack} loading={loading} emptyMessage="No hay objetos en tu inventario">
      {/* Search & Filter */}
      <div className="p-4 pb-2">
        <div className="flex gap-2 mb-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input type="text" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-white/20" />
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
          {FILTERS.map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)} className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${filter === f.key ? 'bg-[#F5C76B] text-black' : 'bg-black/40 border border-white/10 text-white/60 hover:text-white'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      <div className="flex-1 overflow-y-auto p-4 pt-0">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-white/40">
            <Package size={48} className="mb-2 opacity-30" />
            <p className="text-sm font-stats">No hay objetos</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {filteredItems.map((item, idx) => {
              const rarity = getRarityCode(item.definition?.rarity);
              return (
                <motion.button key={item.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.03 }} onClick={() => { if (item.item_type === 'card') setSelectedCard(item.item_id); else if (item.item_type === 'skill' || item.item_type === 'skill_scroll') setSelectedSkill(item.item_id); else onEquip(item); }}>
                  <RarityBorder rarity={item.definition?.rarity} className="transition-all hover:scale-105 active:scale-95">
                    <div className="w-full h-full rounded-lg bg-black/40 flex items-center justify-center relative overflow-hidden">
                      {item.item_type === 'card' && <img src={AssetService.getCardUrl(item.item_id)} alt="" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.src = AssetService.getCardUrlFallback(item.item_id); }} />}
                      {item.item_type === 'weapon' && <img src={AssetService.getWeaponIconUrl(item.item_id)} alt="" className="w-10 h-10 object-contain" />}
                      {item.item_type === 'skill' || item.item_type === 'skill_scroll' ? <Zap size={24} className="text-[#F5C76B] drop-shadow-[0_0_10px_rgba(245,199,107,0.5)]" /> : null}
                      {item.item_type === 'job_core' && <Shield size={24} className="text-green-400" />}
                      {item.item_type === 'material' && <Package size={24} className="text-blue-400" />}
                      {item.quantity > 1 && <div className="absolute bottom-0 right-0 bg-black/60 px-1.5 py-0.5 rounded-tl-lg">
                        <span className="text-[8px] font-black text-white">{item.quantity}</span>
                      </div>}
                    </div>
                  </RarityBorder>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      {/* Hint */}
      <div className="p-4 text-center">
        <p className="text-[10px] text-white/30 font-stats">Toca una carta o skill para ver detalles</p>
      </div>
    </ViewShell>
  );
}