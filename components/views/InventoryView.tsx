'use client';
import { AssetService } from '@/lib/services/asset-service';
import { NineSlicePanel } from '@/components/ui/NineSlicePanel';
import { RarityIcon } from '@/components/ui/RarityIcon';
import { Button } from '@/components/ui/Button';
import { getRarityCode } from '@/lib/config/assets-config';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, Search, Filter, Zap, Sword, Shield, Sparkles, Package, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { SkillDetailView } from './SkillDetailView';
import { CardDetailView } from './CardDetailView';
import { useToast } from '@/lib/contexts/ToastContext';

interface InventoryViewProps {
  targetSlot: 'weapon' | 'card' | 'skill' | null;
  fromUnitDetails: boolean;
  onBack: () => void;
  onEquip: (item: any) => void;
  onOpenCardDetails: (cardId: string, itemId: string) => void;
}

const RARITY_COLORS: Record<string, string> = {
  common: '#9CA3AF',
  rare: '#3B82F6',
  epic: '#A855F7',
  legendary: '#F5C76B',
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  weapon: <Sword size={16} className="text-red-400" />,
  card: <Sparkles size={16} className="text-purple-400" />,
  skill: <Zap size={16} className="text-[#F5C76B]" />,
  skill_scroll: <Zap size={16} className="text-[#F5C76B]" />,
  material: <Package size={16} className="text-blue-400" />,
  job_core: <Shield size={16} className="text-green-400" />,
};

const TYPE_LABELS: Record<string, string> = {
  weapon: 'Armas', card: 'Cartas', skill: 'Skills', skill_scroll: 'Skills', material: 'Materiales', job_core: 'Jobs',
};

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
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  useEffect(() => {
    async function loadInventory() {
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('inventory').select('*').eq('player_id', user.id);
      if (data) {
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

  const filteredItems = items.filter(item => {
    const matchesFilter = filter === 'all' || item.item_type === filter;
    const matchesSearch = !search || item.def?.name?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getItemImage = (item: any) => {
    if (item.item_type === 'weapon') return AssetService.getWeaponIconUrl(item.item_id);
    if (item.item_type === 'card') return AssetService.getCardUrl(item.item_id);
    if (item.item_type === 'skill' || item.item_type === 'skill_scroll') return null;
    if (item.item_type === 'job_core') return null;
    return null;
  };

  if (selectedSkill) {
    return <SkillDetailView skillId={selectedSkill} itemId={items.find(i => i.item_id === selectedSkill)?.id || ''} onBack={() => setSelectedSkill(null)} onEquip={(item) => { onEquip(item); setSelectedSkill(null); }} onDiscard={async (itemId) => { const confirmed = await confirmToast('¿Descartar este objeto?'); if (!confirmed || !supabase) return; await supabase.from('inventory').delete().eq('id', itemId); setSelectedSkill(null); }} />;
  }

  if (selectedCard) {
    const item = items.find(i => i.item_id === selectedCard);
    return <CardDetailView cardId={selectedCard} itemId={item?.id || ''} onBack={() => setSelectedCard(null)} onEquip={(item) => { onEquip(item); setSelectedCard(null); }} onDiscard={async (itemId) => { const confirmed = await confirmToast('¿Descartar este objeto?'); if (!confirmed || !supabase) return; await supabase.from('inventory').delete().eq('id', itemId); setSelectedCard(null); }} />;
  }

  return (
    <div className="flex flex-col h-full relative" style={{ backgroundImage: `url('${AssetService.getBgUrl('home')}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="absolute inset-0 bg-[#0B1A2A]/90" />

      {/* Header */}
      <div className="relative z-10 p-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="p-2.5 bg-black/40 border border-white/10 rounded-xl text-white/60 hover:text-white transition-all hover:bg-white/10">
            <ChevronLeft size={24} />
          </button>
          <div className="text-center">
            <h1 className="text-lg font-black text-white tracking-widest uppercase font-display">Inventario</h1>
            <span className="text-[9px] font-black text-white/40 uppercase tracking-widest font-stats">{items.length} objetos</span>
          </div>
          <div className="w-10" />
        </div>

        {/* Search & Filter */}
        <div className="flex gap-2 mb-4">
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
      <div className="relative z-10 flex-1 overflow-y-auto p-4 pt-0">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-8 h-8 border-2 border-t-[#F5C76B] border-white/5 rounded-full animate-spin" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-white/40">
            <Package size={48} className="mb-2 opacity-30" />
            <p className="text-sm font-stats">No hay objetos</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {filteredItems.map((item, idx) => {
              const rarityColor = RARITY_COLORS[item.def?.rarity?.toLowerCase()] || '#9CA3AF';
              return (
                <motion.button key={item.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.03 }} onClick={() => { if (item.item_type === 'card') setSelectedCard(item.item_id); else if (item.item_type === 'skill' || item.item_type === 'skill_scroll') setSelectedSkill(item.item_id); else onEquip(item); }} className="aspect-square rounded-xl border-2 p-1 transition-all hover:scale-105 active:scale-95" style={{ borderColor: `${rarityColor}66`, backgroundColor: `${rarityColor}11` }}>
                  <div className="w-full h-full rounded-lg bg-black/40 flex items-center justify-center relative overflow-hidden">
                    {item.item_type === 'card' && <img src={AssetService.getCardUrl(item.item_id)} alt="" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
                    {item.item_type === 'weapon' && <img src={AssetService.getWeaponIconUrl(item.item_id)} alt="" className="w-10 h-10 object-contain" />}
                    {item.item_type === 'skill' || item.item_type === 'skill_scroll' ? <Zap size={24} className="text-[#F5C76B] drop-shadow-[0_0_10px_rgba(245,199,107,0.5)]" /> : null}
                    {item.item_type === 'job_core' && <Shield size={24} className="text-green-400" />}
                    {item.item_type === 'material' && <Package size={24} className="text-blue-400" />}
                    {item.quantity > 1 && <div className="absolute bottom-0 right-0 bg-black/60 px-1.5 py-0.5 rounded-tl-lg">
                      <span className="text-[8px] font-black text-white">{item.quantity}</span>
                    </div>}
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      {/* Hint */}
      <div className="relative z-10 p-4 text-center">
        <p className="text-[10px] text-white/30 font-stats">Toca una carta o skill para ver detalles</p>
      </div>
    </div>
  );
}