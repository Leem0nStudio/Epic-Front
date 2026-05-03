'use client';
import { AssetService } from '@/lib/services/asset-service';
import { NineSlicePanel } from '@/components/ui/NineSlicePanel';
import { RarityIcon } from '@/components/ui/RarityIcon';
import { RarityBadge } from '@/components/ui/RarityBadge';
import { Button } from '@/components/ui/Button';
import { ViewShell } from '@/components/ui/ViewShell';
import { getRarityCode, RARITY_COLORS } from '@/lib/config/assets-config';

import React, { useState } from 'react';
import { ChevronLeft, Sparkles, Diamond, Coins, Sword, Box, ScrollText, Zap, Info } from 'lucide-react';
import { GachaService } from '@/lib/services/gacha-service';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '@/lib/contexts/ToastContext';
import { gameDebugger } from '@/lib/debug';

interface GachaViewProps {
  profile: any;
  onNavigate: (view: any) => void;
  onPullComplete?: () => void;
}

interface PullResult {
  item_id: string;
  item_name: string;
  item_rarity: string;
  item_type: string;
}

export function GachaView({ profile, onNavigate, onPullComplete }: GachaViewProps) {
  const { showToast } = useToast();
  const [results, setResults] = useState<PullResult[]>([]);
  const [isPulling, setIsPulling] = useState(false);
  const [selectedReward, setSelectedReward] = useState<PullResult | null>(null);

  const handlePull = async (amount: number, currency: 'soft' | 'premium') => {
    setIsPulling(true);
    setSelectedReward(null);
    try {
      const items = await GachaService.pull(amount, currency);
      gameDebugger.info('gacha', 'Pull completed', { count: items.length, items });
      setResults(items);
      
      // Refresh game state to update inventory
      if (onPullComplete) {
        gameDebugger.info('gacha', 'Calling onPullComplete callback');
        onPullComplete();
      }
    } catch (e: any) {
      gameDebugger.error('gacha', 'Pull failed', e);
      showToast(e.message, 'error');
    } finally {
      setIsPulling(false);
    }
  };

  const getItemIcon = (item: PullResult) => {
    if (item.item_type === 'weapon') return <Sword size={24} className="text-white/80" />;
    if (item.item_type === 'card') return <img src={AssetService.getCardUrl(item.item_id)} className="w-10 h-10 object-contain" alt={item.item_name} onError={(e) => { e.currentTarget.src = AssetService.getCardUrlFallback(item.item_id); }} />;
    if (item.item_type === 'skill') return <ScrollText size={24} className="text-white/80" />;
    return <Box size={24} className="text-white/80" />;
  };

  const getItemImage = (item: PullResult) => {
    if (item.item_type === 'weapon') return AssetService.getWeaponIconUrl(item.item_id);
    if (item.item_type === 'card') return AssetService.getCardUrl(item.item_id);
    if (item.item_type === 'skill') return null;
    return null;
  };

  const getRarityColor = (rarity: string) => {
    const code = getRarityCode(rarity);
    return RARITY_COLORS[code] || RARITY_COLORS.C;
  };

  // Reward Detail Modal
  if (selectedReward) {
    const rarityColor = getRarityColor(selectedReward.item_rarity);
    const itemImage = getItemImage(selectedReward);
    
    return (
      <ViewShell title="Invocación" subtitle="Premio" onBack={() => setSelectedReward(null)}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 flex flex-col items-center justify-center p-6"
        >
          {/* Large Card Reveal */}
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="relative mb-6"
          >
            <div 
              className="w-48 h-64 rounded-2xl border-2 p-1 shadow-2xl"
              style={{ 
                background: `linear-gradient(135deg, ${rarityColor}22 0%, ${rarityColor}11 100%)`,
                borderColor: rarityColor,
                boxShadow: `0 0 40px ${rarityColor}66, inset 0 0 30px ${rarityColor}22`
              }}
            >
              <div className="w-full h-full rounded-xl bg-black/40 overflow-hidden flex items-center justify-center">
                {itemImage ? (
                  <img src={itemImage} alt={selectedReward.item_name} className="w-full h-full object-contain" />
                ) : (
                  <Sparkles size={64} className="text-white/30" />
                )}
              </div>
            </div>
            
            {/* Glow Effect */}
            <div 
              className="absolute inset-0 blur-3xl -z-10 opacity-30"
              style={{ backgroundColor: rarityColor }}
            />
          </motion.div>

          {/* Rarity Badge */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <RarityBadge rarity={selectedReward.item_rarity} size="lg" />
          </motion.div>

          {/* Item Name */}
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-black text-white uppercase tracking-wider mt-3 drop-shadow-lg"
          >
            {selectedReward.item_name}
          </motion.h2>

          {/* Item Type */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-2 mt-2 text-white/50"
          >
            <span className="text-xs font-stats uppercase">
              {selectedReward.item_type === 'weapon' ? 'Arma' : 
               selectedReward.item_type === 'card' ? 'Carta' : 
               selectedReward.item_type === 'skill' ? 'Habilidad' : 'Objeto'}
            </span>
          </motion.div>

          {/* Info Panel */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 w-full"
          >
            <NineSlicePanel type="border" variant="default" className="w-full p-4 glass-frosted frame-earthstone">
              <div className="flex items-center gap-2 mb-2">
                <Info size={14} className="text-white/40" />
                <span className="text-[10px] font-black text-white/60 uppercase tracking-wider">Detalles</span>
              </div>
              <p className="text-white/70 text-sm font-stats text-center">
                Este{selectedReward.item_type === 'weapon' ? ' arma' : 
                  selectedReward.item_type === 'card' ? ' carta' : 
                  selectedReward.item_type === 'skill' ? ' habilidad' : ' objeto'} 
                  ha sido añadido a tu inventario.
              </p>
            </NineSlicePanel>
          </motion.div>

          {/* Actions */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex gap-3 mt-6 w-full max-w-xs"
          >
            <Button variant="secondary" className="flex-1" onClick={() => setSelectedReward(null)}>
              Seguir Invocando
            </Button>
            <Button variant="primary" className="flex-1" onClick={() => { setResults([]); setSelectedReward(null); }}>
              Ver Inventario
            </Button>
          </motion.div>
        </motion.div>
      </ViewShell>
    );
  }

  // Results Grid with detail view
  if (results.length > 0) {
    return (
      <ViewShell title="Invocación" subtitle={`${results.length} items`} onBack={() => { setResults([]); onNavigate('home'); }}>
        <div className="flex-1 flex flex-col p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-5 gap-3"
          >
            {results.map((item, i) => {
              const rarityColor = getRarityColor(item.item_rarity);
              return (
                <motion.button
                  key={`${item.item_id}_${i}`}
                  initial={{ opacity: 0, scale: 0.5, rotate: -20 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ delay: i * 0.1, type: 'spring', damping: 12 }}
                  onClick={() => setSelectedReward(item)}
                  className="aspect-square rounded-xl border-2 p-1 transition-all hover:scale-110 active:scale-95"
                  style={{ 
                    borderColor: rarityColor,
                    backgroundColor: `${rarityColor}22`,
                    boxShadow: `0 0 20px ${rarityColor}44`
                  }}
                >
                  <div className="w-full h-full rounded-lg bg-black/40 flex items-center justify-center relative overflow-hidden">
                    {item.item_type === 'card' && (
                      <img src={AssetService.getCardUrl(item.item_id)} alt="" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.src = AssetService.getCardUrlFallback(item.item_id); }} />
                    )}
                    {item.item_type === 'weapon' && (
                      <img src={AssetService.getWeaponIconUrl(item.item_id)} alt="" className="w-8 h-8 object-contain" />
                    )}
                    {item.item_type === 'skill' && (
                      <Zap size={20} className="text-[#F5C76B]" />
                    )}
                  </div>
                </motion.button>
              );
            })}
          </motion.div>

          <div className="mt-4 text-center">
            <p className="text-[10px] text-white/40 font-stats">Toca un elemento para ver detalles</p>
          </div>

          <div className="flex gap-3 mt-auto">
            <Button variant="secondary" className="flex-1" onClick={() => setResults([])}>
              Continuar
            </Button>
            <Button variant="primary" className="flex-1" onClick={() => handlePull(1, 'soft')} disabled={isPulling}>
              x1 Más
            </Button>
          </div>
        </div>
      </ViewShell>
    );
  }

  // Main Gacha Screen
  return (
    <ViewShell title="Invocación" onBack={() => onNavigate('home')}>
      {/* Currency */}
      <div className="flex gap-3 px-4 py-2">
        <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-white/10">
          <Coins size={14} className="text-[#F5C76B]" />
          <span className="text-sm font-bold text-white">{profile.currency}</span>
        </div>
        <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-white/10">
          <Diamond size={14} className="text-cyan-400" />
          <span className="text-sm font-bold text-white">{profile.premium_currency}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {/* Gacha Machine Animation */}
        <motion.div
          animate={isPulling ? {
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          } : {}}
          transition={{ duration: 2, repeat: isPulling ? Infinity : 0 }}
          className="relative mb-8"
        >
          <div className="w-40 h-40 rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center border-2 border-white/10">
            <Sparkles size={64} className="text-white/50" />
          </div>
          {/* Animated rings */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              animate={isPulling ? {
                scale: [1 + i * 0.3, 1.5 + i * 0.3, 1 + i * 0.3],
                opacity: [0.3, 0.1, 0.3]
              } : {}}
              transition={{ duration: 2, repeat: isPulling ? Infinity : 0, delay: i * 0.2 }}
              className="absolute inset-0 rounded-full border border-white/20"
              style={{ scale: 1 + i * 0.3 }}
            />
          ))}
        </motion.div>

        {/* Pull Options */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handlePull(1, 'soft')}
            disabled={isPulling}
            className="p-6 rounded-2xl border-2 border-white/10 bg-black/40 hover:border-[#F5C76B]/50 transition-all"
          >
            <Coins size={24} className="text-[#F5C76B] mb-2 mx-auto" />
            <p className="text-xl font-black text-white text-center">x1</p>
            <p className="text-[10px] text-white/40 text-center mt-1">100 Oro</p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handlePull(10, 'soft')}
            disabled={isPulling}
            className="p-6 rounded-2xl border-2 border-white/10 bg-black/40 hover:border-purple-500/50 transition-all"
          >
            <div className="relative">
              <Coins size={24} className="text-purple-400 mb-2 mx-auto" />
              <span className="absolute -top-1 -right-4 text-[8px] bg-purple-500 text-white px-1.5 py-0.5 rounded font-black">x10</span>
            </div>
            <p className="text-xl font-black text-white text-center">x10</p>
            <p className="text-[10px] text-white/40 text-center mt-1">900 Oro</p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handlePull(1, 'premium')}
            disabled={isPulling}
            className="p-6 rounded-2xl border-2 border-white/10 bg-black/40 hover:border-cyan-500/50 transition-all"
          >
            <Diamond size={24} className="text-cyan-400 mb-2 mx-auto" />
            <p className="text-xl font-black text-white text-center">x1</p>
            <p className="text-[10px] text-white/40 text-center mt-1">50 Gemas</p>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handlePull(10, 'premium')}
            disabled={isPulling}
            className="p-6 rounded-2xl border-2 border-white/10 bg-black/40 hover:border-yellow-500/50 transition-all"
          >
            <div className="relative">
              <Diamond size={24} className="text-yellow-400 mb-2 mx-auto" />
              <span className="absolute -top-1 -right-4 text-[8px] bg-yellow-500 text-black px-1.5 py-0.5 rounded font-black">x10</span>
            </div>
            <p className="text-xl font-black text-white text-center">x10</p>
            <p className="text-[10px] text-white/40 text-center mt-1">450 Gemas</p>
          </motion.button>
        </div>

        {isPulling && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6"
          >
            <div className="w-8 h-8 border-2 border-t-[#F5C76B] border-white/5 rounded-full animate-spin mx-auto" />
            <p className="text-white/40 text-sm mt-2">Invocando...</p>
          </motion.div>
        )}
      </div>
    </ViewShell>
  );
}