'use client';

import React, { useState, useEffect, useRef } from 'react';
import { BattleService, CombatUnit } from '@/lib/services/battle-service';
import { UnitService } from '@/lib/services/unit-service';
import { ChevronLeft, Sword, Shield, Award, Zap, Heart, Terminal, Swords, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BattleScreenViewProps {
  squad: any[];
  onBack: () => void;
  onRefresh: () => void;
}

export function BattleScreenView({ squad, onBack, onRefresh }: BattleScreenViewProps) {
  const [playerUnits, setPlayerUnits] = useState<CombatUnit[]>([]);
  const [enemyUnits, setEnemyUnits] = useState<CombatUnit[]>([]);
  const [turn, setTurn] = useState(0);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [activeUnitId, setActiveUnitId] = useState<string | null>(null);
  const [isBattleOver, setIsBattleOver] = useState(false);
  const [winner, setWinner] = useState<'player' | 'enemy' | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  
  const turnInProgress = useRef(false);

  useEffect(() => {
    initializeBattle();
  }, []);

  const initializeBattle = async () => {
    setIsInitializing(true);
    setInitError(null);
    setBattleLog(["Iniciando protocolos de combate..."]);

    try {
        const pUnits: CombatUnit[] = [];
        const activeSquad = (squad || []).filter(u => u !== null);
        
        if (activeSquad.length === 0) {
            setInitError("No se detectaron unidades activas en tu escuadrón.");
            setIsInitializing(false);
            return;
        }

        for (const unit of activeSquad) {
            try {
                const details = await UnitService.getUnitDetails(unit.id);
                pUnits.push({
                    id: unit.id,
                    name: unit.name,
                    stats: details.finalStats,
                    currentHp: details.finalStats.hp,
                    team: 'player',
                    isDead: false,
                    position: 0,
                    skills: details.skills || []
                });
            } catch (e) {
                console.error("Error fetching unit details:", e);
            }
        }
        
        if (pUnits.length === 0) {
            setInitError("Fallo al enlazar con las unidades del escuadrón.");
        } else {
            setPlayerUnits(pUnits);
            setEnemyUnits([{
                id: 'enemy_1',
                name: 'Guardián del Templo',
                stats: { hp: 500, atk: 45, def: 55, matk: 10, mdef: 30, agi: 12 },
                currentHp: 500,
                team: 'enemy',
                isDead: false,
                position: 0,
                skills: []
            }]);
            addLog("Enlace de datos completo. Comenzando simulación.");
        }
    } catch (err: any) {
        console.error("Initialization error:", err);
        setInitError("Error crítico de sistema: " + (err.message || "Desconocido"));
    } finally {
        setIsInitializing(false);
    }
  };

  const addLog = (msg: string) => setBattleLog(prev => [msg, ...prev].slice(0, 5));

  const processTurn = async () => {
    if (isBattleOver || isInitializing || turnInProgress.current || initError) return;
    
    const alivePlayers = playerUnits.filter(p => !p.isDead);
    const aliveEnemies = enemyUnits.filter(e => !e.isDead);

    if (alivePlayers.length === 0 || aliveEnemies.length === 0) return;

    turnInProgress.current = true;

    const allUnits = [...playerUnits, ...enemyUnits].filter(u => !u.isDead);
    const order = BattleService.getTurnOrder(allUnits);
    const actorIdx = turn % order.length;
    const actor = order[actorIdx];

    if (!actor || actor.isDead) {
        setTurn(t => t + 1);
        turnInProgress.current = false;
        return;
    }

    setActiveUnitId(actor.id);
    await new Promise(r => setTimeout(r, 1000));

    if (actor.team === 'enemy') {
        const targets = playerUnits.filter(p => !p.isDead);
        if (targets.length > 0) {
            const target = BattleService.getEnemyAction(actor, playerUnits);
            if (target) {
                const dmg = BattleService.calculateDamage(actor, target);
                setPlayerUnits(prev => prev.map(p => {
                    if (p.id === target.id) {
                        const newHp = Math.max(0, p.currentHp - dmg);
                        return { ...p, currentHp: newHp, isDead: newHp <= 0 };
                    }
                    return p;
                }));
                addLog(`ADVERSARIO: ${actor.name} impacta a ${target.name} [-${dmg} HP].`);
            }
        }
    } else {
        const targets = enemyUnits.filter(e => !e.isDead);
        if (targets.length > 0) {
            const target = targets[0];
            const skill = actor.skills && actor.skills.length > 0 ? actor.skills[0] : null;
            const multiplier = skill?.scaling?.mult || 1.2;
            const isMagic = skill?.scaling?.stat === 'matk';
            const dmg = BattleService.calculateDamage(actor, target, multiplier, isMagic);

            setEnemyUnits(prev => prev.map(e => {
                if (e.id === target.id) {
                    const newHp = Math.max(0, e.currentHp - dmg);
                    return { ...e, currentHp: newHp, isDead: newHp <= 0 };
                }
                return e;
            }));
            addLog(`ALIADO: ${actor.name} usa ${skill?.name || 'Ataque'} contra ${target.name} [${dmg} DAÑO].`);
        }
    }

    setTurn(t => t + 1);
    setActiveUnitId(null);
    turnInProgress.current = false;
  };

  useEffect(() => {
    if (isInitializing || initError) return;

    const alivePlayers = playerUnits.filter(p => !p.isDead);
    const aliveEnemies = enemyUnits.filter(e => !e.isDead);

    if (playerUnits.length > 0 && alivePlayers.length === 0) {
        setTimeout(() => {
            setIsBattleOver(true);
            setWinner('enemy');
        }, 1000);
    } else if (enemyUnits.length > 0 && aliveEnemies.length === 0) {
        setTimeout(() => {
            setIsBattleOver(true);
            setWinner('player');
        }, 1000);
    }
  }, [playerUnits, enemyUnits, isInitializing, initError]);

  useEffect(() => {
    if (!isBattleOver && !isInitializing && !initError) {
        const timer = setTimeout(processTurn, 1200);
        return () => clearTimeout(timer);
    }
  }, [turn, isBattleOver, isInitializing, initError]);

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
            <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 rounded-3xl flex items-center justify-center">
                <AlertTriangle size={40} className="text-amber-400" />
            </div>
            <div className="space-y-2">
                <h2 className="text-white font-black uppercase tracking-widest italic text-lg">Incompatibilidad de Datos</h2>
                <p className="text-white/40 text-[10px] uppercase tracking-wider leading-relaxed">{initError}</p>
            </div>
            <button
                onClick={onBack}
                className="px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors"
            >
                Regresar al Cuartel
            </button>
        </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#020508] overflow-hidden relative">
      <div className="p-4 flex items-center justify-between border-b border-white/5 bg-[#0B1A2A] z-10 shadow-2xl shrink-0">
         <button onClick={onBack} className="text-white/40 hover:text-white flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors"><ChevronLeft size={16} /> Retirada</button>
         <div className="flex flex-col items-center">
            <span className="text-[10px] text-[#F5C76B] font-black uppercase tracking-[0.4em] italic">Zona Hostil</span>
            <span className="text-[9px] text-white/20 font-mono tracking-widest mt-0.5 uppercase">Sync Cycle: {turn + 1}</span>
         </div>
         <div className="w-20"></div>
      </div>

      <div className="flex-1 relative overflow-hidden flex flex-col items-center justify-center py-6">
         <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 via-transparent to-red-900/10 pointer-events-none" />

         <div className="flex-1 w-full flex items-center justify-center gap-12 relative">
            {enemyUnits.map(enemy => (
              <motion.div
                key={enemy.id}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{
                    opacity: enemy.isDead ? 0.2 : 1,
                    scale: enemy.isDead ? 0.8 : (activeUnitId === enemy.id ? 1.1 : 1),
                    x: activeUnitId === enemy.id ? [0, -10, 0] : 0
                }}
                className="relative flex flex-col items-center"
              >
                 <div className="w-24 h-1.5 bg-black/60 rounded-full mb-3 border border-white/10 overflow-hidden shadow-inner">
                    <motion.div animate={{ width: `${(enemy.currentHp / enemy.stats.hp) * 100}%` }} className="h-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                 </div>
                 <div className="w-28 h-28 bg-black/40 rounded-full flex items-center justify-center relative border border-red-500/10">
                    <img
                      src="https://raw.githubusercontent.com/Leem0nGames/gameassets/main/RO/abbys_sprite_001.png"
                      className="w-[180%] max-w-none transform translate-y-3 brightness-50"
                      style={{imageRendering: 'pixelated'}}
                    />
                    {activeUnitId === enemy.id && <motion.div animate={{ opacity: [0.2, 0.5, 0.2] }} transition={{ repeat: Infinity }} className="absolute inset-0 border-2 border-red-500 rounded-full scale-110" />}
                 </div>
                 <div className="mt-4 flex flex-col items-center">
                    <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">{enemy.name}</span>
                    <span className="text-[8px] font-bold text-white/20 uppercase tracking-tighter">LV. 24 BOSS</span>
                 </div>
              </motion.div>
            ))}
         </div>

         <div className="flex-1 w-full flex items-center justify-center gap-6 relative px-4">
            {playerUnits.map(player => (
              <motion.div
                key={player.id}
                animate={{
                    opacity: player.isDead ? 0.1 : 1,
                    scale: player.isDead ? 0.7 : (activeUnitId === player.id ? 1.1 : 1),
                    y: activeUnitId === player.id ? [0, -10, 0] : 0
                }}
                className="relative flex flex-col items-center"
              >
                 <div className="w-20 h-20 bg-black/40 rounded-full flex items-center justify-center relative border border-cyan-500/10">
                    <img
                      src="https://raw.githubusercontent.com/Leem0nGames/gameassets/main/RO/abbys_sprite_001.png"
                      className="w-[200%] max-w-none transform translate-y-4 brightness-110"
                      style={{imageRendering: 'pixelated'}}
                    />
                    {activeUnitId === player.id && <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ repeat: Infinity }} className="absolute inset-0 border-2 border-[#F5C76B] rounded-full shadow-[0_0_20px_rgba(245,199,107,0.4)]" />}
                 </div>
                 <div className="w-16 h-1 bg-black/60 rounded-full mt-4 border border-white/10 overflow-hidden shadow-inner">
                    <motion.div animate={{ width: `${(player.currentHp / player.stats.hp) * 100}%` }} className="h-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                 </div>
                 <span className="text-[8px] font-black text-white/60 mt-2 uppercase tracking-tighter truncate max-w-[60px]">{player.name}</span>
              </motion.div>
            ))}
         </div>
      </div>

      <div className="h-36 bg-black/80 backdrop-blur-xl border-t border-white/5 p-5 relative shrink-0">
         <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
         <div className="flex items-center gap-2 mb-3 text-white/20">
            <Terminal size={12} />
            <span className="text-[8px] font-black uppercase tracking-[0.4em]">Log de Sincronización</span>
         </div>
         <div className="space-y-1 overflow-hidden">
            {battleLog.map((log, i) => (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1 - (i * 0.15), x: 0 }}
                key={i}
                className={`text-[9px] font-bold tracking-wider uppercase flex items-center gap-2 ${log.includes('ADVERSARIO') ? 'text-red-400' : 'text-[#F5C76B]'}`}
              >
                <div className={`w-1 h-1 rounded-full ${log.includes('ADVERSARIO') ? 'bg-red-500' : 'bg-[#F5C76B]'}`} />
                {log}
              </motion.div>
            ))}
         </div>
      </div>

      <AnimatePresence>
        {isBattleOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-8 text-center bg-cover bg-center bg-no-repeat"
            style={winner === 'enemy' ? { backgroundImage: "url('/assets/backgrounds/losebg.png')" } : {}}
          >
             <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center gap-8"
             >
                {winner === 'player' ? (
                  <>
                    <div className="relative">
                      <Award size={80} className="text-[#F5C76B] drop-shadow-[0_0_30px_rgba(245,199,107,0.5)]" />
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 5, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border-2 border-dashed border-[#F5C76B]/20 rounded-full scale-150" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-4xl font-black text-white tracking-[0.4em] uppercase italic">Victoria</h2>
                      <p className="text-[#F5C76B] text-[10px] font-black tracking-[0.5em] uppercase">Misión Cumplida</p>
                    </div>
                  </>
                ) : (
                  <>
                    <Shield size={80} className="text-red-500 opacity-20" />
                    <div className="space-y-2">
                      <h2 className="text-4xl font-black text-white tracking-[0.4em] uppercase italic text-glow-blue">Derrota</h2>
                      <p className="text-red-500/40 text-[10px] font-black tracking-[0.5em] uppercase">Incompatibilidad de Combate</p>
                    </div>
                  </>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { onRefresh(); onBack(); }}
                  className="mt-8 bg-gradient-to-r from-white/10 to-white/5 border border-white/20 text-white font-black py-4 px-12 rounded-2xl tracking-[0.3em] uppercase text-[10px] hover:bg-white/10 transition-all shadow-2xl"
                >
                  Regresar al Reino
                </motion.button>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
