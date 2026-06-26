'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Diamond, Coins, Box, ScrollText, Zap, Info, Star, Sword, ChevronLeft, ChevronRight } from 'lucide-react';
import { AssetService } from '@/lib/services/asset-service';
import { NineSlicePanel } from '@/components/ui/NineSlicePanel';
import { RarityIcon } from '@/components/ui/RarityIcon';
import { RarityBadge } from '@/components/ui/RarityBadge';
import { Button } from '@/components/ui/Button';
import { ViewShell } from '@/components/ui/ViewShell';
import { getRarityCode, RARITY_COLORS } from '@/lib/config/assets-config';
import { GachaService, type PullResult } from '@/lib/services/gacha-service';
import { BannerService, type Banner, type BannerPity } from '@/lib/services/banner-service';
import { InventoryService } from '@/lib/services/inventory-service';
import { GACHA_COSTS } from '@/lib/config/gacha-config';
import { useToast } from '@/lib/contexts/ToastContext';
import { gameDebugger } from '@/lib/debug';
import type { PlayerProfile, ViewType } from '@/lib/types/game-types';

interface GachaViewProps {
  profile: PlayerProfile | null;
  onNavigate: (view: ViewType) => void;
  onPullComplete?: () => void;
}

export function GachaView({ profile, onNavigate, onPullComplete }: GachaViewProps) {
  const { showToast, confirm: confirmToast } = useToast();
  const [isPulling, setIsPulling] = useState(false);
  const [results, setResults] = useState<PullResult[]>([]);
  const [selectedReward, setSelectedReward] = useState<PullResult | null>(null);
  const pullLockRef = useRef(false);

  // Banner state
  const [banners, setBanners] = useState<Banner[]>([]);
  const [selectedBannerIdx, setSelectedBannerIdx] = useState(0);
  const [bannerPity, setBannerPity] = useState<BannerPity | null>(null);
  const [globalPity, setGlobalPity] = useState<{ pullsSinceEpic: number; pullsSinceLegendary: number } | null>(null);

  const selectedBanner = banners[selectedBannerIdx] || null;

  // Fetch banners on mount
  useEffect(() => {
    const loadBanners = async () => {
      try {
        const data = await BannerService.getActiveBanners();
        setBanners(data);
      } catch (e) {
        gameDebugger.error('gacha', 'Failed to load banners', e);
      }
    };
    loadBanners();
  }, []);

  // Fetch pity when banner changes
  useEffect(() => {
    if (!selectedBanner) return;
    const loadPity = async () => {
      try {
        if (selectedBanner.bannerType === 'standard') {
          const pity = await BannerService.getGlobalPity();
          setGlobalPity(pity);
          setBannerPity(null);
        } else {
          const pity = await BannerService.getBannerPity(selectedBanner.id);
          setBannerPity(pity);
          setGlobalPity(null);
        }
      } catch (e) {
        gameDebugger.error('gacha', 'Failed to load pity', e);
      }
    };
    loadPity();
  }, [selectedBanner]);

  // Get costs from selected banner
  const singleCost = selectedBanner?.currencyCost
    ? selectedBanner.currencyCost.premium.single
    : GACHA_COSTS.premium.single;
  const multiCost = selectedBanner?.currencyCost
    ? selectedBanner.currencyCost.premium.multi
    : GACHA_COSTS.premium.multi;
  const softSingleCost = selectedBanner?.currencyCost
    ? selectedBanner.currencyCost.soft.single
    : GACHA_COSTS.soft.single;

  const handlePull = async (amount: number, currency: 'soft' | 'premium') => {
    if (pullLockRef.current || !selectedBanner) return;
    pullLockRef.current = true;

    // Confirmation for premium pulls
    if (currency === 'premium') {
      const price = amount === 10 ? multiCost : singleCost;
      const confirmed = await confirmToast(`¿Gastar ${price} CRISTALES en ${amount}x invocaciones?`);
      if (!confirmed) { pullLockRef.current = false; return; }
    }

    setIsPulling(true);
    setResults([]);
    setSelectedReward(null);
    try {
      const items = await GachaService.pull(amount, currency, selectedBanner.id);
      gameDebugger.info('gacha', 'Pull completed', { count: items.length, items });

      // Batch save items to inventory
      await Promise.all(items.map(item =>
        InventoryService.addItem(item.item_id, item.item_type as any, 1)
      ));
      gameDebugger.info('gacha', 'Items saved to inventory', { count: items.length });

      setResults(items);

      // Refresh pity
      if (selectedBanner.bannerType === 'standard') {
        const pity = await BannerService.getGlobalPity();
        setGlobalPity(pity);
      } else {
        const pity = await BannerService.getBannerPity(selectedBanner.id);
        setBannerPity(pity);
      }

      if (onPullComplete) {
        onPullComplete();
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Error desconocido';
      gameDebugger.error('gacha', 'Pull failed', e);
      showToast(message, 'error');
    } finally {
      setIsPulling(false);
      pullLockRef.current = false;
    }
  };

  const handleClaimSpark = async (itemId: string) => {
    if (!selectedBanner) return;
    try {
      await BannerService.claimSpark(selectedBanner.id, itemId);
      showToast('¡Item reclamado con Spark!', 'success');
      const pity = await BannerService.getBannerPity(selectedBanner.id);
      setBannerPity(pity);
      if (onPullComplete) onPullComplete();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Error al reclamar spark';
      showToast(message, 'error');
    }
  };

  const getItemIcon = (item: PullResult) => {
    if (item.item_type === 'weapon') return <Sword size={24} className="text-white/80" />;
    if (item.item_type === 'card') return <img src={AssetService.getCardUrlWithFallback(item.item_id)} className="w-10 h-10 object-contain" alt={item.item_name} />;
    if (item.item_type === 'skill') return <ScrollText size={24} className="text-white/80" />;
    return <Box size={24} className="text-white/80" />;
  };

  // Time left for banner
  const getTimeLeft = (endDate: string | null) => {
    if (!endDate) return null;
    // eslint-disable-next-line react-hooks/purity -- Date.now is acceptable for time display
    const diff = new Date(endDate).getTime() - Date.now();
    if (diff <= 0) return 'FINALIZADO';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}D ${hours}H`;
  };

  return (
    <ViewShell title="INVOCACIÓN" subtitle="Adquiere Equipo Legendario" onBack={() => onNavigate('home')} background="gacha">
      <div className="flex-1 flex flex-col p-4 sm:p-6 space-y-4 overflow-hidden relative">

        {/* Banner Selector */}
        {banners.length > 1 && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setSelectedBannerIdx(i => (i - 1 + banners.length) % banners.length)}
              className="p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ChevronLeft size={16} className="text-white/60" />
            </button>
            <div className="flex-1 flex gap-2 overflow-x-auto custom-scrollbar pb-1">
              {banners.map((b, idx) => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBannerIdx(idx)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                    idx === selectedBannerIdx
                      ? 'bg-[#F5C76B]/20 border border-[#F5C76B]/40 text-[#F5C76B]'
                      : 'bg-white/5 border border-white/10 text-white/40 hover:bg-white/10'
                  }`}
                >
                  {b.name}
                </button>
              ))}
            </div>
            <button
              onClick={() => setSelectedBannerIdx(i => (i + 1) % banners.length)}
              className="p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ChevronRight size={16} className="text-white/60" />
            </button>
          </div>
        )}

        {/* Banner Display */}
        <NineSlicePanel type="border" variant="fancy" className="aspect-[16/9] glass-frosted frame-earthstone relative overflow-hidden group shrink-0 panel-elevated-lg">
          <img src={AssetService.getBgUrl('gacha')} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-[10s]" alt="Banner" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1A2A] via-transparent to-transparent" />

          <div className="absolute bottom-4 left-4 right-4">
             <div className="flex items-center gap-2 mb-1">
                <Sparkles size={16} className="text-[#F5C76B] animate-pulse" />
                <span className="text-[10px] font-black text-[#F5C76B] uppercase tracking-widest">
                  {selectedBanner?.bannerType === 'rate_up' ? 'TASA MEJORADA' : selectedBanner?.bannerType === 'collab' ? 'COLABORACIÓN' : 'EVENTO LIMITADO'}
                </span>
             </div>
             <h2 className="text-xl font-black text-white uppercase font-display leading-none">{selectedBanner?.name || 'Cargando...'}</h2>
             {selectedBanner?.description && (
               <p className="text-[10px] text-white/40 mt-1">{selectedBanner.description}</p>
             )}
          </div>

          {/* Time left */}
          {selectedBanner?.endDate && (
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border border-[#F5C76B]/30 px-3 py-1 rounded-full flex items-center gap-2">
              <Zap size={12} className="text-[#F5C76B]" />
              <span className="text-[9px] font-black text-white/80 uppercase tracking-widest">{getTimeLeft(selectedBanner.endDate)}</span>
            </div>
          )}

          <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md border border-[#F5C76B]/30 px-3 py-1 rounded-full flex items-center gap-2">
             <Info size={12} className="text-[#F5C76B]" />
             <span className="text-[9px] font-black text-white/80 uppercase tracking-widest">Detalles Prob.</span>
          </div>
        </NineSlicePanel>

        {/* Featured Items */}
        {selectedBanner?.featuredItems && selectedBanner.featuredItems.length > 0 && (
          <div className="shrink-0">
            <div className="flex items-center gap-2 mb-2">
              <Star size={12} className="text-[#F5C76B] fill-[#F5C76B]" />
              <span className="text-[9px] font-black text-[#F5C76B] uppercase tracking-widest">Featured Items</span>
              {selectedBanner.rateUpMultiplier > 1 && (
                <span className="text-[8px] font-black text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded-full">x{selectedBanner.rateUpMultiplier} RATE UP</span>
              )}
            </div>
            <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
              {selectedBanner.featuredItems.map((fi) => (
                <div key={fi.itemId} className="shrink-0 w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <span className="text-[8px] text-white/60 text-center leading-tight px-1">{fi.itemId.replace(/_/g, ' ').slice(0, 12)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pity Progress */}
        <div className="shrink-0 space-y-2">
          {selectedBanner?.bannerType !== 'standard' && bannerPity && (
            <>
              <div className="flex items-center justify-between text-[9px] uppercase tracking-widest font-black">
                <span className="text-white/40">Legendary Pity</span>
                <span className="text-white/60">{bannerPity.pullsSinceLegendary}/80</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#F5C76B] to-yellow-300 rounded-full transition-all" style={{ width: `${(bannerPity.pullsSinceLegendary / 80) * 100}%` }} />
              </div>
              {bannerPity.sparkCost && (
                <>
                  <div className="flex items-center justify-between text-[9px] uppercase tracking-widest font-black">
                    <span className="text-white/40">Spark</span>
                    <span className="text-cyan-400">{bannerPity.sparkCount}/{bannerPity.sparkCost}</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-500 to-cyan-300 rounded-full transition-all" style={{ width: `${(bannerPity.sparkCount / bannerPity.sparkCost) * 100}%` }} />
                  </div>
                </>
              )}
            </>
          )}
          {selectedBanner?.bannerType === 'standard' && globalPity && (
            <>
              <div className="flex items-center justify-between text-[9px] uppercase tracking-widest font-black">
                <span className="text-white/40">Legendary Pity</span>
                <span className="text-white/60">{globalPity.pullsSinceLegendary}/80</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#F5C76B] to-yellow-300 rounded-full transition-all" style={{ width: `${(globalPity.pullsSinceLegendary / 80) * 100}%` }} />
              </div>
            </>
          )}
        </div>

        {/* Currency Display */}
        <div className="grid grid-cols-2 gap-3 shrink-0">
          <CurrencyCard icon={Coins} value={profile?.currency || 0} label="ZENY" color="text-[#F5C76B]" />
          <CurrencyCard icon={Diamond} value={profile?.gems || 0} label="CRISTALES" color="text-cyan-400" />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-auto shrink-0">
          <PullButton
            amount={1}
            price={softSingleCost}
            currency="soft"
            disabled={isPulling || !selectedBanner || (profile?.currency || 0) < softSingleCost}
            insufficient={(profile?.currency || 0) < softSingleCost}
            onClick={() => handlePull(1, 'soft')}
          />
          <PullButton
            amount={10}
            price={multiCost}
            currency="premium"
            disabled={isPulling || !selectedBanner || (profile?.gems || 0) < multiCost}
            insufficient={(profile?.gems || 0) < multiCost}
            onClick={() => handlePull(10, 'premium')}
            highlight
          />
        </div>

        {/* Results Overlay */}
        <AnimatePresence>
          {(isPulling || results.length > 0) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-[#0B1A2A]/98 backdrop-blur-2xl flex flex-col p-4 sm:p-6"
            >
              {isPulling ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 sm:p-6">
                  <div className="relative">
                     <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="w-24 h-24 border-2 border-dashed border-[#F5C76B]/40 rounded-full" />
                     <Sparkles size={40} className="absolute inset-0 m-auto text-[#F5C76B] animate-pulse" />
                  </div>
                  <p className="text-[11px] font-black text-white/40 uppercase tracking-[0.4em] animate-pulse">Abriendo Portal...</p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-black text-white uppercase font-display tracking-widest">RESULTADOS</h3>
                    <div className="w-24 h-1 bg-[#F5C76B] mx-auto mt-2 shadow-[0_0_10px_#F5C76B]" />
                  </div>

                  <div className="flex-1 overflow-y-auto grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3 pr-2 custom-scrollbar content-start">
                    {results.map((item, idx) => (
                      <motion.div
                        key={`${item.item_id}-${idx}`}
                        initial={{ opacity: 0, scale: 0.5, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ delay: idx * 0.05, type: 'spring' }}
                        className="aspect-square relative group cursor-pointer card-premium"
                        onClick={() => setSelectedReward(item)}
                      >
                         <NineSlicePanel type="border" variant="default" rarity={item.rarity} className={`w-full h-full glass-crystal flex items-center justify-center group-hover:scale-105 transition-transform ${item.rarity ? `card-glow-${item.rarity.toLowerCase()}` : ''}`}>
                            {getItemIcon(item)}
                         </NineSlicePanel>
                         {['rare', 'epic', 'legendary', 'mythic'].includes(item.rarity.toLowerCase()) && (
                            <div className="absolute -top-1 -right-1">
                               <Star size={10} className="text-[#F5C76B] fill-[#F5C76B]" />
                            </div>
                         )}
                      </motion.div>
                    ))}
                  </div>

                  <Button onClick={() => setResults([])} variant="primary" className="mt-8 w-full py-6 font-display text-lg tracking-widest">
                    RECOGER RECOMPENSAS
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reward Detail Modal */}
        <AnimatePresence>
          {selectedReward && (
            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setSelectedReward(null)}
               className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-8 backdrop-blur-md"
            >
               <motion.div
                 initial={{ scale: 0.9, y: 20 }}
                 animate={{ scale: 1, y: 0 }}
                 onClick={e => e.stopPropagation()}
                 className="w-full max-w-xs"
               >
                  <NineSlicePanel type="panel" variant="default" rarity={selectedReward.rarity} className="p-8 text-center glass-frosted frame-earthstone relative overflow-hidden">
                     <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-[#F5C76B]/10 to-transparent pointer-events-none" />

                     <div className="mb-6 flex justify-center">
                        <RarityIcon rarity={getRarityCode(selectedReward.rarity)} size="lg" glass>
                           <div className="p-4">{getItemIcon(selectedReward)}</div>
                        </RarityIcon>
                     </div>

                     <h4 className="text-2xl font-black text-white uppercase font-display mb-1">{selectedReward.item_name}</h4>
                     <RarityBadge rarity={selectedReward.rarity} className="mx-auto mb-4" />

                     <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-6">
                        Nuevo objeto añadido al inventario
                     </p>

                     <Button onClick={() => setSelectedReward(null)} variant="secondary" size="sm" className="w-full">
                        CERRAR
                     </Button>
                  </NineSlicePanel>
               </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ViewShell>
  );
}

interface CurrencyCardProps {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  value: number;
  label: string;
  color: string;
}

function CurrencyCard({ icon: Icon, value, label, color }: CurrencyCardProps) {
  return (
    <div className="bg-black/40 border border-white/5 p-3 rounded-2xl flex flex-col gap-1">
       <div className="flex items-center gap-2">
          <Icon size={12} className={color} />
          <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">{label}</span>
       </div>
       <span className="text-sm font-black text-white tabular-nums">{value.toLocaleString()}</span>
    </div>
  );
}

interface PullButtonProps {
  amount: number;
  price: number;
  currency: 'soft' | 'premium';
  onClick: () => void;
  disabled: boolean;
  insufficient?: boolean;
  highlight?: boolean;
}

function PullButton({ amount, price, currency, onClick, disabled, insufficient, highlight }: PullButtonProps) {
  const Icon = currency === 'soft' ? Coins : Diamond;
  const color = currency === 'soft' ? 'text-[#F5C76B]' : 'text-cyan-400';
  
  return (
    <Button
      whileHover={!disabled ? { y: -4, scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onClick={onClick}
      disabled={disabled}
      variant={highlight ? 'primary' : 'secondary'}
      className={`flex flex-col items-center gap-2 p-4 rounded-3xl border transition-all card-premium ${
        highlight
          ? 'border-[#F5C76B]/30 shadow-[0_10px_30px_rgba(245,199,107,0.1)] card-glow-rare'
          : 'border-white/10 hover:bg-white/10'
      } ${disabled ? 'opacity-50 grayscale' : ''} ${insufficient ? 'border-red-500/30' : ''}`}
    >
      <div className="flex items-center gap-2">
         <Sparkles size={16} className={highlight ? 'text-[#F5C76B]' : 'text-white/40'} />
         <span className="text-lg font-black text-white uppercase font-display italic">x{amount}</span>
      </div>
      <div className="flex items-center gap-1.5 px-3 py-1 bg-black/40 rounded-full border border-white/5">
         <Icon size={10} className={color} />
         <span className={`text-[10px] font-black ${insufficient ? 'text-red-400' : color} tabular-nums`}>{price.toLocaleString()}</span>
      </div>
    </Button>
  );
}
