'use client';
import { AssetService } from '@/lib/services/asset-service';
import { NineSlicePanel } from '@/components/ui/NineSlicePanel';
import { Button } from '@/components/ui/Button';
import { getRarityCode, RARITY_COLORS } from '@/lib/config/assets-config';

import React, { useState } from 'react';
import { Sparkles, Diamond, Coins, Box, ScrollText, Zap, Info, Star } from 'lucide-react';
import { GachaService } from '@/lib/services/gacha-service';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '@/lib/contexts/ToastContext';

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
      setResults(items);
      if (onPullComplete) onPullComplete();
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setIsPulling(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    const code = getRarityCode(rarity);
    return RARITY_COLORS[code] || RARITY_COLORS.C;
  };

  if (selectedReward) {
    const rarityColor = getRarityColor(selectedReward.item_rarity);
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-black/60 backdrop-blur-3xl z-50">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8, rotateY: 180 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          className="relative w-64 h-80 rounded-[32px] border-2 p-1 shadow-2xl overflow-hidden"
          style={{ borderColor: rarityColor, background: `linear-gradient(135deg, ${rarityColor}33, #0B1A2A)` }}
        >
          <div className="w-full h-full bg-[#0B1A2A]/40 flex flex-col items-center justify-between p-6">
             <div className="w-full flex justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/5 border border-white/10" style={{ color: rarityColor }}>
                   {selectedReward.item_rarity}
                </span>
                <Star size={14} style={{ color: rarityColor }} />
             </div>

             <div className="flex-1 flex items-center justify-center">
                {selectedReward.item_type === 'card' ? (
                  <img src={AssetService.getCardUrl(selectedReward.item_id)} className="w-40 h-40 object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]" alt=""
                       onError={(e) => { e.currentTarget.src = AssetService.getCardUrlFallback(selectedReward.item_id); }} />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                     <Sparkles size={48} style={{ color: rarityColor }} />
                  </div>
                )}
             </div>

             <div className="text-center">
                <h3 className="text-xl font-black text-white uppercase tracking-tight">{selectedReward.item_name}</h3>
                <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] mt-1">{selectedReward.item_type}</p>
             </div>
          </div>
        </motion.div>

        <div className="mt-8 flex gap-3 w-full max-w-xs">
          <Button variant="secondary" className="flex-1" onClick={() => setSelectedReward(null)}>ACEPTAR</Button>
        </div>
      </div>
    );
  }

  if (results.length > 0) {
    return (
      <div className="flex-1 flex flex-col p-6">
        <div className="flex items-center justify-between mb-8">
           <div>
              <h2 className="text-2xl font-black text-white uppercase font-display tracking-tight">RESULTADOS</h2>
              <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Has invocado {results.length} objetos</p>
           </div>
           <button onClick={() => setResults([])} className="p-2 text-white/40 hover:text-white transition-colors uppercase text-[10px] font-black tracking-widest border border-white/5 rounded-lg bg-white/5">CERRAR</button>
        </div>

        <div className="grid grid-cols-4 gap-4 overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar">
          {results.map((item, i) => {
            const rarityColor = getRarityColor(item.item_rarity);
            return (
              <motion.button
                key={`${item.item_id}_${i}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedReward(item)}
                className="aspect-[3/4] rounded-2xl border-2 p-0.5 transition-all hover:scale-105"
                style={{ borderColor: `${rarityColor}44`, background: `${rarityColor}11` }}
              >
                <div className="w-full h-full bg-[#0B1A2A]/60 rounded-xl flex items-center justify-center overflow-hidden">
                   {item.item_type === 'card' ? (
                     <img src={AssetService.getCardUrl(item.item_id)} className="w-full h-full object-cover scale-110" alt=""
                          onError={(e) => { e.currentTarget.src = AssetService.getCardUrlFallback(item.item_id); }} />
                   ) : (
                     <Box size={24} style={{ color: rarityColor }} />
                   )}
                </div>
              </motion.button>
            );
          })}
        </div>

        <div className="mt-auto pt-8 flex gap-4">
           <Button variant="secondary" className="flex-1" onClick={() => setResults([])}>CONTINUAR</Button>
           <Button variant="primary" className="flex-1" onClick={() => handlePull(10, 'premium')} disabled={isPulling}>OTRA VEZ (x10)</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-6 relative">
      <div className="mb-12">
         <h1 className="text-3xl font-black text-white uppercase font-display tracking-tight leading-none">INVOCACIÓN</h1>
         <p className="text-[11px] text-[#F5C76B] font-black uppercase tracking-[0.3em] mt-2 opacity-80">Gremio de Alquimistas</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative">
         {/* Focal Point - Summoning Circle */}
         <div className="relative w-64 h-64 mb-12 flex items-center justify-center">
            <motion.div
               animate={{ rotate: 360 }}
               transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
               className="absolute inset-0 border-2 border-dashed border-[#F5C76B]/20 rounded-full"
            />
            <motion.div
               animate={{ rotate: -360 }}
               transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
               className="absolute inset-4 border border-[#F5C76B]/10 rounded-full"
            />

            <div className="z-10 w-40 h-40 rounded-full bg-gradient-to-br from-[#F5C76B]/10 to-transparent flex items-center justify-center border border-[#F5C76B]/30 backdrop-blur-xl">
               <Sparkles size={64} className="text-[#F5C76B] drop-shadow-[0_0_20px_#F5C76B]" />
            </div>

            {/* Pulsing Glow */}
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute inset-0 bg-[#F5C76B]/5 blur-3xl rounded-full"
            />
         </div>

         {/* Pull Options Cards */}
         <div className="grid grid-cols-2 gap-4 w-full">
            <PullCard
              type="soft"
              amount={1}
              cost={100}
              icon={Coins}
              color="#F5C76B"
              onClick={() => handlePull(1, 'soft')}
              disabled={isPulling}
            />
            <PullCard
              type="premium"
              amount={1}
              cost={50}
              icon={Diamond}
              color="#22D3EE"
              onClick={() => handlePull(1, 'premium')}
              disabled={isPulling}
            />
            <PullCard
              type="soft"
              amount={10}
              cost={900}
              icon={Coins}
              color="#F5C76B"
              onClick={() => handlePull(10, 'soft')}
              disabled={isPulling}
              discount
            />
            <PullCard
              type="premium"
              amount={10}
              cost={450}
              icon={Diamond}
              color="#F5C76B"
              onClick={() => handlePull(10, 'premium')}
              disabled={isPulling}
              discount
            />
         </div>
      </div>

      {isPulling && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex flex-col items-center justify-center">
           <motion.div
             animate={{ rotate: 360, scale: [1, 1.2, 1] }}
             transition={{ duration: 2, repeat: Infinity }}
             className="w-12 h-12 border-4 border-t-[#F5C76B] border-white/10 rounded-full"
           />
           <p className="text-[#F5C76B] text-[11px] font-black uppercase tracking-[0.4em] mt-6 animate-pulse">INVOCANDO ALMAS...</p>
        </div>
      )}
    </div>
  );
}

function PullCard({ type, amount, cost, icon: Icon, color, onClick, disabled, discount }: any) {
  return (
    <motion.button
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className="bg-black/40 backdrop-blur-xl border border-white/5 p-5 rounded-2xl flex flex-col items-center gap-3 hover:border-white/20 transition-all relative overflow-hidden group"
    >
      {discount && (
        <div className="absolute top-2 right-2 bg-red-600 text-[8px] font-black text-white px-2 py-0.5 rounded uppercase tracking-tighter shadow-lg">DTO</div>
      )}
      <Icon size={20} style={{ color }} className="group-hover:drop-shadow-[0_0_10px_currentColor]" />
      <div className="text-center">
         <p className="text-xl font-black text-white leading-none tracking-tight">x{amount}</p>
         <div className="flex items-center gap-1.5 mt-2 opacity-40 group-hover:opacity-100 transition-opacity">
            <Icon size={10} style={{ color }} />
            <span className="text-[10px] font-black text-white tabular-nums">{cost}</span>
         </div>
      </div>
    </motion.button>
  );
}
