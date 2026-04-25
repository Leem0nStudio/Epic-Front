'use client';

import { useGameState } from '@/hooks/useGameState';
import { RPGHomeView } from '@/components/views/RPGHomeView';
import { TavernView } from '@/components/views/TavernView';
import { PartyManagementView } from '@/components/views/PartyManagementView';
import { GachaView } from '@/components/views/GachaView';
import { UnitDetailsView } from '@/components/views/UnitDetailsView';
import { InventoryView } from '@/components/views/InventoryView';
import { BattleScreenView } from '@/components/views/BattleScreenView';
import { AuthView } from '@/components/views/AuthView';
import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';

export default function Applet() {
  const { state, actions } = useGameState();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || state.isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#0B1A2A] flex flex-col items-center justify-center font-sans gap-4">
        <div className="w-12 h-12 border-2 border-t-[#F5C76B] border-white/5 rounded-full animate-spin"></div>
        <p className="text-[10px] font-black text-white/40 tracking-[0.5em] animate-pulse uppercase">Conectando...</p>
      </div>
    );
  }

  if (!state.isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0B1A2A] flex items-center justify-center p-4">
        <AuthView />
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="min-h-screen bg-[#0B1A2A] flex flex-col items-center justify-center font-sans p-8 text-center gap-4">
        <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center text-red-500 text-2xl font-black">!</div>
        <h1 className="text-xl font-black text-white tracking-widest uppercase italic">Error de Carga</h1>
        <p className="text-white/40 text-xs max-w-md uppercase tracking-wider">{state.error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-white tracking-widest hover:bg-white/10 transition-colors uppercase">Reintentar</button>
      </div>
    );
  }

  if (!state.isLoaded) {
    return (
      <div className="min-h-screen bg-[#0B1A2A] flex flex-col items-center justify-center font-sans gap-4">
        <div className="w-12 h-12 border-2 border-t-[#F5C76B] border-white/5 rounded-full animate-spin"></div>
        <p className="text-[10px] font-black text-white/40 tracking-[0.5em] animate-pulse uppercase">Cargando Reino...</p>
      </div>
    );
  }

  const renderView = () => {
    switch (state.view) {
      case 'home':
        return <RPGHomeView 
                 saveData={state as any}
                 activePartyUnits={state.activePartyUnits} 
                 onNavigate={actions.navigateTo} 
               />;
      case 'tavern':
        return <TavernView 
                 saveData={state as any}
                 onNavigate={actions.navigateTo}
                 onClaim={actions.handleClaimRecruit}
                 onDiscard={() => {}}
               />;
      case 'party':
        return <PartyManagementView 
                 saveData={state as any}
                 activePartyUnits={state.activePartyUnits}
                 onNavigate={actions.navigateTo}
                 onAssignToParty={actions.handleAssignPartySlot}
                 onRemoveFromParty={(idx) => actions.handleAssignPartySlot(idx, null)}
                 onSelectUnit={actions.handleSelectUnit}
               />;
      case 'gacha':
        return <GachaView
                 profile={state.profile}
                 onNavigate={actions.navigateTo}
               />;
      case 'unit_details':
        return <UnitDetailsView
                 unitId={state.selectedUnitId!}
                 onNavigate={actions.navigateTo}
                 onUpdate={actions.refreshState}
                 onOpenInventory={actions.handleOpenInventory}
               />;
      case 'inventory':
        return <InventoryView
                 targetSlot={state.targetSlot}
                 onBack={() => actions.navigateTo('unit_details')}
                 onEquip={actions.handleEquipItem}
               />;
      case 'battle':
        return <BattleScreenView 
                 squad={state.activePartyUnits} 
                 onBack={() => actions.navigateTo('home')} 
                 onRefresh={actions.refreshState}
               />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Vista [{state.view}] en construcción.</p>
            <button onClick={() => actions.navigateTo('home')} className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-white tracking-widest uppercase">Volver</button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#020508] font-sans flex items-center justify-center overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] aspect-square bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] aspect-square bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="w-full max-w-sm sm:max-w-md md:max-w-lg bg-[#0B1A2A] h-[100dvh] sm:h-[850px] shadow-[0_0_80px_rgba(0,0,0,0.9)] sm:rounded-[40px] overflow-hidden relative border-white/5 flex flex-col items-center sm:border">
        <div className="w-full h-full relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={state.view}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex flex-col overflow-hidden"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
