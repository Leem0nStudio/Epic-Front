'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Diamond, Coins, Zap, Package, Clock } from 'lucide-react';
import { ViewShell } from '@/components/ui/ViewShell';
import { NineSlicePanel } from '@/components/ui/NineSlicePanel';
import { Button } from '@/components/ui/Button';
import { ShopService, type ShopItem } from '@/lib/services/shop-service';
import { useToast } from '@/lib/contexts/ToastContext';
import { gameDebugger } from '@/lib/debug';
import type { PlayerProfile, ViewType } from '@/lib/types/game-types';

interface ShopViewProps {
  profile: PlayerProfile | null;
  onNavigate: (view: ViewType) => void;
  onPurchaseComplete?: () => void;
}

const ITEM_ICONS: Record<string, React.ReactNode> = {
  energy: <Zap size={20} className="text-blue-400" />,
  currency: <Coins size={20} className="text-[#F5C76B]" />,
  pack: <Package size={20} className="text-purple-400" />,
  material: <ShoppingBag size={20} className="text-green-400" />,
};

export function ShopView({ profile, onNavigate, onPurchaseComplete }: ShopViewProps) {
  const { showToast, confirm: confirmToast } = useToast();
  const [items, setItems] = useState<ShopItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    const loadItems = async () => {
      try {
        const data = await ShopService.getItems();
        setItems(data);
      } catch (e) {
        gameDebugger.error('inventory', 'Failed to load shop items', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadItems();
  }, []);

  const handlePurchase = async (item: ShopItem) => {
    const confirmed = await confirmToast(
      `¿Comprar ${item.name} por ${item.priceGems} Cristales?`
    );
    if (!confirmed) return;

    setPurchasing(item.itemId);
    try {
      await ShopService.purchase(item.itemId);
      showToast(`¡${item.name} comprado!`, 'success');
      // Refresh items
      const data = await ShopService.getItems();
      setItems(data);
      onPurchaseComplete?.();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error al comprar';
      showToast(msg, 'error');
    } finally {
      setPurchasing(null);
    }
  };

  const getRemainingPurchases = (item: ShopItem): number | null => {
    if (item.maxPurchasesPerDay === null) return null;
    return Math.max(0, item.maxPurchasesPerDay - item.currentPurchases);
  };

  return (
    <ViewShell title="TIENDA" subtitle="Mejora tu Equipo" onBack={() => onNavigate('home')} background="home" loading={isLoading}>
      <div className="flex-1 flex flex-col p-4 sm:p-6 space-y-4 overflow-hidden">

        {/* Player Gems */}
        <div className="flex items-center justify-end gap-2 shrink-0">
          <Diamond size={14} className="text-cyan-400" />
          <span className="text-sm font-black text-white tabular-nums">{(profile?.gems || 0).toLocaleString()}</span>
          <span className="text-[8px] text-white/40 uppercase">CRISTALES</span>
        </div>

        {/* Shop Items Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-3 pr-1 custom-scrollbar content-start">
          {items.map((item) => {
            const remaining = getRemainingPurchases(item);
            const canAfford = (profile?.gems || 0) >= item.priceGems;
            const isLimited = remaining !== null;

            return (
              <motion.div
                key={item.itemId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <NineSlicePanel
                  type="border"
                  variant="default"
                  className={`p-4 flex flex-col gap-3 glass-frosted transition-all ${
                    !canAfford || (isLimited && remaining === 0)
                      ? 'opacity-50 grayscale'
                      : 'hover:border-[#F5C76B]/40 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                      {ITEM_ICONS[item.itemType] || <ShoppingBag size={16} className="text-white/40" />}
                    </div>
                    {isLimited && (
                      <div className="flex items-center gap-1 ml-auto">
                        <Clock size={10} className="text-white/30" />
                        <span className="text-[8px] font-black text-white/30">{remaining}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <h4 className="text-[11px] font-black text-white uppercase font-display leading-tight">{item.name}</h4>
                    <p className="text-[9px] text-white/40 mt-0.5 leading-tight">{item.description}</p>
                  </div>

                  <Button
                    variant={canAfford && (!isLimited || remaining > 0) ? 'primary' : 'secondary'}
                    size="sm"
                    className="w-full py-2 text-[10px]"
                    disabled={!canAfford || (isLimited && remaining === 0) || purchasing === item.itemId}
                    onClick={() => handlePurchase(item)}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <Diamond size={10} className="text-cyan-400" />
                      <span>{item.priceGems}</span>
                    </div>
                  </Button>
                </NineSlicePanel>
              </motion.div>
            );
          })}
        </div>
      </div>
    </ViewShell>
  );
}
