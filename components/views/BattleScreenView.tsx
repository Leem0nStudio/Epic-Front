'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  Swords,
  Shield,
  Zap,
  PlayCircle,
  Award,
  AlertTriangle,
  Terminal,
  Activity,
  Heart,
  Target,
  Gift
} from 'lucide-react';
import { CombatUnit, SkillDefinition } from '@/lib/types/combat';
import { BattleManager } from '@/lib/services/battle-manager';
import { CombatAdapter } from '@/lib/services/combat-adapter';
import { CampaignService } from '@/lib/services/campaign-service';
import { Stage } from '@/lib/rpg-system/campaign-types';

interface BattleScreenViewProps {
  squad: any[];
  onBack: () => void;
  onRefresh: () => void;
  stageId?: string; // New: optional stage context
}

export function BattleScreenView({ squad, onBack, onRefresh, stageId }: BattleScreenViewProps) {
  const [units, setUnits] = useState<CombatUnit[]>([]);
  const [turn, setTurn] = useState(0);
  const [round, setRound] = useState(1);
  const [isBattleOver, setIsBattleOver] = useState(false);
  const [winner, setWinner] = useState<'player' | 'enemy' | null>(null);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [activeUnitId, setActiveUnitId] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [completionData, setCompletionData] = useState<any>(null);
  const [isRecordingResult, setIsRecordingResult] = useState(false);

  // Statistics for Star calculation
  const [stats, setStats] = useState({
    totalTurns: 0,
    playerDeaths: 0
  });

  useEffect(() => {
    async function initBattle() {
      try {
        const validSquad = squad.filter(u => !!u);
        if (validSquad.length === 0) {
          setInitError("Equipo vacío. Asigna héroes antes de la batalla.");
          setIsInitializing(false);
          return;
        }

        const playerUnits = await Promise.all(
          validSquad.map((unit, idx) => CombatAdapter.dbUnitToCombatUnit(unit.id, 'player', idx))
        );

        let enemies: CombatUnit[] = [];

        if (stageId) {
            const stage = CampaignService.getStageById(stageId);
            if (stage) {
                enemies = stage.enemies.map(e => CombatAdapter.createEnemy(e.id, e.name, e.level, e.position));
            }
        }

        // Fallback for demo/testing
        if (enemies.length === 0) {
            enemies = [
              CombatAdapter.createEnemy('e1', 'Limo Débil', 1, 0),
              CombatAdapter.createEnemy('e2', 'Murciélago', 1, 1),
              CombatAdapter.createEnemy('e3', 'Limo Débil', 1, 3)
            ];
        }

        setUnits([...playerUnits, ...enemies]);
        setIsInitializing(false);
      } catch (e: any) {
        setInitError(e.message || "Error al inicializar combate");
        setIsInitializing(false);
      }
    }
    initBattle();
  }, [squad, stageId]);

  const runTurn = (actor: CombatUnit, skill: SkillDefinition, manualTargetId?: string) => {
    if (isBattleOver) return;

    const { results, updatedUnits } = BattleManager.executeTurn(actor, skill, units, manualTargetId);

    setBattleLog(prev => [...prev, ...results.map(r => r.log)].slice(-20));
    setUnits(updatedUnits);
    setTurn(prev => prev + 1);
    setTargetId(null);

    // Track total turn cycles (roughly equivalent to rounds or individual unit turns)
    setStats(prev => ({ ...prev, totalTurns: prev.totalTurns + 1 }));
  };

  useEffect(() => {
    if (isInitializing || isBattleOver || initError) return;

    const aliveEnemies = units.filter(u => u.side === 'enemy' && !u.isDead);
    const alivePlayers = units.filter(u => u.side === 'player' && !u.isDead);
    const deadPlayers = units.filter(u => u.side === 'player' && u.isDead).length;

    if (aliveEnemies.length === 0) {
      handleBattleOver('player', deadPlayers);
      return;
    }
    if (alivePlayers.length === 0) {
      handleBattleOver('enemy', deadPlayers);
      return;
    }

    const order = BattleManager.getTurnOrder(units);
    if (order.length === 0) return;

    if (turn >= order.length) {
      setTurn(0);
      setRound(prev => prev + 1);
      setUnits(prev => prev.map(u => BattleManager.updateUnitStartTurn(u)));
      return;
    }

    const currentActor = order[turn];
    setActiveUnitId(currentActor.id);

    if (currentActor.side === 'enemy') {
      const skill = currentActor.skills[0];
      const timer = setTimeout(() => runTurn(currentActor, skill), 1000);
      return () => clearTimeout(timer);
    }
  }, [units, turn, isInitializing, isBattleOver, initError]);

  const handleBattleOver = async (winner: 'player' | 'enemy', deaths: number) => {
    setIsBattleOver(true);
    setWinner(winner);

    if (winner === 'player' && stageId) {
        setIsRecordingResult(true);
        try {
            // Stats for star calculation: total turns taken by player/enemy
            // simplified: we use the 'round' count for turn limits in stars
            const result = await CampaignService.completeStage(stageId, {
                turns: round,
                deaths: deaths
            });
            setCompletionData(result);
        } catch (e) {
            console.error("Failed to record stage completion:", e);
        } finally {
            setIsRecordingResult(false);
        }
    }
  };

  if (isInitializing) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center bg-[#020508] gap-4">
            <Swords size={48} className="text-[#F5C76B] animate-bounce" />
            <p className="text-[10px] font-black text-white/40 tracking-[0.5em] uppercase">Preparando escenario...</p>
        </div>
    );
  }

  if (initError) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center bg-[#020508] p-8 text-center gap-6">
            <AlertTriangle size={40} className="text-amber-400" />
            <h2 className="text-white font-black uppercase tracking-widest text-lg italic">Incompatibilidad de Batallón</h2>
            <p className="text-white/40 text-[10px] uppercase tracking-wider leading-relaxed">{initError}</p>
            <button onClick={onBack} className="px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest">Regresar</button>
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
            <span className="text-[8px] text-white/20 font-mono tracking-widest mt-0.5 uppercase">Activo: {currentActor?.name}</span>
         </div>
         <div className="w-20"></div>
      </div>

      <div className="flex-1 relative overflow-hidden flex flex-col py-4 px-4 gap-8">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,100,255,0.05),transparent)] pointer-events-none" />

         {/* Battlefield Layout: BF Side-view */}
         <div className="flex flex-1 items-center justify-between relative px-2">

            {/* Player Side (Left) */}
            <div className="flex flex-col gap-6 relative">
              <div className="absolute left-[-60px] top-1/2 -translate-y-1/2 flex flex-col gap-8 opacity-60">
                {units.filter(u => u.side === 'player' && u.row === 'back').map(player => (
                  <UnitSprite key={player.id} unit={player} isActive={activeUnitId === player.id} isTarget={targetId === player.id} />
                ))}
              </div>
              <div className="flex flex-col gap-8">
                {units.filter(u => u.side === 'player' && u.row === 'front').map(player => (
                  <UnitSprite key={player.id} unit={player} isActive={activeUnitId === player.id} isTarget={targetId === player.id} />
                ))}
              </div>
            </div>

            <div className="h-full w-px bg-white/5 relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[8px] font-black text-white/10 uppercase tracking-widest bg-[#020508] px-2 py-4 rounded-full border border-white/5">VS</div>
            </div>

            {/* Enemy Side (Right) */}
            <div className="flex flex-col gap-6 relative text-right items-end">
              <div className="flex flex-col gap-8">
                {units.filter(u => u.side === 'enemy' && u.row === 'front').map(enemy => (
                  <UnitSprite
                    key={enemy.id}
                    unit={enemy}
                    isActive={activeUnitId === enemy.id}
                    isTarget={targetId === enemy.id}
                    onClick={() => !enemy.isDead && currentActor?.side === 'player' && setTargetId(enemy.id)}
                  />
                ))}
              </div>
              <div className="absolute right-[-60px] top-1/2 -translate-y-1/2 flex flex-col gap-8 opacity-60">
                {units.filter(u => u.side === 'enemy' && u.row === 'back').map(enemy => (
                  <UnitSprite
                    key={enemy.id}
                    unit={enemy}
                    isActive={activeUnitId === enemy.id}
                    isTarget={targetId === enemy.id}
                    onClick={() => !enemy.isDead && currentActor?.side === 'player' && setTargetId(enemy.id)}
                  />
                ))}
              </div>
            </div>
         </div>
      </div>

      {/* Control Interface */}
      <div className="h-64 bg-[#0B1A2A] border-t border-white/5 p-4 flex flex-col gap-4 shrink-0 shadow-[0_-20px_40px_rgba(0,0,0,0.5)]">
         <div className="flex gap-4 h-full">
           {/* Skill Board */}
           <div className="flex-1 bg-black/20 rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden">
             <div className="flex items-center justify-between mb-1">
               <span className="text-[8px] font-black text-white/40 uppercase tracking-widest flex items-center gap-2"><Target size={10} /> Habilidades</span>
               {currentActor?.side === 'player' && (
                 <span className="text-[10px] font-black text-[#F5C76B] uppercase italic">{currentActor.name}</span>
               )}
             </div>

             {currentActor?.side === 'player' ? (
               <div className="grid grid-cols-2 gap-2">
                 {currentActor.skills.map((skill, idx) => (
                   <button
                     key={skill.id}
                     disabled={!!currentActor.cooldowns[skill.id]}
                     onClick={() => runTurn(currentActor, skill, targetId || undefined)}
                     className={`relative overflow-hidden group flex flex-col p-2 rounded-xl border transition-all ${
                       currentActor.cooldowns[skill.id]
                       ? 'bg-white/5 border-white/5 text-white/10 opacity-50'
                       : 'bg-white/5 border-white/10 text-white/80 hover:border-[#F5C76B]/40 hover:bg-white/10'
                     }`}
                   >
                     <div className="flex items-center justify-between w-full mb-1">
                        <span className="text-[9px] font-black uppercase tracking-wider text-left truncate">{skill.name}</span>
                        {currentActor.cooldowns[skill.id] ? (
                          <span className="text-[8px] font-mono text-[#F5C76B]">{currentActor.cooldowns[skill.id]}T</span>
                        ) : (
                          <Zap size={10} className="text-[#F5C76B] group-hover:animate-pulse" />
                        )}
                     </div>
                     <div className="flex gap-0.5">
                       {Array(5).fill(0).map((_, i) => (
                         <div key={i} className={`w-1 h-0.5 rounded-full ${i < (skill.cooldown || 0) ? 'bg-[#F5C76B]/30' : 'bg-white/5'}`} />
                       ))}
                     </div>
                   </button>
                 ))}
                 {currentActor.burst >= 100 && (
                   <button
                     onClick={() => runTurn(currentActor, currentActor.skills.find(s => s.type === 'burst') || currentActor.skills[0])}
                     className="col-span-2 p-3 bg-red-600 border border-red-500 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] animate-pulse"
                   >
                     ¡BURST OVERDRIVE!
                   </button>
                 )}
               </div>
             ) : (
               <div className="flex-1 flex flex-col items-center justify-center gap-2 opacity-20">
                 <Activity size={24} className="animate-pulse" />
                 <span className="text-[8px] font-black uppercase tracking-widest">Esperando respuesta táctica...</span>
               </div>
             )}
           </div>

           {/* Battle Log */}
           <div className="w-32 bg-black/40 rounded-2xl p-3 flex flex-col gap-2 overflow-y-auto border border-white/5">
             <div className="text-[7px] font-black text-white/20 uppercase tracking-widest border-b border-white/5 pb-1">Sucesos</div>
             {battleLog.length === 0 && <div className="text-[7px] text-white/10 uppercase italic mt-2 text-center">Sin registros</div>}
             {battleLog.map((log, i) => (
                <div key={i} className="text-[7px] text-white/40 leading-tight uppercase font-medium">{log}</div>
             ))}
           </div>
         </div>
      </div>

      <AnimatePresence>
        {isBattleOver && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center p-8 text-center overflow-y-auto">
             <motion.div initial={{ scale: 0.5, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring' }}>
               <Award size={80} className={winner === 'player' ? 'text-[#F5C76B] drop-shadow-[0_0_30px_rgba(245,199,107,0.4)]' : 'text-red-500'} />
             </motion.div>
             <h2 className="text-4xl font-black text-white tracking-[0.4em] uppercase italic mt-6">{winner === 'player' ? 'Victoria' : 'Derrota'}</h2>

             {winner === 'player' && completionData && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 flex flex-col items-center gap-6">
                    <div className="flex gap-4">
                        {[1, 2, 3].map(s => (
                            <Star
                                key={s}
                                size={32}
                                className={`${s <= (completionData.stars || 0) ? 'text-[#F5C76B] fill-current shadow-[0_0_20px_rgba(245,199,107,0.5)]' : 'text-white/10'}`}
                            />
                        ))}
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 min-w-[280px]">
                        <div className="flex items-center gap-2 mb-4 text-[#F5C76B]">
                            <Gift size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Recompensas Obtenidas</span>
                        </div>
                        <div className="flex flex-wrap justify-center gap-3">
                            <div className="px-4 py-2 bg-black/40 rounded-2xl border border-white/5 flex flex-col items-center gap-1">
                                <span className="text-[8px] font-black text-white/40 uppercase">Zeny</span>
                                <span className="text-xs font-black text-white">+{completionData.rewards.currency}</span>
                            </div>
                            {completionData.rewards.premium_currency > 0 && (
                                <div className="px-4 py-2 bg-black/40 rounded-2xl border border-[#F5C76B]/20 flex flex-col items-center gap-1">
                                    <span className="text-[8px] font-black text-[#F5C76B] uppercase">Gemas</span>
                                    <span className="text-xs font-black text-[#F5C76B]">+{completionData.rewards.premium_currency}</span>
                                </div>
                            )}
                            {completionData.rewards.materials.map((mat: any, i: number) => (
                                <div key={i} className="px-4 py-2 bg-black/40 rounded-2xl border border-white/5 flex flex-col items-center gap-1">
                                    <span className="text-[8px] font-black text-white/40 uppercase">{mat.itemId}</span>
                                    <span className="text-xs font-black text-cyan-400">x{mat.amount}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
             )}

             {isRecordingResult && (
                <p className="mt-8 text-[10px] font-black text-[#F5C76B] uppercase tracking-[0.4em] animate-pulse">Registrando Hazaña...</p>
             )}

             <div className="h-px w-32 bg-white/10 my-8" />
             <button onClick={() => { onRefresh(); onBack(); }} className="bg-white/5 border border-white/10 text-white font-black py-5 px-16 rounded-3xl tracking-[0.3em] uppercase text-[10px] hover:bg-white/10 transition-all active:scale-95 shadow-2xl">Confirmar y Continuar</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function UnitSprite({ unit, isActive, isTarget, onClick }: { unit: CombatUnit, isActive?: boolean, isTarget?: boolean, onClick?: () => void }) {
  const isEnemy = unit.side === 'enemy';

  return (
    <motion.div
      initial={{ x: isEnemy ? 20 : -20, opacity: 0 }}
      animate={{
        x: 0,
        opacity: unit.isDead ? 0.2 : 1,
        scale: isActive ? 1.1 : 1,
        filter: isTarget ? 'brightness(1.5) drop-shadow(0 0 10px rgba(255,0,0,0.5))' : 'brightness(1)'
      }}
      onClick={onClick}
      className={`relative flex flex-col ${isEnemy ? 'items-end' : 'items-start'} ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className={`flex items-center gap-1.5 mb-1 ${isEnemy ? 'flex-row-reverse' : ''}`}>
        <span className={`text-[7px] font-black uppercase tracking-widest ${isEnemy ? 'text-red-400' : 'text-cyan-400'}`}>{unit.name}</span>
        {unit.isTaunting && <Shield size={8} className="text-[#F5C76B]" />}
      </div>

      <div className="relative group">
        <div className={`w-14 h-14 bg-black/40 rounded-full border ${isActive ? 'border-[#F5C76B]/40' : 'border-white/5'} flex items-center justify-center relative overflow-visible`}>
          <img
            src="https://raw.githubusercontent.com/Leem0nGames/gameassets/main/RO/abbys_sprite_001.png"
            className={`w-[240%] max-w-none transform translate-y-3 ${isEnemy ? 'scale-x-[-1] brightness-50' : 'brightness-110'}`}
            style={{imageRendering: 'pixelated'}}
          />

          {isActive && (
            <motion.div
              animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 1.5] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute inset-0 border border-[#F5C76B] rounded-full"
            />
          )}

          {isTarget && (
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity }} className="absolute -top-6 left-1/2 -translate-x-1/2">
              <Target size={16} className="text-red-500" />
            </motion.div>
          )}
        </div>

        <div className={`absolute ${isEnemy ? 'right-full mr-2' : 'left-full ml-2'} top-0 flex flex-col gap-1 w-12`}>
           <div className="h-1 bg-black/60 rounded-full overflow-hidden border border-white/5">
              <motion.div animate={{ width: `${(unit.currentHp / unit.maxHp) * 100}%` }} className={`h-full ${isEnemy ? 'bg-red-500' : 'bg-cyan-500'}`} />
           </div>
           {!isEnemy && (
             <div className="h-1 bg-black/60 rounded-full overflow-hidden border border-white/5">
                <motion.div animate={{ width: `${unit.burst}%` }} className="h-full bg-yellow-500" />
             </div>
           )}
           <div className="flex gap-0.5 mt-0.5 justify-end">
              {unit.statusEffects.map(s => (
                <div key={s.id} className={`w-1.5 h-1.5 rounded-sm ${s.type === 'buff' ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} title={s.name} />
              ))}
           </div>
        </div>
      </div>
    </motion.div>
  );
}

function Star({ size, className }: { size: number, className: string }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
    );
}
