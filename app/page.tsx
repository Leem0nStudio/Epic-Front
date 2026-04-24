'use client';

import { useGameState } from '@/hooks/useGameState';
import { RPGHomeView } from './components/views/RPGHomeView';
import { TavernView } from './components/views/TavernView';
import { PartyManagementView } from './components/views/PartyManagementView';
import { BattleScreenView } from '@/components/views/BattleScreenView';
import { SummoningScreenView } from '@/components/views/SummoningScreenView';
import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';

export default function Applet() {
  const { state, actions } = useGameState();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // We defer rendering the state until mounted entirely
    // to bypass NextJS randomized data hydration mismatch with Math.random() in onboarding.
    const t = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  if (!isMounted || !state.isLoaded || !state.saveData) {
    return <div className="min-h-screen text-[#f2e6d5] bg-[#0d0805] bg-[url('https://www.transparenttextures.com/patterns/dark-wood.png')] flex items-center justify-center font-serif">Loading RPG State...</div>;
  }

  const renderView = () => {
    switch (state.view) {
      case 'home':
        return <RPGHomeView 
                 saveData={state.saveData!} 
                 activePartyUnits={state.activePartyUnits} 
                 onNavigate={actions.navigateTo} 
               />;
      case 'tavern':
        return <TavernView 
                 saveData={state.saveData!} 
                 onNavigate={actions.navigateTo}
                 onClaim={actions.handleClaimRecruit}
                 onDiscard={actions.handleDiscardRecruit} 
               />;
      case 'party':
        return <PartyManagementView 
                 saveData={state.saveData!}
                 activePartyUnits={state.activePartyUnits}
                 onNavigate={actions.navigateTo}
                 onAssignToParty={actions.handleAssignPartySlot}
                 onRemoveFromParty={actions.handleRemovePartySlot}
               />;
      case 'gacha':
        return <SummoningScreenView />;
      case 'battle':
        return <BattleScreenView 
                 squad={state.activePartyUnits} 
                 onBack={() => actions.navigateTo('home')} 
               />;
      default:
        // Fallback or WIP views
        return (
          <div className="flex flex-col items-center justify-center h-full space-y-4 bg-[#0d0805] bg-[url('https://www.transparenttextures.com/patterns/dark-wood.png')]">
            <p className="text-[#a68a68]">View [{state.view}] is under construction.</p>
            <button onClick={() => actions.navigateTo('home')} className="px-4 py-2 bg-[#1a110a] border border-[#382618] text-[#eacf9b] rounded font-serif hover:border-[#c79a5d]">Go Home</button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0805] bg-[url('https://www.transparenttextures.com/patterns/dark-wood.png')] font-sans sm:p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-sm sm:max-w-md md:max-w-lg bg-[#1a110a] h-[100dvh] sm:h-[800px] shadow-[0_0_40px_rgba(0,0,0,0.8)] sm:rounded-[8px] overflow-hidden relative border-[2px] sm:border-[4px] border-[#382618] text-[#f2e6d5] flex flex-col items-center">
        {/* Main bezel / border styling similar to a retro framing */}
        <div className="absolute inset-0 pointer-events-none border border-[#5a4227] sm:rounded-[4px] z-50"></div>
        <div className="w-full h-full p-2 sm:p-4 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={state.view}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 p-2 sm:p-4 flex flex-col"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
