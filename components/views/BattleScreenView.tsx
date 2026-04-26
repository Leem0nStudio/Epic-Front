'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  Swords,
  Shield,
  Zap,
  Award,
  AlertTriangle,
  Activity,
  Target,
  Gift
} from 'lucide-react';
import { CombatUnit, SkillDefinition, EffectType } from '@/lib/types/combat';
import { BattleManager } from '@/lib/services/battle-manager';
import { CombatAdapter } from '@/lib/services/combat-adapter';
import { CampaignService } from '@/lib/services/campaign-service';

export interface BattleFX {
  id: string;
  targetId: string;
  type: EffectType | "crit" | "heal" | "miss";
  value?: number | string;
  isCrit?: boolean;
}

export interface ProjectileFX {
  id: string;
  fromId: string;
  targetId: string;
  type: "physical" | "magic";
  color: string;
}

interface BattleScreenViewProps {
  squad: any[];
  onBack: () => void;
  onRefresh: () => void;
  stageId?: string;
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
  const [activeFX, setActiveFX] = useState<BattleFX[]>([]);
  const [activeProjectiles, setActiveProjectiles] = useState<ProjectileFX[]>([]);
  const [shakeIntensity, setShakeIntensity] = useState(0);
  const [isBurstActive, setIsBurstActive] = useState(false);
  const [stats, setStats] = useState({ totalTurns: 0, playerDeaths: 0 });

  const triggerShake = (intensity: number = 5) => {
    setShakeIntensity(intensity);
    setTimeout(() => setShakeIntensity(0), 150);
  };

  useEffect(() => {
    async function initBattle() {
      try {
        const playerUnits = squad.map((u, i) => CombatAdapter.createFromUnit(u, i));
        let enemies: CombatUnit[] = [];
        if (stageId) {
            const stage = CampaignService.getStageById(stageId);
            if (stage) enemies = stage.enemies.map(e => CombatAdapter.createEnemy(e.id, e.name, e.level, e.position));
        }
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

  useEffect(() => {
    if (isInitializing || isBattleOver || initError) return;
    const aliveEnemies = units.filter(u => u.side === 'enemy' && !u.isDead);
    const alivePlayers = units.filter(u => u.side === 'player' && !u.isDead);
    if (aliveEnemies.length === 0) { handleBattleOver('player', units.filter(u => u.side === 'player' && u.isDead).length); return; }
    if (alivePlayers.length === 0) { handleBattleOver('enemy', units.filter(u => u.side === 'player' && u.isDead).length); return; }
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
      const timer = setTimeout(() => runTurn(currentActor, skill), 1500);
      return () => clearTimeout(timer);
    }
  }, [units, turn, isInitializing, isBattleOver, initError]);

  const runTurn = (actor: CombatUnit, skill: SkillDefinition, manualTargetId?: string) => {
    if (isBattleOver) return;
    if (skill.type === "burst") {
      setIsBurstActive(true);
      setTimeout(() => setIsBurstActive(false), 1200);
    }
    const { results, updatedUnits } = BattleManager.executeTurn(actor, skill, units, manualTargetId);
    const processSequentially = async () => {
      const isMagic = actor.skills.some(s => s.id === skill.id && s.effects.some(e => e.scaling === 'matk'));
      if (isMagic) await new Promise(r => setTimeout(r, 200));

      for (let i = 0; i < results.length; i++) {
        const res = results[i];
        if (results.length > 1) await new Promise(r => setTimeout(r, 120));

        const isRanged = skill.id.includes('ranged') || skill.id.includes('bow') || isMagic;
        if (isRanged && res.type === 'damage') {
           const projId = `proj-${Date.now()}-${i}`;
           setActiveProjectiles(prev => [...prev, {
             id: projId,
             fromId: actor.id,
             targetId: res.targetId,
             type: isMagic ? 'magic' : 'physical',
             color: isMagic ? '#22d3ee' : '#ffffff'
           }]);
           await new Promise(r => setTimeout(r, isBurstActive ? 300 : 200));
        }

        const isCrit = res.value ? res.value > 40 : false;
        if (isCrit) await new Promise(r => setTimeout(r, 40));

        const newFX: BattleFX = {
          id: `${Date.now()}-${i}-${Math.random()}`,
          targetId: res.targetId,
          type: res.type as any,
          value: res.value,
          isCrit: isCrit
        };
        setActiveFX(prev => [...prev, newFX]);
        if (res.type === 'damage') triggerShake(res.value && res.value > 30 ? 8 : 4);
      }
      setBattleLog(prev => [...prev, ...results.map(r => r.log)].slice(-20));
      setUnits(updatedUnits);
      setTurn(prev => prev + 1);
      setTargetId(null);
      setStats(prev => ({ ...prev, totalTurns: prev.totalTurns + 1 }));
    };
    processSequentially();
  };

  const handleBattleOver = async (winner: 'player' | 'enemy', deaths: number) => {
    setIsBattleOver(true);
    setWinner(winner);
    if (winner === 'player' && stageId) {
      setIsRecordingResult(true);
      const res = await CampaignService.completeStage(stageId, { turns: stats.totalTurns, deaths });
      setCompletionData(res);
      setIsRecordingResult(false);
    }
  };

  if (isInitializing) return <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4"><Swords size={48} className="text-[#F5C76B] animate-bounce" /><p className="text-[10px] font-black text-white/40 tracking-[0.5em] uppercase">Preparando escenario...</p></div>;
  if (initError) return <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center gap-4"><AlertTriangle size={48} className="text-red-500" /><h2 className="text-xl font-black text-white uppercase tracking-widest">Error Táctico</h2><p className="text-white/60 text-sm">{initError}</p><button onClick={onBack} className="bg-white/5 border border-white/10 px-8 py-3 rounded-full text-white text-[10px] font-black uppercase tracking-widest">Regresar</button></div>;

  const order = BattleManager.getTurnOrder(units);
  const currentActor = order[turn];

  if (isInitializing) return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#020508] gap-4">
        <Swords size={48} className="text-[#F5C76B] animate-bounce" />
        <p className="text-[10px] font-black text-white/40 tracking-[0.5em] uppercase">Estableciendo Ciclo...</p>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-[#050505] overflow-hidden font-sans selection:bg-[#F5C76B] selection:text-black">
      <AnimatePresence>
        {isBurstActive && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-indigo-900/25 pointer-events-none z-[5] backdrop-blur-[2px]" />
        )}
      </AnimatePresence>

      <div className="absolute inset-0 pointer-events-none z-30">
        <AnimatePresence>
          {activeProjectiles.map(p => (
            <Projectile key={p.id} proj={p} onComplete={(id) => setActiveProjectiles(prev => prev.filter(proj => proj.id !== id))} />
          ))}
        </AnimatePresence>
      </div>

      <div className="relative z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black to-transparent">
         <button onClick={onBack} className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full border border-white/10 text-white/40 hover:text-white transition-colors"><ChevronLeft size={20} /></button>
         <div className="flex flex-col items-center">
            <span className="text-[10px] font-black text-[#F5C76B] tracking-[0.4em] uppercase italic">Turno {turn + 1} / Ronda {round}</span>
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-white/20 to-transparent mt-1" />
         </div>
         <div className="w-10 h-10" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col justify-center px-4 py-8 min-h-[60vh]">
         <div style={{ scale: isBurstActive ? 1.05 : 1, transition: "transform 0.5s ease-out" }} className="grid grid-cols-2 gap-12 max-w-4xl mx-auto w-full">
            <div className="flex flex-col gap-16">
               <div className="flex justify-center gap-8 ml-8">
                  {units.filter(u => u.side === 'player' && u.position >= 3).map(player => (
                    <UnitSprite isBurstActive={isBurstActive} activeFX={activeFX} onFXComplete={(id) => setActiveFX(prev => prev.filter(f => f.id !== id))} shakeIntensity={shakeIntensity} key={player.id} unit={player} isActive={activeUnitId === player.id} isTarget={targetId === player.id} />
                  ))}
               </div>
               <div className="flex justify-center gap-8">
                  {units.filter(u => u.side === 'player' && u.position < 3).map(player => (
                    <UnitSprite isBurstActive={isBurstActive} activeFX={activeFX} onFXComplete={(id) => setActiveFX(prev => prev.filter(f => f.id !== id))} shakeIntensity={shakeIntensity} key={player.id} unit={player} isActive={activeUnitId === player.id} isTarget={targetId === player.id} />
                  ))}
               </div>
            </div>
            <div className="flex flex-col gap-16">
               <div className="flex justify-center gap-8 mr-8">
                  {units.filter(u => u.side === 'enemy' && (u.position === 0 || u.position === 1)).map(enemy => (
                    <UnitSprite isBurstActive={isBurstActive} activeFX={activeFX} onFXComplete={(id) => setActiveFX(prev => prev.filter(f => f.id !== id))} shakeIntensity={shakeIntensity}
                      key={enemy.id} unit={enemy} isActive={activeUnitId === enemy.id} isTarget={targetId === enemy.id}
                      onClick={() => !enemy.isDead && currentActor?.side === 'player' && setTargetId(enemy.id)}
                    />
                  ))}
               </div>
               <div className="flex justify-center gap-8">
                  {units.filter(u => u.side === 'enemy' && (u.position === 2 || u.position === 3)).map(enemy => (
                    <UnitSprite isBurstActive={isBurstActive} activeFX={activeFX} onFXComplete={(id) => setActiveFX(prev => prev.filter(f => f.id !== id))} shakeIntensity={shakeIntensity}
                      key={enemy.id} unit={enemy} isActive={activeUnitId === enemy.id} isTarget={targetId === enemy.id}
                      onClick={() => !enemy.isDead && currentActor?.side === 'player' && setTargetId(enemy.id)}
                    />
                  ))}
               </div>
            </div>
         </div>
      </div>

      <div className="relative z-20 mt-auto p-4 bg-gradient-to-t from-black via-black/80 to-transparent">
         <div className="max-w-4xl mx-auto flex gap-4 h-32">
           <div className="flex-1 bg-white/5 rounded-2xl border border-white/10 p-4 flex flex-col gap-3 relative overflow-hidden backdrop-blur-md">
             {currentActor?.side === 'player' ? (
               <div className="grid grid-cols-2 gap-2 h-full">
                 {currentActor.skills.filter(s => s.type === 'active').map(skill => (
                   <button key={skill.id} disabled={!!currentActor.cooldowns[skill.id]} onClick={() => runTurn(currentActor, skill, targetId || undefined)} className="group relative flex flex-col justify-center items-center gap-1 bg-white/5 border border-white/10 rounded-xl hover:bg-[#F5C76B]/20 hover:border-[#F5C76B]/40 transition-all active:scale-95 disabled:opacity-30 disabled:grayscale">
                     <div className="flex items-center gap-2"><span className="text-[9px] font-black uppercase tracking-widest truncate">{skill.name}</span>{currentActor.cooldowns[skill.id] ? <span className="text-[8px] font-mono text-[#F5C76B]">{currentActor.cooldowns[skill.id]}T</span> : <Zap size={10} className="text-[#F5C76B] group-hover:animate-pulse" />}</div>
                   </button>
                 ))}
                 {currentActor.burst >= 100 && (
                   <button onClick={() => runTurn(currentActor, currentActor.skills.find(s => s.type === 'burst') || currentActor.skills[0])} className="col-span-2 p-3 bg-red-600 border border-red-500 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] animate-pulse">¡BURST OVERDRIVE!</button>
                 )}
               </div>
             ) : (
               <div className="flex-1 flex flex-col items-center justify-center gap-2 opacity-20"><Activity size={24} className="animate-pulse" /><span className="text-[8px] font-black uppercase tracking-widest">Esperando respuesta táctica...</span></div>
             )}
           </div>
           <div className="w-32 bg-black/40 rounded-2xl p-3 flex flex-col gap-2 overflow-y-auto border border-white/5">
             <div className="text-[7px] font-black text-white/20 uppercase tracking-widest border-b border-white/5 pb-1">Sucesos</div>
             {battleLog.length === 0 && <div className="text-[7px] text-white/10 uppercase italic mt-2 text-center">Sin registros</div>}
             {battleLog.map((log, i) => <div key={i} className="text-[7px] text-white/40 leading-tight uppercase font-medium">{log}</div>)}
           </div>
         </div>
      </div>

      <AnimatePresence>
        {isBattleOver && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center p-8 text-center overflow-y-auto">
             {winner === "player" && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
                    <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0, 2, 4], opacity: [0, 0.4, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-64 h-64 bg-yellow-500/20 rounded-full blur-[120px]" />
                    {Array(25).fill(0).map((_, i) => (
                        <motion.div key={i} initial={{ x: 0, y: 0, scale: 0 }} animate={{ x: (Math.random() - 0.5) * 800, y: (Math.random() - 0.5) * 800, scale: [0, 1.2, 0], rotate: [0, 360] }} transition={{ duration: 2 + Math.random(), repeat: Infinity, delay: i * 0.1 }} className="absolute w-1.5 h-1.5 bg-[#F5C76B] rounded-full shadow-[0_0_15px_#F5C76B]" />
                    ))}
                </div>
             )}
             <motion.div initial={{ scale: 0.5, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring' }}><Award size={80} className={winner === 'player' ? 'text-[#F5C76B] drop-shadow-[0_0_40px_rgba(245,199,107,0.5)]' : 'text-red-500'} /></motion.div>
             <h2 className="text-4xl font-black text-white tracking-[0.4em] uppercase italic mt-6">{winner === 'player' ? 'Victoria' : 'Derrota'}</h2>
             {winner === 'player' && completionData && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 flex flex-col items-center gap-6">
                    <div className="flex gap-4">{[1, 2, 3].map(s => ( <Star key={s} size={32} className={`${s <= (completionData.stars || 0) ? 'text-[#F5C76B] fill-current shadow-[0_0_20px_rgba(245,199,107,0.5)]' : 'text-white/10'}`} /> ))}</div>
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 min-w-[280px]">
                        <div className="flex items-center gap-2 mb-4 text-[#F5C76B]"><Gift size={14} /><span className="text-[10px] font-black uppercase tracking-widest">Recompensas Obtenidas</span></div>
                        <div className="flex flex-wrap justify-center gap-3">
                            <div className="px-4 py-2 bg-black/40 rounded-2xl border border-white/5 flex flex-col items-center gap-1"><span className="text-[8px] font-black text-white/40 uppercase">Zeny</span><span className="text-xs font-black text-white">+{completionData.rewards.currency}</span></div>
                            {completionData.rewards.premium_currency > 0 && ( <div className="px-4 py-2 bg-black/40 rounded-2xl border border-[#F5C76B]/20 flex flex-col items-center gap-1"><span className="text-[8px] font-black text-[#F5C76B] uppercase">Gemas</span><span className="text-xs font-black text-[#F5C76B]">+{completionData.rewards.premium_currency}</span></div> )}
                            {completionData.rewards.materials.map((mat: any, i: number) => ( <div key={i} className="px-4 py-2 bg-black/40 rounded-2xl border border-white/5 flex flex-col items-center gap-1"><span className="text-[8px] font-black text-white/40 uppercase">{mat.itemId}</span><span className="text-xs font-black text-cyan-400">x{mat.amount}</span></div> ))}
                        </div>
                    </div>
                </motion.div>
             )}
             {isRecordingResult && <p className="mt-8 text-[10px] font-black text-[#F5C76B] uppercase tracking-[0.4em] animate-pulse">Registrando Hazaña...</p>}
             <div className="h-px w-32 bg-white/10 my-8" />
             <button onClick={() => { onRefresh(); onBack(); }} className="bg-white/5 border border-white/10 text-white font-black py-5 px-16 rounded-3xl tracking-[0.3em] uppercase text-[10px] hover:bg-white/10 transition-all active:scale-95 shadow-2xl">Confirmar y Continuar</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Projectile({ proj, onComplete }: { proj: ProjectileFX, onComplete: (id: string) => void }) {
  const isFromPlayer = !proj.fromId.startsWith('e');
  const startX = isFromPlayer ? '25%' : '75%';
  const endX = isFromPlayer ? '75%' : '25%';
  return (
    <motion.div initial={{ left: startX, top: '40%', opacity: 0, scale: 0.5 }} animate={{ left: endX, opacity: [0, 1, 1, 0], scale: [1, 1.2, 1] }} transition={{ duration: 0.25, ease: "easeIn" }} onAnimationComplete={() => onComplete(proj.id)} className="absolute z-40 pointer-events-none" style={{ transform: 'translate(-50%, -50%)' }}>
      <div className={`w-4 h-1 rounded-full blur-[1px] ${proj.type === 'magic' ? 'bg-cyan-400 shadow-[0_0_10px_cyan]' : 'bg-white shadow-[0_0_5px_white]'}`} />
      <div className={`absolute inset-0 w-8 h-2 -left-4 blur-sm opacity-50 ${proj.type === 'magic' ? 'bg-cyan-300' : 'bg-gray-200'}`} />
    </motion.div>
  );
}

function DamageFX({ fx, onComplete }: { fx: BattleFX, onComplete: (id: string) => void }) {
  const isHeal = fx.type === 'heal';
  const isCrit = fx.isCrit || fx.type === 'crit';
  return (
    <motion.div initial={{ opacity: 0, y: 0, scale: 0.5 }} animate={{ opacity: [0, 1, 1, 0], y: [-20, -50, -60], scale: isCrit ? [0.5, 1.6, 1.4, 1] : [0.5, 1.2, 1.2, 1] }} transition={{ duration: 1.0, times: [0, 0.1, 0.8, 1] }} onAnimationComplete={() => onComplete(fx.id)} className={`absolute z-50 pointer-events-none select-none font-black tracking-tighter ${isHeal ? "text-green-400 text-xs" : isCrit ? "text-[#F5C76B] text-xl" : "text-white text-xs"} ${isCrit ? "drop-shadow-[0_0_12px_rgba(245,199,107,0.9)]" : "drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"}`}>
      {isHeal ? "+" : ""}{fx.value}
      {isCrit && <div className="text-[9px] uppercase tracking-[0.25em] mt-[-6px] text-[#F5C76B] font-black italic drop-shadow-md">CRITICAL</div>}
    </motion.div>
  );
}

function UnitSprite({ unit, isActive, isTarget, onClick, activeFX = [], onFXComplete, shakeIntensity = 0, isBurstActive = false }: { unit: CombatUnit, isActive?: boolean, isTarget?: boolean, onClick?: () => void, activeFX?: BattleFX[], onFXComplete?: (id: string) => void, shakeIntensity?: number, isBurstActive?: boolean }) {
  const isEnemy = unit.side === 'enemy';
  const myFX = activeFX.filter(f => f.targetId === unit.id);
  const hasBurn = unit.statusEffects.some(s => s.id === 'burn');
  const hasPoison = unit.statusEffects.some(s => s.id === 'poison');
  const hasBuff = unit.statusEffects.some(s => s.type === 'buff' && s.id !== 'taunt');
  return (
    <motion.div initial={{ x: isEnemy ? 20 : -20, opacity: 0 }} animate={{ x: 0, translateX: shakeIntensity > 0 ? [0, -shakeIntensity, shakeIntensity, -shakeIntensity, 0] : 0, opacity: unit.isDead ? 0.2 : 1, scale: isActive ? 1.1 : 1, filter: isTarget ? 'brightness(1.5) drop-shadow(0 0 10px rgba(255,0,0,0.5))' : 'brightness(1)' }} onClick={onClick} className={`relative flex flex-col ${isEnemy ? 'items-end' : 'items-start'} ${onClick ? 'cursor-pointer' : ''}`}>
      <div className={`flex items-center gap-1.5 mb-1 ${isEnemy ? 'flex-row-reverse' : ''}`}><span className={`text-[7px] font-black uppercase tracking-widest ${isEnemy ? 'text-red-400' : 'text-cyan-400'}`}>{unit.name}</span>{unit.isTaunting && <Shield size={8} className="text-[#F5C76B]" />}</div>
      <div className="relative group">
        <div className={`w-14 h-14 bg-black/40 rounded-full border ${isActive ? 'border-[#F5C76B]/40' : 'border-white/5'} ${hasBurn ? "shadow-[0_0_15px_rgba(239,68,68,0.4)]" : hasPoison ? "shadow-[0_0_15px_rgba(34,197,94,0.4)]" : hasBuff ? "shadow-[0_0_15px_rgba(59,130,246,0.4)]" : ""} flex items-center justify-center relative overflow-visible`}>
          <img src="https://raw.githubusercontent.com/Leem0nGames/gameassets/main/RO/abbys_sprite_001.png" className={`w-[240%] max-w-none transform translate-y-3 ${isEnemy ? 'scale-x-[-1] brightness-50' : 'brightness-110'}`} style={{imageRendering: 'pixelated'}} />
          {isActive && isBurstActive && <motion.div initial={{ scale: 1, opacity: 0 }} animate={{ scale: [1, 2.2, 2.8], opacity: [0, 0.9, 0] }} transition={{ duration: 0.5 }} className="absolute inset-0 bg-indigo-400 rounded-full z-20 blur-md shadow-[0_0_30px_#818cf8]" />}
          {isActive && <motion.div animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 1.5] }} transition={{ repeat: Infinity, duration: 1.5 }} className={`absolute inset-0 border border-[#F5C76B] rounded-full ${isBurstActive ? "shadow-[0_0_25px_#F5C76B]" : ""}`} />}
          {hasBurn && ( <div className="absolute inset-0 pointer-events-none"><motion.div animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 0.8 }} className="absolute inset-0 bg-red-600/20 rounded-full blur-md" /><motion.div animate={{ y: [0, -10], opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.5 }} className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-2 bg-orange-500 rounded-full" /></div> )}
          {hasPoison && ( <div className="absolute inset-0 pointer-events-none"><motion.div animate={{ opacity: [0.2, 0.5, 0.2] }} transition={{ repeat: Infinity, duration: 1.2 }} className="absolute inset-0 bg-green-600/20 rounded-full blur-md" /><motion.div animate={{ y: [0, 15], x: [-3, 3, -3], opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="absolute top-0 left-1/4 w-1 h-1 bg-green-400 rounded-full" /></div> )}
          {hasBuff && <motion.div animate={{ scale: [1, 1.3], opacity: [0.6, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute inset-0 border-2 border-indigo-400 rounded-full" />}
          {isTarget && <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity }} className="absolute -top-6 left-1/2 -translate-x-1/2"><Target size={16} className="text-red-500" /></motion.div>}
          {myFX.some(f => f.type === 'damage' || f.type === 'crit') && <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0, 0.8, 0] }} transition={{ duration: 0.2 }} className="absolute inset-0 bg-white rounded-full z-10" />}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><AnimatePresence>{myFX.map(fx => ( <DamageFX key={fx.id} fx={fx} onComplete={onFXComplete || (() => {})} /> ))}</AnimatePresence></div>
        </div>
        <div className={`absolute ${isEnemy ? 'right-full mr-2' : 'left-full ml-2'} top-0 flex flex-col gap-1 w-12`}><div className="h-1 bg-black/60 rounded-full overflow-hidden border border-white/5"><motion.div animate={{ width: `${(unit.currentHp / unit.maxHp) * 100}%` }} className={`h-full ${isEnemy ? 'bg-red-500' : 'bg-cyan-500'}`} /></div>{!isEnemy && ( <div className="h-1 bg-black/60 rounded-full overflow-hidden border border-white/5"><motion.div animate={{ width: `${unit.burst}%` }} className="h-full bg-yellow-500" /></div> )}<div className="flex gap-0.5 mt-0.5 justify-end">{unit.statusEffects.map(s => ( <div key={s.id} className={`w-1.5 h-1.5 rounded-sm ${s.type === 'buff' ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} title={s.name} /> ))}</div></div>
      </div>
    </motion.div>
  );
}

function RewardItem({ label, value, color }: any) {
    return (
        <div className="px-4 py-2 bg-black/40 rounded-2xl border border-white/5 flex flex-col items-center gap-1">
            <span className="text-[8px] font-black text-white/40 uppercase">{label}</span>
            <span className={`text-xs font-black ${color}`}>{value}</span>
        </div>
    );
}

function Star({ size, className }: { size: number, className: string }) {
    return ( <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg> );
}
