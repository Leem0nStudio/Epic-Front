'use client';

import React, { useState, useEffect } from 'react';
import { BattleService, CombatUnit } from '@/lib/services/battle-service';
import { UnitService } from '@/lib/services/unit-service';
import { ChevronLeft, Sword, Shield, Award } from 'lucide-react';
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
    setEnemyUnits([{ id: 'enemy_1', name: 'Gólem de Roca', stats: { hp: 500, atk: 40, def: 60, matk: 10, mdef: 20, agi: 5 }, currentHp: 500, team: 'enemy', isDead: false, position: 0, skills: [] }]);
    addLog("Comienza la batalla.");
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
            addLog(`${actor.name} ataca a ${target.name} por ${dmg}.`);
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
            addLog(`${actor.name} usa ${skill ? skill.name : 'Tajo'} sobre ${target.name} por ${dmg}.`);
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
    <div className="flex flex-col h-full bg-[#0d0805] animate-in fade-in duration-500 overflow-hidden relative">
      <div className="p-4 flex items-center justify-between border-b border-[#382618] bg-[#1a110a] z-10">
         <button onClick={onBack} className="text-[#a68a68] flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest"><ChevronLeft size={16} /> Retirada</button>
         <div className="flex flex-col items-center">
            <span className="text-[10px] text-[#c79a5d] font-bold uppercase tracking-[0.3em]">Bosque de Geffen</span>
            <span className="text-xs text-[#a68a68] font-mono">TURNO {Math.floor(turn / Math.max(1, (playerUnits.length + enemyUnits.length))) + 1}</span>
         </div>
         <div className="w-12"></div>
      </div>
      <div className="flex-1 relative overflow-hidden bg-cover bg-center">
         <div className="absolute inset-0 bg-black/40"></div>
         <div className="absolute top-[20%] right-8 flex flex-col gap-8">
            {enemyUnits.map(enemy => (
              <motion.div key={enemy.id} className={`relative flex flex-col items-center ${enemy.isDead ? 'opacity-0 scale-50 pointer-events-none' : ''}`}>
                 <div className="w-16 h-1 bg-black/60 rounded-full mb-1 border border-[#382618] overflow-hidden">
                    <motion.div animate={{ width: `${(enemy.currentHp / enemy.stats.hp) * 100}%` }} className="h-full bg-red-600" />
                 </div>
                 <div className="w-20 h-20 bg-black/20 rounded-full flex items-center justify-center relative">
                    <img src="https://raw.githubusercontent.com/Leem0nGames/gameassets/main/RO/abbys_sprite_001.png" className="w-[180%] max-w-none transform translate-y-2 brightness-50" style={{imageRendering: 'pixelated'}} />
                    {activeUnitId === enemy.id && <div className="absolute inset-0 border-2 border-red-500 rounded-full animate-ping"></div>}
                 </div>
                 <span className="text-[10px] font-bold text-red-400 mt-1 uppercase">{enemy.name}</span>
              </motion.div>
            ))}
         </div>
         <div className="absolute bottom-[20%] left-8 flex flex-col gap-8">
            {playerUnits.map(player => (
              <motion.div key={player.id} className={`relative flex flex-col items-center ${player.isDead ? 'opacity-30 grayscale' : ''}`}>
                 <div className="w-24 h-24 bg-black/20 rounded-full flex items-center justify-center relative">
                    <img src="https://raw.githubusercontent.com/Leem0nGames/gameassets/main/RO/abbys_sprite_001.png" className="w-[200%] max-w-none transform translate-y-4 brightness-110" style={{imageRendering: 'pixelated'}} />
                    {activeUnitId === player.id && <div className="absolute inset-0 border-2 border-[#eacf9b] rounded-full animate-pulse shadow-[0_0_15px_#eacf9b]"></div>}
                 </div>
                 <div className="w-16 h-1.5 bg-black/60 rounded-full mt-1 border border-[#382618] overflow-hidden">
                    <motion.div animate={{ width: `${(player.currentHp / player.stats.hp) * 100}%` }} className="h-full bg-[#44aaff]" />
                 </div>
                 <span className="text-[10px] font-bold text-[#eacf9b] mt-1 uppercase">{player.name}</span>
              </motion.div>
            ))}
         </div>
      </div>
      <div className="h-32 bg-[#1a110a] border-t border-[#382618] p-3 flex flex-col gap-1 font-mono text-[10px] overflow-hidden uppercase">
         {battleLog.map((log, i) => (
           <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1 - (i * 0.2), x: 0 }} key={i} className={`${log.includes('ataca') ? 'text-red-400' : 'text-[#a68a68]'}`}>
             {`> ${log}`}
           </motion.div>
         ))}
      </div>
      <AnimatePresence>
        {isBattleOver && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-8 text-center">
             <motion.div initial={{ scale: 0.5, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-[#1a110a] border-2 border-[#c79a5d] p-8 rounded flex flex-col items-center gap-6">
                {winner === 'player' ? (<><Award size={64} className="text-[#ffaa00] animate-bounce" /><h2 className="text-3xl font-serif font-black text-[#eacf9b] tracking-widest uppercase">¡Victoria!</h2></>) : (<><Shield size={64} className="text-red-600 opacity-50" /><h2 className="text-3xl font-serif font-black text-red-600 tracking-widest uppercase">Derrota</h2></>)}
                <button onClick={() => { onRefresh(); onBack(); }} className="mt-4 bg-[#c79a5d] text-black font-bold py-3 px-8 rounded tracking-widest hover:brightness-110 active:scale-95 transition-all uppercase">Volver</button>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
