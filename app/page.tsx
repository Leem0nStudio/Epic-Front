'use client';

import { useGameState } from '@/hooks/useGameState';
import { RPGHomeView } from './components/views/RPGHomeView';
import { TavernView } from './components/views/TavernView';
import { PartyManagementView } from './components/views/PartyManagementView';
import { GachaView } from './components/views/GachaView';
import { UnitDetailsView } from './components/views/UnitDetailsView';
import { InventoryView } from './components/views/InventoryView';
import { BattleScreenView } from './components/views/BattleScreenView';
import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';

export default function Applet() {
  const { state, actions } = useGameState();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !state.isLoaded) {
    return (
      <div className="min-h-screen text-slate-100 bg-slate-900 flex flex-col items-center justify-center font-mono gap-4">
        <div className="w-12 h-12 border-4 border-t-[#c79a5d] border-[#382618] rounded-full animate-spin"></div>
        <p className="animate-pulse">CARGANDO REINO...</p>
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
            <p className="text-slate-400">Vista [{state.view}] en construcción.</p>
            <button onClick={() => actions.navigateTo('home')} className="px-4 py-2 bg-[#382618] text-[#eacf9b] rounded border border-[#5a4227]">Volver</button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0805] bg-[url('https://www.transparenttextures.com/patterns/dark-wood.png')] font-sans sm:p-4 md:p-8 flex items-center justify-center overflow-hidden">
      <div className="w-full max-w-sm sm:max-w-md md:max-w-lg bg-[#1a110a] h-[100dvh] sm:h-[800px] shadow-[0_0_40px_rgba(0,0,0,0.8)] sm:rounded-[8px] overflow-hidden relative border-[2px] sm:border-[4px] border-[#382618] text-[#f2e6d5] flex flex-col items-center">
        <div className="absolute inset-0 pointer-events-none border border-[#5a4227] sm:rounded-[4px] z-50"></div>
        <div className="w-full h-full p-2 sm:p-4 relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={state.view}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 p-2 sm:p-4 flex flex-col overflow-hidden"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
