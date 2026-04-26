'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CombatUnit, CombatState, SkillDefinition, StatusEffect } from '@/lib/types/combat';
import { BattleManager } from '@/lib/services/battle-manager';
import { CombatAdapter } from '@/lib/services/combat-adapter';
import { UnitService } from '@/lib/services/unit-service';
import { ChevronLeft, Sword, Shield, Award, Zap, Heart, Terminal, Swords, AlertTriangle, PlayCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BattleScreenViewProps {
  squad: any[];
  onBack: () => void;
  onRefresh: () => void;
}

export function BattleScreenView({ squad, onBack, onRefresh }: BattleScreenViewProps) {
  const [units, setUnits] = useState<CombatUnit[]>([]);
  const [turn, setTurn] = useState(0);
  const [round, setRound] = useState(1);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [activeUnitId, setActiveUnitId] = useState<string | null>(null);
  const [isBattleOver, setIsBattleOver] = useState(false);
  const [winner, setWinner] = useState<'player' | 'enemy' | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<SkillDefinition | null>(null);
  const [targetId, setTargetId] = useState<string | null>(null);
  
  const turnInProgress = useRef(false);

  useEffect(() => {
    initializeBattle();
  }, []);

  const initializeBattle = async () => {
    setIsInitializing(true);
    setInitError(null);
    addLog("Iniciando protocolos de combate...");

    try {
        const pUnits: CombatUnit[] = [];
        const activeSquad = (squad || []).filter(u => u !== null);
        
        if (activeSquad.length === 0) {
            setInitError("No se detectaron unidades activas en tu escuadrón.");
            setIsInitializing(false);
            return;
        }

        // Positions: 0,1,2 = Front, 3,4 = Back
        for (let i = 0; i < activeSquad.length; i++) {
            const unit = activeSquad[i];
            const combatUnit = await CombatAdapter.dbUnitToCombatUnit(unit.id, 'player', i);
            pUnits.push(combatUnit);
        }
        
        const eUnits = [
          CombatAdapter.createEnemy('enemy_1', 'Limo Débil', 1, 0),
          CombatAdapter.createEnemy('enemy_2', 'Murciélago Menor', 1, 1)
        ];

        setUnits([...pUnits, ...eUnits]);
        addLog("Enlace de datos completo. Comenzando simulación.");
        setIsInitializing(false);
    } catch (err: any) {
        console.error("Initialization error:", err);
        setInitError("Error crítico de sistema: " + (err.message || "Desconocido"));
        setIsInitializing(false);
    }
  };

  const addLog = (msg: string) => setBattleLog(prev => [msg, ...prev].slice(0, 5));

  const runTurn = async (actor: CombatUnit, skill: SkillDefinition, manualTarget?: string) => {
    if (turnInProgress.current) return;
    turnInProgress.current = true;
    
    setActiveUnitId(actor.id);
    addLog(`TURNO: ${actor.name} usa ${skill.name}`);

    await new Promise(r => setTimeout(r, 800));

    const { results, updatedUnits } = BattleManager.executeTurn(actor, skill, units, manualTarget);

    results.forEach(r => addLog(r.log));

    setUnits(updatedUnits);
    await new Promise(r => setTimeout(r, 600));

    // Cleanup turn
    setActiveUnitId(null);
    setSelectedSkill(null);
    setTargetId(null);

    const nextTurn = turn + 1;
    const order = BattleManager.getTurnOrder(updatedUnits);

    if (nextTurn >= order.length) {
      setTurn(0);
      setRound(r => r + 1);
      // Update status effects for everyone at round end
      setUnits(prev => prev.map(u => BattleManager.updateUnitStartTurn(u)));
    } else {
      setTurn(nextTurn);
    }

    turnInProgress.current = false;
  };

  useEffect(() => {
    if (isInitializing || isBattleOver || turnInProgress.current || initError) return;

    const alivePlayers = units.filter(u => u.side === 'player' && !u.isDead);
    const aliveEnemies = units.filter(u => u.side === 'enemy' && !u.isDead);

    if (units.length > 0) {
      if (alivePlayers.length === 0) {
        setIsBattleOver(true);
        setWinner('enemy');
        return;
      }
      if (aliveEnemies.length === 0) {
        setIsBattleOver(true);
        setWinner('player');
        return;
      }
    }

    const order = BattleManager.getTurnOrder(units);
    if (order.length === 0) return;

    const currentActor = order[turn];
    if (!currentActor) {
      setTurn(0);
      return;
    }

    // Auto-run enemy turns
    if (currentActor.side === 'enemy') {
      const skill = currentActor.skills[0];
      const timer = setTimeout(() => runTurn(currentActor, skill), 1500);
      return () => clearTimeout(timer);
    }
  }, [units, turn, isInitializing, isBattleOver, initError]);

  if (isInitializing) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center bg-[#020508] gap-4">
            <Swords size={48} className="text-[#F5C76B] animate-bounce" />
            <p className="text-[10px] font-black text-white/40 tracking-[0.5em] uppercase">Estableciendo Conexión...</p>
        </div>
    );
  }

  if (initError) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center bg-[#020508] p-8 text-center gap-6">
            <AlertTriangle size={40} className="text-amber-400" />
            <h2 className="text-white font-black uppercase tracking-widest italic text-lg">Incompatibilidad de Datos</h2>
            <p className="text-white/40 text-[10px] uppercase tracking-wider leading-relaxed">{initError}</p>
            <button onClick={onBack} className="px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors">Regresar</button>
        </div>
    );
  }

  const order = BattleManager.getTurnOrder(units);
  const currentActor = order[turn];

  return (
    <div className="flex flex-col h-full bg-[#020508] overflow-hidden relative">
      <div className="p-4 flex items-center justify-between border-b border-white/5 bg-[#0B1A2A] z-10 shadow-2xl shrink-0">
         <button onClick={onBack} className="text-white/40 hover:text-white flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors"><ChevronLeft size={16} /> Retirada</button>
         <div className="flex flex-col items-center">
            <span className="text-[10px] text-[#F5C76B] font-black uppercase tracking-[0.4em] italic">Round {round}</span>
            <span className="text-[9px] text-white/20 font-mono tracking-widest mt-0.5 uppercase">Sync Cycle: {turn + 1}</span>
         </div>
         <div className="w-20"></div>
      </div>

      <div className="flex-1 relative overflow-hidden flex flex-col items-center justify-around py-4">
         <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 via-transparent to-red-900/10 pointer-events-none" />

         {/* Enemy Grid */}
         <div className="grid grid-cols-3 gap-8 relative p-4">
            {units.filter(u => u.side === 'enemy').map(enemy => (
              <motion.div
                key={enemy.id}
                animate={{
                    opacity: enemy.isDead ? 0.2 : 1,
                    scale: activeUnitId === enemy.id ? 1.1 : 1,
                    y: activeUnitId === enemy.id ? 10 : 0
                }}
                onClick={() => !enemy.isDead && currentActor?.side === 'player' && setTargetId(enemy.id)}
                className={`relative flex flex-col items-center ${targetId === enemy.id ? 'ring-2 ring-red-500 rounded-full' : ''}`}
              >
                 <div className="w-20 h-1 bg-black/60 rounded-full mb-2 border border-white/10 overflow-hidden">
                    <motion.div animate={{ width: `${(enemy.currentHp / enemy.maxHp) * 100}%` }} className="h-full bg-red-500" />
                 </div>
                 <div className="w-20 h-20 bg-black/40 rounded-full flex items-center justify-center relative border border-red-500/10">
                    <img
                      src="https://raw.githubusercontent.com/Leem0nGames/gameassets/main/RO/abbys_sprite_001.png"
                      className="w-[180%] max-w-none transform translate-y-3 brightness-50"
                      style={{imageRendering: 'pixelated'}}
                    />
                    {enemy.isTaunting && <Shield className="absolute top-0 right-0 text-red-500" size={16} />}
                 </div>
                 <span className="text-[8px] font-black text-red-400 mt-2 uppercase">{enemy.name}</span>
              </motion.div>
            ))}
         </div>

         {/* Player Grid */}
         <div className="grid grid-cols-3 gap-8 relative p-4">
            {units.filter(u => u.side === 'player').map(player => (
              <motion.div
                key={player.id}
                animate={{
                    opacity: player.isDead ? 0.1 : 1,
                    scale: activeUnitId === player.id ? 1.1 : 1,
                    y: activeUnitId === player.id ? -10 : 0
                }}
                className="relative flex flex-col items-center"
              >
                 <div className="w-16 h-16 bg-black/40 rounded-full flex items-center justify-center relative border border-cyan-500/10">
                    <img
                      src="https://raw.githubusercontent.com/Leem0nGames/gameassets/main/RO/abbys_sprite_001.png"
                      className="w-[200%] max-w-none transform translate-y-4 brightness-110"
                      style={{imageRendering: 'pixelated'}}
                    />
                    {activeUnitId === player.id && <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ repeat: Infinity }} className="absolute inset-0 border-2 border-[#F5C76B] rounded-full" />}
                 </div>
                 <div className="w-16 h-1 bg-black/60 rounded-full mt-3 border border-white/10 overflow-hidden">
                    <motion.div animate={{ width: `${(player.currentHp / player.maxHp) * 100}%` }} className="h-full bg-cyan-400" />
                 </div>
                 <div className="w-16 h-1 bg-black/60 rounded-full mt-1 border border-white/10 overflow-hidden">
                    <motion.div animate={{ width: `${player.burst}%` }} className="h-full bg-yellow-500" />
                 </div>
                 <span className="text-[8px] font-black text-white/60 mt-2 uppercase">{player.name}</span>
              </motion.div>
            ))}
         </div>
      </div>

      {/* Control Panel */}
      <div className="h-48 bg-[#0B1A2A] border-t border-white/5 p-4 flex gap-4 shrink-0 overflow-hidden">
         <div className="flex-1 flex flex-col bg-black/20 rounded-2xl p-3 overflow-y-auto gap-2">
            <div className="flex items-center gap-2 text-white/20 mb-1">
                <Terminal size={10} />
                <span className="text-[8px] font-black uppercase tracking-widest">Logs de Batalla</span>
            </div>
            {battleLog.map((log, i) => (
              <div key={i} className="text-[9px] text-white/40 font-bold uppercase tracking-wider">
                {log}
              </div>
            ))}
         </div>

         <div className="w-48 flex flex-col gap-2">
            <div className="text-[8px] font-black text-white/20 uppercase tracking-widest">Acciones</div>
            {currentActor?.side === 'player' && !isBattleOver && (
               <div className="grid grid-cols-1 gap-2 overflow-y-auto">
                 {currentActor.skills.map(skill => (
                   <button
                     key={skill.id}
                     disabled={!!currentActor.cooldowns[skill.id]}
                     onClick={() => runTurn(currentActor, skill, targetId || undefined)}
                     className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                       currentActor.cooldowns[skill.id]
                       ? 'bg-white/5 border-white/5 text-white/20 opacity-50'
                       : 'bg-[#F5C76B]/10 border-[#F5C76B]/20 text-[#F5C76B] hover:bg-[#F5C76B]/20'
                     }`}
                   >
                     <span className="text-[9px] font-black uppercase tracking-widest">{skill.name}</span>
                     {currentActor.cooldowns[skill.id] ? (
                        <span className="text-[9px] font-mono">{currentActor.cooldowns[skill.id]}T</span>
                     ) : (
                        <Zap size={12} className="fill-current" />
                     )}
                   </button>
                 ))}
                 {currentActor.burst >= 100 && (
                   <button className="p-3 bg-red-500/20 border border-red-500/40 text-red-500 rounded-xl text-[9px] font-black uppercase tracking-widest animate-pulse">
                     ¡BURST READY!
                   </button>
                 )}
               </div>
            )}
            {currentActor?.side === 'enemy' && (
               <div className="flex flex-col items-center justify-center h-full gap-2 text-red-500/40">
                  <PlayCircle className="animate-spin" />
                  <span className="text-[8px] font-black uppercase">Turno Enemigo...</span>
               </div>
            )}
         </div>
      </div>

      <AnimatePresence>
        {isBattleOver && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-8 text-center">
             <Award size={64} className={winner === 'player' ? 'text-[#F5C76B]' : 'text-red-500'} />
             <h2 className="text-3xl font-black text-white tracking-[0.4em] uppercase italic mt-4">{winner === 'player' ? 'Victoria' : 'Derrota'}</h2>
             <button onClick={() => { onRefresh(); onBack(); }} className="mt-8 bg-white/5 border border-white/10 text-white font-black py-4 px-12 rounded-2xl tracking-[0.3em] uppercase text-[10px]">Continuar</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
