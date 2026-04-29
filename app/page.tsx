'use client';

import { useGameState } from '@/hooks/useGameState';
import { RPGHomeView } from '@/components/views/RPGHomeView';
import { TavernView } from '@/components/views/TavernView';
import { PartyManagementView } from '@/components/views/PartyManagementView';
import { GachaView } from '@/components/views/GachaView';
import { UnitDetailsView } from '@/components/views/UnitDetailsView';
import { InventoryView } from '@/components/views/InventoryView';
import { BattleScreenView } from '@/components/views/BattleScreenView';
import { CampaignMapView } from '@/components/views/CampaignMapView';
import { StageDetailsView } from '@/components/views/StageDetailsView';
import { AuthView } from '@/components/views/AuthView';
import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/lib/contexts/ToastContext';

export default function Applet() {
  const { showToast } = useToast();
  const { state, actions } = useGameState(showToast);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || state.isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#0B1A2A] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Conectando..." />
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
      <div className="min-h-screen bg-[#0B1A2A] flex items-center justify-center p-4">
        <ErrorDisplay
          title="Error de Carga"
          message={state.error}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  if (!state.isLoaded) {
    return (
      <div className="min-h-screen bg-[#0B1A2A] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Cargando Reino..." />
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
                 onOpenFullInventory={actions.openFullInventory}
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
                 fromUnitDetails={!!state.selectedUnitId}
                 onBack={() => actions.navigateTo(state.selectedUnitId ? 'unit_details' : 'home')}
                 onEquip={actions.handleEquipItem}
               />;
      case 'campaign':
        return <CampaignMapView
                 playerEnergy={state.profile?.energy || 0}
                 onNavigate={actions.navigateTo}
                 onSelectStage={actions.handleSelectStage}
               />;
      case 'stage_details':
        return <StageDetailsView
                 stage={state.selectedStage!}
                 playerEnergy={state.profile?.energy || 0}
                 onBack={() => actions.navigateTo('campaign')}
                 onStartBattle={actions.handleStartBattle}
               />;
      case 'battle':
        return <BattleScreenView 
                 squad={state.activePartyUnits} 
                 stageId={state.selectedStage?.id}
                 onBack={() => actions.navigateTo('campaign')}
                 onRefresh={actions.refreshState}
               />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Vista [{state.view}] en construcción.</p>
            <Button onClick={() => actions.navigateTo('home')} variant="secondary" size="sm">
              Volver
            </Button>
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
