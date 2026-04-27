'use client';
import { AssetService } from '@/lib/services/asset-service';

import { useState, useEffect, useMemo } from 'react';
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
  Gift,
  Star as StarIcon
} from 'lucide-react';
import { CombatUnit, SkillDefinition } from '@/lib/types/combat';
import { BattleManager } from '@/lib/services/battle-manager';
import { CombatAdapter } from '@/lib/services/combat-adapter';
import { CampaignService } from '@/lib/services/campaign-service';
import { Stage } from '@/lib/rpg-system/campaign-types';

interface BattleScreenViewProps {
  squad: any[];
  stageId?: string;
  onBack: () => void;
  onRefresh: () => void;
}

export function BattleScreenView({ squad, stageId, onBack, onRefresh }: BattleScreenViewProps) {
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

  const handleBattleOver = async (winnerSide: 'player' | 'enemy', deaths: number) => {
    setIsBattleOver(true);
    setWinner(winnerSide);

    if (winnerSide === 'player' && stageId) {
      setIsRecordingResult(true);
      try {
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
  const playerUnits = units.filter(u => u.side === 'player');
  const enemyUnits = units.filter(u => u.side === 'enemy' && !u.isDead);

  return (
    <div className="flex flex-col h-full bg-[#020508] overflow-hidden relative font-sans">
      {/* Top Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-50 pointer-events-none">
        <button onClick={onBack} className="pointer-events-auto text-white/40 hover:text-white flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors">
          <ChevronLeft size={16} /> RETIRADA
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[12px] text-[#F5C76B] font-black uppercase tracking-[0.4em] italic drop-shadow-lg">ROUND {round}</span>
          <span className="text-[8px] text-white/40 font-mono tracking-widest mt-0.5 uppercase">ACTIVO: {currentActor?.name}</span>
        </div>
        <div className="w-20"></div>
      </div>

      {/* Scenic Background & Enemy Area */}
      <div className="relative h-[45%] w-full overflow-hidden shrink-0">
        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-[10s] ease-linear animate-slow-zoom"
          style={{ backgroundImage: "url('/assets/backgrounds/battle_scenic.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020508] via-[#020508]/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#020508] to-transparent z-10 opacity-80" />
        
        {/* Enemies Floating in Scenic Area */}
        <div className="absolute inset-0 flex items-center justify-center gap-12 pt-12">
          {enemyUnits.map((enemy, idx) => (
            <motion.div
              key={enemy.id}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ 
                opacity: 1, 
                scale: targetId === enemy.id ? 1.1 : 1, 
                y: 0,
                filter: targetId === enemy.id ? 'brightness(1.5) drop-shadow(0 0 20px rgba(255,0,0,0.4))' : 'brightness(1)'
              }}
              onClick={() => currentActor?.side === 'player' && setTargetId(enemy.id)}
              className="relative cursor-pointer group"
            >
              <img
                src={AssetService.getSpriteUrl(enemy.sprite_id || "abbys_sprite_001")}
                className="w-32 h-32 object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)] scale-x-[-1]"
                style={{ imageRendering: 'pixelated' }}
              />
              
              {/* Enemy HUD */}
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 w-24">
                <span className="text-[8px] font-black text-white/80 uppercase tracking-widest whitespace-nowrap drop-shadow-md">{enemy.name}</span>
                <div className="w-full h-1.5 bg-black/60 rounded-full border border-white/10 overflow-hidden shadow-lg">
                  <motion.div 
                    initial={{ width: '100%' }}
                    animate={{ width: `${(enemy.currentHp / enemy.maxHp) * 100}%` }}
                    className="h-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                  />
                </div>
              </div>

              {targetId === enemy.id && (
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 180, 270, 360] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 border-2 border-red-500/50 rounded-full scale-150"
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Middle: Status Grid (2x3) */}
      <div className="flex-1 bg-[#020508] px-4 py-2 flex flex-col gap-4 relative z-10 shadow-[0_-20px_50px_rgba(0,0,0,1)]">
        <div className="grid grid-cols-2 grid-rows-3 gap-2 h-full max-h-[320px]">
          {Array(6).fill(null).map((_, idx) => {
            const unit = playerUnits[idx];
            const isActive = unit?.id === activeUnitId;
            
            return (
              <StatusPane 
                key={idx} 
                unit={unit} 
                isActive={isActive} 
                orbColor={['#4ade80', '#60a5fa', '#f87171', '#fbbf24', '#c084fc', '#8b5cf6'][idx]}
              />
            );
          })}
        </div>

        {/* OVERDRIVE Bar */}
        <div className="relative w-full py-2">
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[11px] font-black text-white italic tracking-[0.6em] z-10 animate-pulse drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] uppercase">OVERDRIVE</span>
          </div>
          <div className="h-7 bg-black/80 border-y-2 border-[#F5C76B]/30 relative overflow-hidden rounded-sm shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <motion.div 
              animate={{ 
                width: `${currentActor?.side === 'player' ? currentActor.burst : 0}%`,
                backgroundColor: currentActor?.burst === 100 ? '#ef4444' : '#7f1d1d'
              }}
              className="h-full shadow-[inset_0_0_15px_rgba(0,0,0,0.6)] relative"
            >
               {/* Inner glow for the filled part */}
               <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.2)_0%,transparent_50%,rgba(0,0,0,0.2)_100%)]" />
            </motion.div>
            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.1)_50%,transparent_100%)] animate-shimmer" />
          </div>
        </div>
      </div>

      {/* Bottom: Squad Area (Pedestals) */}
      <div className="h-[25%] shrink-0 bg-gradient-to-t from-black to-[#020508] relative px-4 pb-8 flex items-end justify-between gap-2 overflow-hidden">
        <div className="absolute inset-x-0 bottom-0 h-32 bg-[radial-gradient(circle_at_50%_100%,rgba(245,199,107,0.1),transparent_70%)] pointer-events-none" />
        
        {playerUnits.map((unit, idx) => (
          <UnitPedestal 
            key={unit.id} 
            unit={unit} 
            isActive={unit.id === activeUnitId} 
            onSkillClick={(skill) => runTurn(unit, skill, targetId || undefined)}
          />
        ))}
      </div>

      {/* Battle Log Overlay (Floating) */}
      <div className="absolute left-4 bottom-32 z-50 w-56 max-h-24 overflow-hidden pointer-events-none">
        <div className="flex flex-col gap-1.5">
          {battleLog.slice(-4).map((log, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1 - (3-i)*0.25, x: 0 }}
              className="text-[8px] text-white/60 uppercase font-black tracking-widest bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border-l-[3px] border-[#F5C76B] shadow-lg flex items-center gap-2"
            >
              <Terminal size={10} className="text-[#F5C76B] shrink-0" />
              <span className="truncate">{log}</span>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {isBattleOver && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center p-8 text-center">
            <motion.div initial={{ scale: 0.5, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring' }}>
              <Award size={80} className={winner === 'player' ? 'text-[#F5C76B] drop-shadow-[0_0_30px_rgba(245,199,107,0.4)]' : 'text-red-500'} />
            </motion.div>
            <h2 className="text-4xl font-black text-white tracking-[0.4em] uppercase italic mt-6">{winner === 'player' ? 'Victoria' : 'Derrota'}</h2>

            {winner === 'player' && completionData && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 flex flex-col items-center gap-6">
                <div className="flex gap-4">
                  {[1, 2, 3].map(s => (
                    <StarIcon
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

function StatusPane({ unit, isActive, orbColor }: { unit?: CombatUnit, isActive?: boolean, orbColor: string }) {
  if (!unit) return <div className="bg-black/20 rounded-lg border border-white/5 opacity-20" />;

  return (
    <motion.div 
      animate={{ 
        borderColor: isActive ? '#F5C76B' : 'rgba(255,255,255,0.1)',
        backgroundColor: isActive ? 'rgba(245,199,107,0.1)' : 'rgba(11,26,42,0.6)',
        scale: isActive ? 1.02 : 1
      }}
      className="relative flex flex-col p-2 rounded-lg border-[1.5px] backdrop-blur-md transition-all overflow-hidden shadow-2xl"
    >
      {/* Metallic Shine Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="flex items-center justify-between mb-1.5 relative z-10">
        <span className="text-[10px] font-black text-white uppercase tracking-wider drop-shadow-md truncate max-w-[80%]">{unit.name}</span>
        <div className="flex flex-col items-end">
           <span className="text-[7px] font-mono text-white/40">HP</span>
           <span className="text-[8px] font-bold text-white/80 leading-none">{unit.currentHp}/{unit.maxHp}</span>
        </div>
      </div>

      <div className="space-y-1 relative z-10">
        <div className="w-full h-2 bg-black/60 rounded-sm border border-white/5 overflow-hidden">
          <motion.div 
            animate={{ width: `${(unit.currentHp / unit.maxHp) * 100}%` }}
            className={`h-full ${unit.currentHp < unit.maxHp * 0.3 ? 'bg-red-500' : 'bg-gradient-to-r from-green-600 to-green-400'}`}
          />
        </div>
        <div className="w-full h-1 bg-black/60 rounded-full overflow-hidden">
          <motion.div 
            animate={{ width: `${unit.burst}%` }}
            className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400"
          />
        </div>
      </div>

      {/* Elemental Orb - Positioned like the vision image */}
      <div 
        className="absolute bottom-1 left-1 w-3 h-3 rounded-full shadow-[0_0_10px_currentColor] border border-white/20 z-20" 
        style={{ color: orbColor, backgroundColor: orbColor }} 
      />

      {/* Decorative Metallic Corner Details */}
      <div className="absolute top-0 right-0 w-4 h-4 border-t-[2px] border-r-[2px] border-[#F5C76B]/20 rounded-tr-lg" />
      <div className="absolute bottom-0 left-0 w-10 h-10 border-b-[2px] border-l-[2px] border-[#F5C76B]/20 rounded-bl-lg opacity-40" />
    </motion.div>
  );
}

function UnitPedestal({ unit, isActive, onSkillClick }: { unit: CombatUnit, isActive: boolean, onSkillClick: (skill: SkillDefinition) => void }) {
  return (
    <div className="relative flex flex-col items-center flex-1">
      {/* Sprite with Pedestal */}
      <div className="relative mb-6 w-full flex justify-center">
        {/* The Pedestal - Improved with multiple layers for depth */}
        <div className="relative w-20 h-6">
           <div className={`absolute inset-0 bg-gradient-to-b from-gray-400 to-gray-800 rounded-[100%] border-[2px] border-gray-600/50 shadow-[0_10px_20px_rgba(0,0,0,0.8)] ${isActive ? 'ring-2 ring-[#F5C76B] shadow-[0_0_25px_rgba(245,199,107,0.4)]' : ''}`}>
              <div className="absolute inset-1 border border-white/10 rounded-[100%]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.2),transparent_70%)] rounded-[100%]" />
           </div>
           
           {isActive && (
              <motion.div 
                animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute -inset-4 bg-[#F5C76B]/20 rounded-[100%] blur-xl"
              />
           )}
        </div>
        
        <motion.div 
          animate={{ 
            y: isActive ? [0, -8, 0] : 0,
            scale: isActive ? 1.2 : 1,
            filter: unit.isDead ? 'grayscale(1) brightness(0.5)' : 'grayscale(0) brightness(1)'
          }}
          transition={{ repeat: Infinity, duration: 3 }}
          className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 w-40 h-40 flex items-end justify-center pointer-events-none"
        >
          <img 
            src={AssetService.getSpriteUrl(unit.sprite_id)} 
            className="w-full h-auto object-contain transform origin-bottom drop-shadow-[0_15px_20px_rgba(0,0,0,0.9)]"
            style={{ imageRendering: 'pixelated' }}
          />
        </motion.div>
      </div>

      {/* Skills Pop-up for Active Unit */}
      <AnimatePresence>
        {isActive && !unit.isDead && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            className="absolute bottom-24 z-[60] flex flex-col gap-2 w-full max-w-[120px]"
          >
            {unit.skills.map((skill) => (
              <motion.button
                key={skill.id}
                whileHover={{ scale: 1.05, x: 5, backgroundColor: 'rgba(255,255,255,0.1)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSkillClick(skill)}
                disabled={!!unit.cooldowns[skill.id]}
                className={`relative overflow-hidden px-3 py-2.5 rounded-xl border-2 text-[9px] font-black uppercase tracking-widest transition-all shadow-2xl ${
                  unit.cooldowns[skill.id] 
                    ? 'bg-black/80 border-white/5 text-white/20' 
                    : 'bg-[#0B1A2A]/90 border-[#F5C76B] text-white'
                }`}
              >
                <div className="relative z-10 flex items-center justify-between">
                   {skill.name}
                   {unit.cooldowns[skill.id] && <span className="text-[#F5C76B]">{unit.cooldowns[skill.id]}T</span>}
                </div>
                {!unit.cooldowns[skill.id] && (
                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
                )}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
