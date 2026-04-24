'use client';

import React, { useState, useEffect } from 'react';
import { BattleService, CombatUnit } from '@/lib/services/battle-service';
import { UnitService } from '@/lib/services/unit-service';
import { ChevronLeft, Sword, Shield, Award, Zap, Heart, Terminal } from 'lucide-react';
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

  useEffect(() => {
    initializeBattle();
  }, []);

  const initializeBattle = async () => {
    const pUnits: CombatUnit[] = [];
    for (const unit of squad) {
        if (!unit) continue;
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
                skills: details.skills
            });
        } catch (e) { console.error(e); }
    }
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
    addLog("Combate iniciado en el Templo Sumergido.");
  };

  const addLog = (msg: string) => setBattleLog(prev => [msg, ...prev].slice(0, 5));

  const processTurn = async () => {
    if (isBattleOver || playerUnits.length === 0 || enemyUnits.length === 0) return;
    const allUnits = [...playerUnits, ...enemyUnits];
    const order = BattleService.getTurnOrder(allUnits);
    const actor = order[turn % order.length];
    if (!actor || actor.isDead) { setTurn(t => t + 1); return; }
    setActiveUnitId(actor.id);
    await new Promise(r => setTimeout(r, 800));
    if (actor.team === 'enemy') {
        const target = BattleService.getEnemyAction(actor, playerUnits);
        if (target) {
            const dmg = BattleService.calculateDamage(actor, target);
            const newPlayers = playerUnits.map(p => {
                if (p.id === target.id) {
                    const newHp = Math.max(0, p.currentHp - dmg);
                    return { ...p, currentHp: newHp, isDead: newHp <= 0 };
                }
                return p;
            });
            setPlayerUnits(newPlayers);
            addLog(`ADVERSARIO: ${actor.name} impacta a ${target.name} [-${dmg} HP].`);
            if (newPlayers.every(p => p.isDead)) { setIsBattleOver(true); setWinner('enemy'); }
        }
    } else {
        const targets = enemyUnits.filter(e => !e.isDead);
        if (targets.length > 0) {
            const target = targets[0];
            const skill = actor.skills.length > 0 ? actor.skills[0] : null;
            const multiplier = skill ? (skill.scaling?.mult || 1.5) : 1.0;
            const isMagic = skill ? (skill.scaling?.stat === 'matk') : false;
            const dmg = BattleService.calculateDamage(actor, target, multiplier, isMagic);
            const newEnemies = enemyUnits.map(e => {
                if (e.id === target.id) {
                    const newHp = Math.max(0, e.currentHp - dmg);
                    return { ...e, currentHp: newHp, isDead: newHp <= 0 };
                }
                return e;
            });
            setEnemyUnits(newEnemies);
            addLog(`ALIADO: ${actor.name} usa ${skill ? skill.name : 'Ataque'} contra ${target.name} [${dmg} DAÑO].`);
            if (newEnemies.every(e => e.isDead)) { setIsBattleOver(true); setWinner('player'); }
        }
    }
    setTurn(t => t + 1);
    setActiveUnitId(null);
  };

  useEffect(() => {
    if (!isBattleOver && playerUnits.length > 0 && enemyUnits.length > 0) {
        const timer = setTimeout(processTurn, 1000);
        return () => clearTimeout(timer);
    }
  }, [turn, playerUnits, enemyUnits, isBattleOver]);

  return (
    <div className="flex flex-col h-full bg-[#020508] overflow-hidden relative">
      <div className="p-4 flex items-center justify-between border-b border-white/5 bg-[#0B1A2A] z-10 shadow-2xl">
         <button onClick={onBack} className="text-white/40 hover:text-white flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors"><ChevronLeft size={16} /> Retirada Táctica</button>
         <div className="flex flex-col items-center">
            <span className="text-[10px] text-[#F5C76B] font-black uppercase tracking-[0.4em] italic">Zona de Conflicto</span>
            <span className="text-[9px] text-white/20 font-mono tracking-widest mt-0.5">ORDEN DE TURNO: {turn + 1}</span>
         </div>
         <div className="w-20"></div>
      </div>

      <div className="flex-1 relative overflow-hidden flex flex-col items-center justify-center">
         <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 via-transparent to-red-900/10" />
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[1px] bg-white/5" />

         <div className="flex-1 w-full flex items-center justify-center gap-12 relative pb-10">
            {enemyUnits.map(enemy => (
              <motion.div
                key={enemy.id}
                className={`relative flex flex-col items-center ${enemy.isDead ? 'opacity-0 scale-50' : ''}`}
                animate={activeUnitId === enemy.id ? { scale: 1.1 } : { scale: 1 }}
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

         <div className="flex-1 w-full flex items-center justify-center gap-8 relative pt-10">
            {playerUnits.map(player => (
              <motion.div
                key={player.id}
                className={`relative flex flex-col items-center ${player.isDead ? 'opacity-20 grayscale' : ''}`}
                animate={activeUnitId === player.id ? { scale: 1.1 } : { scale: 1 }}
              >
                 <div className="w-20 h-20 bg-black/40 rounded-full flex items-center justify-center relative border border-cyan-500/10">
                    <img
                      src="https://raw.githubusercontent.com/Leem0nGames/gameassets/main/RO/abbys_sprite_001.png"
                      className="w-[200%] max-w-none transform translate-y-4 brightness-110"
                      style={{imageRendering: 'pixelated'}}
                    />
                    {activeUnitId === player.id && <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ repeat: Infinity }} className="absolute inset-0 border-2 border-[#F5C76B] rounded-full shadow-[0_0_20px_rgba(245,199,107,0.4)]" />}
                 </div>
                 <div className="w-20 h-1.5 bg-black/60 rounded-full mt-4 border border-white/10 overflow-hidden shadow-inner">
                    <motion.div animate={{ width: `${(player.currentHp / player.stats.hp) * 100}%` }} className="h-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                 </div>
                 <span className="text-[9px] font-black text-white/60 mt-2 uppercase tracking-widest">{player.name}</span>
              </motion.div>
            ))}
         </div>
      </div>

      <div className="h-40 bg-black/80 backdrop-blur-xl border-t border-white/5 p-5 relative">
         <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
         <div className="flex items-center gap-2 mb-3 text-white/20">
            <Terminal size={12} />
            <span className="text-[8px] font-black uppercase tracking-[0.4em]">Registro de Sincronización</span>
         </div>
         <div className="space-y-1.5 overflow-hidden">
            {battleLog.map((log, i) => (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1 - (i * 0.2), x: 0 }}
                key={i}
                className={`text-[10px] font-bold tracking-wider uppercase flex items-center gap-2 ${log.includes('ADVERSARIO') ? 'text-red-400' : 'text-[#F5C76B]'}`}
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
            className="absolute inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-8 text-center"
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
                      <p className="text-[#F5C76B] text-[10px] font-black tracking-[0.5em] uppercase">Objetivo Cumplido</p>
                    </div>
                  </>
                ) : (
                  <>
                    <Shield size={80} className="text-red-500 opacity-20" />
                    <div className="space-y-2">
                      <h2 className="text-4xl font-black text-white tracking-[0.4em] uppercase italic">Derrota</h2>
                      <p className="text-red-500/40 text-[10px] font-black tracking-[0.5em] uppercase">Unidades Caídas</p>
                    </div>
                  </>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { onRefresh(); onBack(); }}
                  className="mt-8 bg-gradient-to-r from-white/10 to-white/5 border border-white/20 text-white font-black py-4 px-12 rounded-2xl tracking-[0.3em] uppercase text-xs hover:bg-white/10 transition-all"
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
