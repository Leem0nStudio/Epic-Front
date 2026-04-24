import React, { useState, useEffect, useRef } from 'react';
import { Sword, Shield, Heart, Zap, ChevronLeft, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BattleService, CombatUnit } from '@/lib/services/battle-service';
import { QuestService } from '@/lib/services/quest-service';

interface BattleScreenViewProps {
  squad: any[];
  onBack: () => void;
  onRefresh: () => void;
}

export function BattleScreenView({ squad, onBack, onRefresh }: BattleScreenViewProps) {
  const [battleLog, setBattleLog] = useState<string[]>(["¡Comienza la batalla!"]);
  const [playerUnits, setPlayerUnits] = useState<CombatUnit[]>([]);
  const [enemyUnits, setEnemyUnits] = useState<CombatUnit[]>([]);
  const [turn, setTurn] = useState(0);
  const [isBattleOver, setIsBattleOver] = useState(false);
  const [winner, setWinner] = useState<'player' | 'enemy' | null>(null);
  const [activeUnitId, setActiveUnitId] = useState<string | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);

  // Initialize Battle
  useEffect(() => {
    const players: CombatUnit[] = squad.filter(u => u !== null).map((u, i) => {
      const stats = u.base_stats || u.baseStats; // Handle both DB and local formats
      return {
        id: u.id,
        name: u.name,
        stats: stats,
        currentHp: stats.hp,
        team: 'player' as const,
        isDead: false,
        position: i
      };
    });

    const enemies: CombatUnit[] = [
      { id: 'e1', name: 'Lobo Feroz', stats: { hp: 200, atk: 30, def: 10, matk: 0, mdef: 10, agi: 15 }, currentHp: 200, team: 'enemy', isDead: false, position: 0 },
      { id: 'e2', name: 'Goblin Asaltante', stats: { hp: 150, atk: 25, def: 5, matk: 0, mdef: 5, agi: 20 }, currentHp: 150, team: 'enemy', isDead: false, position: 1 }
    ];

    setPlayerUnits(players);
    setEnemyUnits(enemies);
  }, [squad]);

  const addLog = (msg: string) => setBattleLog(prev => [msg, ...prev].slice(0, 5));

  const processTurn = async () => {
    if (isBattleOver) return;

    const allUnits = [...playerUnits, ...enemyUnits];
    const order = BattleService.getTurnOrder(allUnits);
    const actor = order[turn % order.length];

    if (!actor || actor.isDead) {
        setTurn(t => t + 1);
        return;
    }

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
            addLog(`${actor.name} ataca a ${target.name} por ${dmg} de daño.`);

            if (newPlayers.every(p => p.isDead)) {
                setIsBattleOver(true);
                setWinner('enemy');
            }
        }
    } else {
        const targets = enemyUnits.filter(e => !e.isDead);
        if (targets.length > 0) {
            const target = targets[0];
            const dmg = BattleService.calculateDamage(actor, target);
            const newEnemies = enemyUnits.map(e => {
                if (e.id === target.id) {
                    const newHp = Math.max(0, e.currentHp - dmg);
                    return { ...e, currentHp: newHp, isDead: newHp <= 0 };
                }
                return e;
            });
            setEnemyUnits(newEnemies);
            addLog(`${actor.name} usa Tajo sobre ${target.name} por ${dmg}.`);

            if (newEnemies.every(e => e.isDead)) {
                setIsBattleOver(true);
                setWinner('player');
            }
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

  const handleClaimReward = async () => {
    setIsClaiming(true);
    try {
      await QuestService.completeQuest(250, 10);
      onRefresh();
      onBack();
    } catch (e) {
      console.error(e);
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0d0805] animate-in fade-in duration-500 overflow-hidden relative">

      {/* Top Bar */}
      <div className="p-4 flex items-center justify-between border-b border-[#382618] bg-[#1a110a] z-10">
         <button onClick={onBack} className="text-[#a68a68] flex items-center gap-1 text-xs font-bold uppercase tracking-widest">
            <ChevronLeft size={16} /> Retirada
         </button>
         <div className="flex flex-col items-center">
            <span className="text-[10px] text-[#c79a5d] font-bold uppercase tracking-[0.3em]">Bosque de Geffen</span>
            <span className="text-xs text-[#a68a68] font-mono">TURNO {Math.floor(turn / (playerUnits.length + enemyUnits.length)) + 1}</span>
         </div>
         <div className="w-12"></div>
      </div>

      {/* Battle Field */}
      <div className="flex-1 relative overflow-hidden bg-[url('https://raw.githubusercontent.com/Leem0nGames/gameassets/main/file_000000004e3071f5a7171db25e254771.png')] bg-cover bg-center">
         <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"></div>

         {/* Enemies */}
         <div className="absolute top-[20%] right-8 flex flex-col gap-8">
            {enemyUnits.map(enemy => (
              <motion.div
                key={enemy.id}
                animate={activeUnitId === enemy.id ? { x: -20 } : { x: 0 }}
                className={`relative flex flex-col items-center ${enemy.isDead ? 'opacity-0 scale-50 transition-all duration-1000 pointer-events-none' : ''}`}
              >
                 <div className="w-16 h-1 bg-black/60 rounded-full mb-1 border border-[#382618] overflow-hidden">
                    <motion.div
                        initial={{ width: '100%' }}
                        animate={{ width: `${(enemy.currentHp / enemy.stats.hp) * 100}%` }}
                        className="h-full bg-red-600"
                    />
                 </div>
                 <div className="w-20 h-20 bg-black/20 rounded-full flex items-center justify-center relative">
                    <img src="https://raw.githubusercontent.com/Leem0nGames/gameassets/main/RO/abbys_sprite_001.png" className="w-[180%] max-w-none transform translate-y-2 brightness-50 sepia(1) hue-rotate-[280deg]" style={{imageRendering: 'pixelated'}} />
                    {activeUnitId === enemy.id && <div className="absolute inset-0 border-2 border-red-500 rounded-full animate-ping"></div>}
                 </div>
                 <span className="text-[10px] font-bold text-red-400 mt-1 uppercase text-stroke-black">{enemy.name}</span>
              </motion.div>
            ))}
         </div>

         {/* Players */}
         <div className="absolute bottom-[20%] left-8 flex flex-col gap-8">
            {playerUnits.map(player => (
              <motion.div
                key={player.id}
                animate={activeUnitId === player.id ? { x: 20 } : { x: 0 }}
                className={`relative flex flex-col items-center ${player.isDead ? 'opacity-30 grayscale' : ''}`}
              >
                 <div className="w-24 h-24 bg-black/20 rounded-full flex items-center justify-center relative">
                    <img src="https://raw.githubusercontent.com/Leem0nGames/gameassets/main/RO/abbys_sprite_001.png" className="w-[200%] max-w-none transform translate-y-4 brightness-110" style={{imageRendering: 'pixelated'}} />
                    {activeUnitId === player.id && <div className="absolute inset-0 border-2 border-[#eacf9b] rounded-full animate-pulse shadow-[0_0_15px_#eacf9b]"></div>}
                 </div>
                 <div className="w-16 h-1.5 bg-black/60 rounded-full mt-1 border border-[#382618] overflow-hidden">
                    <motion.div
                        initial={{ width: '100%' }}
                        animate={{ width: `${(player.currentHp / player.stats.hp) * 100}%` }}
                        className="h-full bg-[#44aaff]"
                    />
                 </div>
                 <span className="text-[10px] font-bold text-[#eacf9b] mt-1 uppercase text-stroke-black">{player.name}</span>
              </motion.div>
            ))}
         </div>
      </div>

      {/* Battle Log */}
      <div className="h-32 bg-[#1a110a] border-t border-[#382618] p-3 flex flex-col gap-1 font-mono text-[10px] overflow-hidden">
         {battleLog.map((log, i) => (
           <motion.div
             initial={{ opacity: 0, x: -10 }}
             animate={{ opacity: 1 - (i * 0.2), x: 0 }}
             key={i}
             className={`${log.includes('ataca') ? 'text-red-400' : 'text-[#a68a68]'}`}
           >
             {`> ${log}`}
           </motion.div>
         ))}
      </div>

      {/* Overlay Results */}
      <AnimatePresence>
        {isBattleOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-8 text-center"
          >
             <motion.div
                initial={{ scale: 0.5, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-[#1a110a] border-2 border-[#c79a5d] p-8 rounded shadow-[0_0_50px_rgba(0,0,0,1)] flex flex-col items-center gap-6"
             >
                {winner === 'player' ? (
                  <>
                    <Award size={64} className="text-[#ffaa00] animate-bounce" />
                    <h2 className="text-3xl font-serif font-black text-[#eacf9b] tracking-widest uppercase">¡VICTORIA!</h2>
                    <p className="text-[#a68a68] text-sm">Has derrotado a los enemigos y asegurado la zona.</p>
                    <div className="flex flex-col gap-2 w-full">
                       <div className="flex justify-between items-center text-xs border-b border-[#382618] py-2">
                          <span className="text-[#a68a68]">ZENY GANADO</span>
                          <span className="text-[#eacf9b] font-bold">+250</span>
                       </div>
                       <div className="flex justify-between items-center text-xs border-b border-[#382618] py-2">
                          <span className="text-[#a68a68]">GEMA DE FORJA</span>
                          <span className="text-[#44aaff] font-bold">+10</span>
                       </div>
                    </div>
                  </>
                ) : (
                  <>
                    <Shield size={64} className="text-red-600 opacity-50" />
                    <h2 className="text-3xl font-serif font-black text-red-600 tracking-widest uppercase">DERROTA</h2>
                    <p className="text-[#a68a68] text-sm">Tu equipo ha caído en combate. Debes fortalecerte más.</p>
                  </>
                )}

                <button
                  onClick={winner === 'player' ? handleClaimReward : onBack}
                  disabled={isClaiming}
                  className="mt-4 bg-[#c79a5d] text-black font-bold py-3 px-8 rounded tracking-widest hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isClaiming ? "RECLAMANDO..." : "VOLVER A LA CIUDAD"}
                </button>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
