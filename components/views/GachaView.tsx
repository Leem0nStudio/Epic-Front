'use client';
import { AssetService } from '@/lib/services/asset-service';
import { UIService } from '@/lib/services/ui-service';
import { NineSlicePanel } from '@/components/ui/NineSlicePanel';
import { RarityIcon } from '@/components/ui/RarityIcon';
import { Button } from '@/components/ui/Button';

import React, { useState } from 'react';
import { ChevronLeft, Sparkles, Diamond, Coins, Star, Sword, Box, ScrollText } from 'lucide-react';
import { GachaService } from '@/lib/services/gacha-service';
import { motion, AnimatePresence } from 'motion/react';
import { getRarityCode } from '@/lib/config/assets-config';
import { useToast } from '@/lib/contexts/ToastContext';

interface GachaViewProps {
  profile: any;
  onNavigate: (view: any) => void;
}

export function GachaView({ profile, onNavigate }: GachaViewProps) {
  const { showToast } = useToast();
  const [results, setResults] = useState<any[]>([]);
  const [isPulling, setIsPulling] = useState(false);

  const handlePull = async (amount: number, currency: 'soft' | 'premium') => {
    setIsPulling(true);
    try {
      const items = await GachaService.pull(amount, currency);
      setResults(items);
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setIsPulling(false);
    }
  };

  const rarityColor = (rarity: string) => {
    switch (rarity?.toLowerCase()) {
      case 'legendary': return 'from-yellow-400 to-orange-600 shadow-orange-500/50';
      case 'epic': return 'from-purple-400 to-indigo-600 shadow-purple-500/50';
      case 'rare': return 'from-blue-400 to-cyan-600 shadow-blue-500/50';
      default: return 'from-gray-400 to-gray-600 shadow-gray-500/50';
    }
  };

  // Get appropriate icon for item type
  const getItemIcon = (item: any) => {
    if (item.item_type === 'weapon') return <Sword size={24} className="text-white/80" />;
    if (item.item_type === 'card') return <Sparkles size={24} className="text-white/80" />;
    if (item.item_type === 'skill') return <ScrollText size={24} className="text-white/80" />;
    if (item.item_type === 'job_core') return <img src={AssetService.getIconUrl(AssetService.getJobIconId(item.item_id.replace('core_', '')))} className="w-8 h-8 object-contain" />;
    return <Box size={24} className="text-white/80" />;
  };

  return (
    <div className="flex flex-col h-full bg-[#0B1A2A] bg-cover bg-center bg-no-repeat p-6 overflow-hidden relative" style={{ backgroundImage: `url('${AssetService.getBgUrl('gacha')}')` }}>
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 via-transparent to-transparent pointer-events-none" />

       <div className="flex items-center justify-between mb-10 z-10">
        <div className="flex items-center gap-4">
          <Button 
            onClick={() => onNavigate('home')} 
            variant="secondary"
            size="sm"
            className="!rounded-xl"
          >
            <ChevronLeft size={20} />
          </Button>
          <h1 className="text-xl font-black text-white tracking-widest uppercase italic drop-shadow-md">Invocación</h1>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl border border-white/5 shadow-lg">
            <Coins size={16} className="text-[#F5C76B] drop-shadow-[0_0_5px_rgba(245,199,107,0.5)]" />
            <span className="text-sm font-bold text-white tracking-wide">{profile.currency}</span>
          </div>
          <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl border border-white/5 shadow-lg">
            <Diamond size={16} className="text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]" />
            <span className="text-sm font-bold text-white tracking-wide">{profile.premium_currency}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative z-10">
        <AnimatePresence mode="wait">
          {results.length > 0 ? (
                <NineSlicePanel
                  key="results"
                  type="border"
                  variant="default"
                  className="grid grid-cols-5 gap-4 w-full max-w-lg p-6 rounded-3xl shadow-2xl"
                  style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(32px)' }}
                  as={motion.div}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                >
              <div className="col-span-5 flex items-center justify-between mb-4">
                <h2 className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Resultados de Invocación</h2>
                <Button 
                    onClick={() => setResults([])} 
                    variant="secondary"
                    size="sm"
                >
                    Cerrar
                </Button>
              </div>
               {results.map((item, i) => (
                   <motion.div
                     key={i}
                     initial={{ opacity: 0, y: 20, scale: 0.8 }}
                     animate={{ opacity: 1, y: 0, scale: 1 }}
                     transition={{ delay: i * 0.05, type: 'spring', damping: 15 }}
                     className="flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-white/5 transition-colors"
                   >
                     <RarityIcon
                       rarity={getRarityCode(item.item_rarity)}
                       size="md"
                       glass={true}
                     >
                       {getItemIcon(item)}
                     </RarityIcon>
                     <span className="text-[8px] font-black text-white/70 uppercase truncate w-full text-center tracking-tighter">{item.item_name}</span>
                   </motion.div>
                 ))}
              </NineSlicePanel>
           ) : (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                  rotate: [0, 2, -2, 0]
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="w-56 h-56 relative flex items-center justify-center mb-16"
              >
                <div className="absolute inset-0 bg-cyan-500/10 blur-[80px] rounded-full animate-pulse" />
                <Sparkles size={140} className="text-white drop-shadow-[0_0_40px_rgba(255,255,255,0.3)]" />
              </motion.div>

               <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                  <NineSlicePanel
                    type="border"
                    variant="default"
                    className="p-6 flex flex-col items-center gap-3 hover:border-[#F5C76B]/30 transition-all relative overflow-hidden cursor-pointer rounded-2xl"
                    style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(16px)' }}
                    onClick={() => handlePull(1, 'soft')}
                    as={motion.button}
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    disabled={isPulling}
                  >
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#F5C76B]/40 to-transparent" />
                    <Coins size={28} className="text-[#F5C76B] drop-shadow-[0_0_10px_rgba(245,199,107,0.5)]" />
                    <div className="text-center">
                      <p className="text-[10px] font-black text-white/40 tracking-[0.2em] mb-1">NORMAL</p>
                      <p className="text-xl font-black text-white">x1</p>
                    </div>
                    <div className="flex items-center gap-2 mt-2 bg-black/30 px-3 py-1 rounded-full">
                      <Coins size={14} className="text-[#F5C76B]" />
                      <span className="text-sm font-bold text-white">100</span>
                    </div>
                  </NineSlicePanel>

                   <NineSlicePanel
                     type="border"
                     variant="blue"
                     className="p-6 flex flex-col items-center gap-3 hover:border-cyan-400/30 transition-all relative overflow-hidden cursor-pointer rounded-2xl"
                     style={{ backgroundColor: 'rgba(26,28,46,0.7)', backdropFilter: 'blur(16px)' }}
                     onClick={() => handlePull(10, 'premium')}
                     as={motion.button}
                     whileHover={{ scale: 1.03, y: -2 }}
                     whileTap={{ scale: 0.97 }}
                     disabled={isPulling}
                   >
                     <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
                     <Diamond size={28} className="text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
                     <div className="text-center">
                       <p className="text-[10px] font-black text-cyan-400/60 tracking-[0.2em] mb-1">PREMIUM</p>
                       <p className="text-xl font-black text-white">x10</p>
                     </div>
                     <div className="flex items-center gap-2 mt-2 bg-black/30 px-3 py-1 rounded-full">
                       <Diamond size={14} className="text-cyan-400" />
                       <span className="text-sm font-bold text-white">450</span>
                       <span className="text-[8px] font-black text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded-full ml-1">-10%</span>
                     </div>
                   </NineSlicePanel>
                </div>

              <div className="mt-16 flex flex-col items-center gap-3">
                <div className="flex items-center gap-4 text-white/40">
                   <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-white/10" />
                   <span className="text-[9px] font-black tracking-[0.4em] uppercase">Garantía Pity</span>
                   <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-white/10" />
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-purple-500/20">
                     <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                     <span className="text-[8px] font-black text-white/60 tracking-wider">ÉPICO EN: <span className="text-purple-400 font-black">10</span></span>
                  </div>
                  <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-orange-500/20">
                     <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
                     <span className="text-[8px] font-black text-white/60 tracking-wider">UR EN: <span className="text-orange-400 font-black">80</span></span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {isPulling && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-xl z-50 flex items-center justify-center flex-col gap-6">
           <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 border-4 border-t-[#F5C76B] border-white/5 rounded-full shadow-[0_0_30px_rgba(245,199,107,0.3)]"
           />
           <p className="text-[10px] font-black text-[#F5C76B] tracking-[0.5em] animate-pulse drop-shadow-[0_0_10px_rgba(245,199,107,0.5)]">INVOCANDO...</p>
        </div>
      )}
    </div>
  );
}
