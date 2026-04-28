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
  const [isShaking, setIsShaking] = useState(false);
  const [damageNumbers, setDamageNumbers] = useState<{ id: number, value: number, x: number, y: number, color: string, isCrit?: boolean }[]>([]);

  // Statistics for Star calculation
  const [stats, setStats] = useState({
    totalTurns: 0,
    playerDeaths: 0
  });

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 300);
  };

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
          const stage = await CampaignService.getStageById(stageId);
          if (stage) {
            enemies = stage.enemies.map(e => CombatAdapter.createEnemy(e.id, e.name, e.level, e.position));
          }
        }

        if (enemies.length === 0) {
          enemies = [
            CombatAdapter.createEnemy('e1', 'Demonio de Elite', 5, 1),
            CombatAdapter.createEnemy('e2', 'Archimago Oscuro', 5, 2)
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

  const addDamageNumber = (value: number, unitId: string, color: string = 'text-white', isCrit: boolean = false) => {
    const id = Date.now() + Math.random();
    const xOffset = Math.random() * 60 - 30;
    const yOffset = -50 - Math.random() * 20;
    setDamageNumbers(prev => [...prev, { id, value, x: xOffset, y: yOffset, color, isCrit }]);
    setTimeout(() => setDamageNumbers(prev => prev.filter(d => d.id !== id)), 1200);
    if (value > 10) triggerShake();
  };

  const runTurn = (actor: CombatUnit, skill: SkillDefinition, manualTargetId?: string) => {
    if (isBattleOver) return;

    const { results, updatedUnits } = BattleManager.executeTurn(actor, skill, units, manualTargetId);

    results.forEach(r => {
      if (r.type === 'damage' && r.value && r.value > 0) {
        addDamageNumber(r.value, r.targetId, 'text-red-500');
      }
    });

    setBattleLog(prev => [...prev, ...results.map(r => r.log)].slice(-20));
    setUnits(updatedUnits);
    setTurn(prev => prev + 1);
    setTargetId(null);
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
        const result = await CampaignService.completeStage(stageId, { turns: round, deaths });
        setCompletionData(result);
      } catch (e) {
        console.error("Failed to record stage completion:", e);
      } finally {
        setIsRecordingResult(false);
      }
    }
  };

  if (isInitializing) return <LoadingScreen />;
  if (initError) return <ErrorScreen error={initError} onBack={onBack} />;

  const playerUnits = units.filter(u => u.side === 'player');
  const enemyUnits = units.filter(u => u.side === 'enemy' && !u.isDead);
  const currentActor = units.find(u => u.id === activeUnitId);
  
  const totalEnemyHp = enemyUnits.reduce((acc, u) => acc + u.currentHp, 0);
  const maxEnemyHp = enemyUnits.reduce((acc, u) => acc + u.maxHp, 0);

  return (
    <motion.div 
      animate={isShaking ? { x: [-5, 5, -5, 5, 0], y: [-5, 5, 5, -5, 0] } : {}}
      transition={{ duration: 0.1, repeat: 2 }}
      className="flex flex-col h-full bg-[#050A0F] overflow-hidden relative font-sans text-white select-none"
    >
      {/* Background Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center animate-slow-zoom opacity-30 blur-[2px] scale-110" style={{ backgroundImage: `url('${AssetService.getBgUrl('battle')}')` }} />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_20%,#050A0F_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050A0F] via-transparent to-[#050A0F]" />
      </div>

      {/* TOP: Boss HP Bar & Elements */}
      <div className="relative z-20 px-6 pt-12 pb-4">
        <div className="flex justify-between items-center mb-3 px-1">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all active:scale-90"><ChevronLeft size={20} /></button>
          <div className="flex flex-col items-center">
             <div className="flex items-center gap-2 mb-1">
                <Swords size={12} className="text-[#F5C76B]" />
                <span className="text-[12px] font-black tracking-[0.4em] text-[#F5C76B] uppercase italic drop-shadow-[0_0_10px_rgba(245,199,107,0.5)]">STAGE {stageId?.replace('stage_', '').replace('_', '-')}</span>
             </div>
             <div className="flex items-center gap-3">
                <span className="text-[8px] text-white/40 font-mono tracking-widest uppercase">RONDA {round}</span>
                <div className="w-1 h-1 rounded-full bg-white/20" />
                <span className="text-[8px] text-white/40 font-mono tracking-widest uppercase">TURNO {stats.totalTurns}</span>
             </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <Activity size={18} className="text-[#F5C76B] animate-pulse" />
          </div>
        </div>

        <div className="relative h-7 bg-black/80 rounded-sm border-x-4 border-[#F5C76B] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
          <motion.div 
            initial={{ width: '100%' }}
            animate={{ width: `${(totalEnemyHp / maxEnemyHp) * 100}%` }}
            className="h-full bg-[linear-gradient(90deg,#991b1b_0%,#ef4444_50%,#f87171_100%)] relative"
          >
             <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.3)_0%,transparent_50%,rgba(0,0,0,0.3)_100%)]" />
             <motion.div 
               animate={{ x: ['-100%', '200%'] }} 
               transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
               className="absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg]" 
             />
          </motion.div>
          <div className="absolute inset-0 flex items-center justify-center text-[11px] font-black tracking-[0.2em] drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] italic">
            {totalEnemyHp.toLocaleString()} <span className="mx-1 text-white/40">/</span> {maxEnemyHp.toLocaleString()}
          </div>
        </div>

        {/* Elemental Orbs Row - Now interactive-looking */}
        <div className="flex justify-center gap-5 mt-4">
          {['#4ade80', '#60a5fa', '#f87171', '#fbbf24', '#c084fc'].map((color, i) => (
            <motion.div 
              key={i} 
              animate={{ y: [0, -3, 0], opacity: [0.6, 1, 0.6] }}
              transition={{ repeat: Infinity, duration: 2, delay: i * 0.4 }}
              className="w-3 h-3 rounded-full border border-white/30 shadow-[0_0_15px_rgba(0,0,0,0.5)] relative" 
              style={{ backgroundColor: color }}
            >
               <div className="absolute inset-0 rounded-full bg-white/40 blur-[1px] scale-50 translate-x-[-20%] translate-y-[-20%]" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* FIELD: Battle View Area */}
      <div className="flex-1 relative z-10 px-4 flex flex-col justify-center overflow-visible">
        {/* Enemies Section */}
        <div className="flex justify-center gap-12 -mt-16">
          {enemyUnits.map((enemy) => (
            <EnemySprite key={enemy.id} enemy={enemy} isTargeted={targetId === enemy.id} onTarget={() => setTargetId(enemy.id)} />
          ))}
        </div>

        {/* Player Sprites on Field */}
        <div className="absolute bottom-20 left-6 right-6 flex justify-between items-end px-8">
          {playerUnits.map((unit) => (
            <PlayerSprite key={unit.id} unit={unit} isActive={unit.id === activeUnitId} />
          ))}
        </div>

       {/* Damage Numbers Container */}
       <div className="absolute inset-0 pointer-events-none z-[100]">
         <AnimatePresence>
           {damageNumbers.map(d => (
             <motion.div
               key={d.id}
               initial={{ opacity: 0, y: 0, scale: 0.5, rotate: -10 }}
               animate={{ opacity: 1, y: d.y, scale: d.isCrit ? 2.5 : 1.8, rotate: Math.random() * 20 - 10 }}
               exit={{ opacity: 0, scale: 0.2 }}
               transition={{ type: 'spring', damping: 10 }}
               className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-black text-3xl italic drop-shadow-[0_4px_8px_rgba(0,0,0,1)] flex flex-col items-center z-[110] ${d.color}`}
               style={{ marginLeft: d.x }}
             >
               {d.isCrit && <span className="text-[10px] uppercase tracking-[0.3em] mb-[-4px] text-yellow-300 drop-shadow-none">CRITICAL</span>}
               {d.value}
             </motion.div>
           ))}
         </AnimatePresence>
       </div>

       {/* Status Effects Visualization */}
       <div className="absolute inset-0 pointer-events-none z-40">
         <AnimatePresence>
           {units.filter(u => u.statusEffects.length > 0).map(unit => (
             <div
               key={`status-${unit.id}`}
               className="absolute"
               style={{
                 top: unit.side === 'player' ? '60%' : '25%',
                 left: unit.position < 3 ? `${20 + unit.position * 25}%` : `${30 + (unit.position - 3) * 25}%`,
               }}
             >
               <div className="flex gap-1">
                 {unit.statusEffects.map((effect, idx) => (
                   <motion.div
                     key={`${effect.id}-${idx}`}
                     initial={{ scale: 0 }}
                     animate={{ scale: 1 }}
                     exit={{ scale: 0 }}
                     className={`w-6 h-6 rounded-lg border flex items-center justify-center text-[8px] font-black ${
                       effect.type === 'buff' ? 'bg-blue-500/30 border-blue-500/40 text-blue-400' :
                       effect.type === 'debuff' ? 'bg-red-500/30 border-red-500/40 text-red-400' :
                       effect.type === 'dot' ? 'bg-purple-500/30 border-purple-500/40 text-purple-400' :
                       'bg-white/10 border-white/20 text-white'
                     }`}
                     title={`${effect.name} (${effect.remainingTurns} turns)`}
                   >
                     {effect.type === 'buff' ? '↑' : effect.type === 'debuff' ? '↓' : '●'}
                   </motion.div>
                 ))}
               </div>
             </div>
           ))}
         </AnimatePresence>
       </div>
      </div>

      {/* BOTTOM: Unit Cards & Skill Bar */}
      <div className="relative z-30 pb-8 px-4 flex flex-col gap-6">
        {/* Unit Cards Grid - Improved with more detail */}
        <div className="grid grid-cols-4 gap-3">
          {playerUnits.map((unit) => (
            <UnitCard key={unit.id} unit={unit} isActive={unit.id === activeUnitId} />
          ))}
        </div>

        {/* Skill Selection Bar - More Premium */}
        <div className="flex items-center gap-4 bg-[#0B1A2A]/80 backdrop-blur-2xl p-4 rounded-[2.5rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,1)] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#F5C76B]/5 via-transparent to-transparent" />
          
          <div className="flex-1 flex gap-3">
            {currentActor?.side === 'player' && currentActor.skills.map(skill => (
              <SkillButton 
                key={skill.id} 
                skill={skill} 
                onUse={() => runTurn(currentActor, skill, targetId || undefined)} 
                cooldown={currentActor.cooldowns[skill.id]}
              />
            ))}
          </div>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#991b1b] via-[#ef4444] to-[#f87171] p-1 shadow-[0_0_30px_rgba(239,68,68,0.4)] group relative overflow-hidden"
          >
             <div className="w-full h-full bg-[#0B1A2A]/90 rounded-full flex flex-col items-center justify-center border-2 border-white/20">
                <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5 }} className="absolute inset-0 bg-white/10 rounded-full" />
                <span className="text-[7px] font-black text-white/60 uppercase tracking-widest leading-none mb-0.5">Burst</span>
                <span className="text-[11px] font-black text-white uppercase leading-none italic drop-shadow-lg">ULTRA</span>
             </div>
          </motion.button>
        </div>
      </div>

      {/* Battle Log Terminal Overlay */}
      <div className="absolute top-40 left-4 pointer-events-none z-20">
        <div className="max-h-[120px] overflow-hidden flex flex-col gap-1">
          {battleLog.slice(-5).map((log, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-black/30 backdrop-blur-sm border-l-2 border-[#F5C76B]/40 px-3 py-1 rounded-r-lg"
            >
              <span className="text-[7px] font-mono text-white/70 uppercase tracking-widest">{log}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Victory/Defeat Overlay */}
      <AnimatePresence>
        {isBattleOver && <BattleResult winner={winner} completionData={completionData} isRecording={isRecordingResult} onConfirm={() => { onRefresh(); onBack(); }} />}
      </AnimatePresence>
    </motion.div>
  );
}

function EnemySprite({ enemy, isTargeted, onTarget }: { enemy: CombatUnit, isTargeted: boolean, onTarget: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: isTargeted ? [0, -5, 0] : 0,
        scale: isTargeted ? 1.15 : 1 
      }}
      transition={isTargeted ? { repeat: Infinity, duration: 1 } : {}}
      onClick={onTarget}
      className="relative cursor-pointer group"
    >
      <div className="absolute -top-14 left-1/2 -translate-x-1/2 w-20 flex flex-col items-center gap-1">
        <div className="flex items-center gap-1">
           <span className="text-[7px] font-black text-red-500 bg-black/40 px-1 rounded-sm border border-red-500/20">LV.5</span>
           <span className="text-[8px] font-black text-white drop-shadow-lg truncate uppercase tracking-tighter">{enemy.name}</span>
        </div>
        <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/10 shadow-lg">
           <div className="h-full bg-gradient-to-r from-red-600 to-red-400" style={{ width: `${(enemy.currentHp / enemy.maxHp) * 100}%` }} />
        </div>
      </div>

      {/* Target Marker */}
      {isTargeted && (
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute -inset-8 border-2 border-dashed border-red-500/40 rounded-full"
        />
      )}

      <img 
        src={AssetService.getSpriteUrl(enemy.sprite_id || "abbys_sprite_001")}
        className={`w-40 h-40 object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,1)] scale-x-[-1] transition-all duration-300 ${isTargeted ? 'brightness-125 saturate-150' : 'brightness-90 saturate-50'}`}
        style={{ imageRendering: 'pixelated' }}
      />
    </motion.div>
  );
}

function PlayerSprite({ unit, isActive }: { unit: CombatUnit, isActive: boolean }) {
  return (
    <motion.div 
      animate={{ 
        y: isActive ? [0, -12, 0] : 0,
        scale: isActive ? 1.2 : 1,
        opacity: unit.isDead ? 0.3 : 1
      }}
      transition={isActive ? { repeat: Infinity, duration: 1.5 } : {}}
      className="relative"
    >
      {/* Magic Pedestal for active unit */}
      {isActive && (
        <motion.div 
          animate={{ rotate: 360, opacity: [0.2, 0.5, 0.2] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
          className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-24 h-8 border border-cyan-500/30 rounded-[100%] bg-cyan-500/10 blur-[2px] z-0"
        />
      )}
      
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-5 bg-black/60 rounded-[100%] blur-md z-0" />
      
      <img 
        src={AssetService.getSpriteUrl(unit.sprite_id || AssetService.getJobSpriteId('novice'))}
        className={`w-28 h-28 object-contain transform origin-bottom drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)] z-10 transition-all ${isActive ? 'brightness-125' : 'brightness-100'}`}
        style={{ imageRendering: 'pixelated' }}
      />
    </motion.div>
  );
}

function UnitCard({ unit, isActive }: { unit: CombatUnit, isActive: boolean }) {
  return (
    <motion.div 
      animate={{ 
        borderColor: isActive ? '#F5C76B' : 'rgba(255,255,255,0.1)',
        backgroundColor: isActive ? 'rgba(245,199,107,0.15)' : 'rgba(11,26,42,0.4)',
        y: isActive ? -8 : 0,
        boxShadow: isActive ? '0 10px 30px rgba(245,199,107,0.2)' : '0 4px 10px rgba(0,0,0,0.3)'
      }}
      className="relative flex flex-col p-2.5 rounded-2xl border-[1.5px] backdrop-blur-xl overflow-hidden aspect-[3.5/5] transition-shadow group"
    >
      {/* Glossy Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      
      {/* Unit Level & Element */}
      <div className="flex justify-between items-start relative z-10 mb-1">
        <div className="w-5 h-5 rounded-lg bg-[#F5C76B]/20 border border-[#F5C76B]/40 flex items-center justify-center">
           <span className="text-[7px] font-black text-[#F5C76B]">LV.1</span>
        </div>
        <div className="flex flex-col items-end">
           <div className="flex gap-0.5">
              {[1, 2, 3, 4].map(i => <StarIcon key={i} size={6} className="text-yellow-400 fill-current" />)}
           </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative z-10 py-1">
         <span className="text-[9px] font-black text-white uppercase tracking-wider text-center drop-shadow-md leading-tight">{unit.name}</span>
         <span className="text-[6px] font-bold text-white/30 uppercase tracking-[0.2em] mt-0.5">{unit.jobId || 'Novice'}</span>
      </div>

      <div className="space-y-1.5 relative z-10 mt-auto">
        <div className="flex justify-between items-end px-0.5">
           <span className="text-[6px] font-black text-white/40 uppercase">HP</span>
           <span className="text-[7px] font-mono font-bold text-white/90">{unit.currentHp}</span>
        </div>
        <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-white/5 shadow-inner">
          <motion.div 
            animate={{ width: `${(unit.currentHp / unit.maxHp) * 100}%` }}
            className={`h-full ${unit.currentHp < unit.maxHp * 0.3 ? 'bg-red-500' : 'bg-gradient-to-r from-emerald-600 to-green-400'}`}
          />
        </div>
        <div className="w-full h-1 bg-black/40 rounded-full overflow-hidden">
          <motion.div 
            animate={{ width: `${unit.burst}%` }} 
            className={`h-full ${unit.burst >= 100 ? 'bg-cyan-300 shadow-[0_0_8px_rgba(103,232,249,0.8)]' : 'bg-cyan-600'}`} 
          />
        </div>
      </div>

      {/* Background Icon Watermark */}
      <div className="absolute bottom-[-10%] right-[-10%] opacity-5 rotate-12 pointer-events-none">
         <Activity size={60} />
      </div>
    </motion.div>
  );
}

function SkillButton({ skill, onUse, cooldown }: { skill: SkillDefinition, onUse: () => void, cooldown?: number }) {
  const getIcon = () => {
    const id = skill.id.toLowerCase();
    if (id.includes('heal') || id.includes('aid')) return <Heart size={24} className="text-pink-400" />;
    if (id.includes('fire') || id.includes('meteor')) return <Zap size={24} className="text-orange-500" />;
    if (id.includes('bash') || id.includes('strike')) return <Swords size={24} className="text-red-400" />;
    return <Zap size={24} className="text-cyan-400" />;
  };

  return (
    <motion.button 
      whileHover={!cooldown ? { scale: 1.1, y: -5 } : {}}
      whileTap={!cooldown ? { scale: 0.9 } : {}}
      onClick={onUse}
      disabled={!!cooldown}
      className={`relative w-14 h-14 rounded-2xl border-2 transition-all flex items-center justify-center overflow-hidden shadow-xl ${
        cooldown 
          ? 'bg-black/60 border-white/5 opacity-50 grayscale' 
          : 'bg-[#152336] border-white/10 hover:border-[#F5C76B] hover:shadow-[0_0_20px_rgba(245,199,107,0.3)]'
      }`}
    >
      {getIcon()}
      
      {/* Skill Name Overlay on Hover */}
      <div className="absolute inset-x-0 bottom-0 bg-black/80 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
         <span className="text-[6px] font-black text-white uppercase text-center block tracking-tighter">{skill.name}</span>
      </div>

      {cooldown && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
           <span className="text-[12px] font-black text-[#F5C76B] leading-none">{cooldown}</span>
           <span className="text-[6px] font-black text-[#F5C76B]/60 uppercase tracking-tighter">Turnos</span>
        </div>
      )}
      
      {!cooldown && (
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_0%,rgba(255,255,255,0.05)_50%,transparent_100%)] animate-shimmer" />
      )}
    </motion.button>
  );
}

function LoadingScreen() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#020508] gap-4">
      <Swords size={48} className="text-[#F5C76B] animate-bounce" />
      <p className="text-[10px] font-black text-white/40 tracking-[0.5em] uppercase">Preparando escenario...</p>
    </div>
  );
}

function ErrorScreen({ error, onBack }: { error: string, onBack: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#020508] p-8 text-center gap-6">
      <AlertTriangle size={40} className="text-amber-400" />
      <h2 className="text-white font-black uppercase tracking-widest text-lg italic">Incompatibilidad de Batallón</h2>
      <p className="text-white/40 text-[10px] uppercase tracking-wider leading-relaxed">{error}</p>
      <button onClick={onBack} className="px-8 py-3 bg-white/5 border border-white/10 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest">Regresar</button>
    </div>
  );
}

function BattleResult({ winner, completionData, isRecording, onConfirm }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="fixed inset-0 z-[100] bg-[#050A0F]/95 backdrop-blur-3xl flex flex-col items-center justify-center p-8 text-center overflow-hidden"
    >
      {/* Background Glow */}
      <div className={`absolute w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 ${winner === 'player' ? 'bg-yellow-500' : 'bg-red-900'}`} />
      
      <motion.div 
        initial={{ scale: 0.5, rotate: -15, opacity: 0 }} 
        animate={{ scale: 1, rotate: 0, opacity: 1 }} 
        transition={{ type: 'spring', damping: 12, stiffness: 100 }}
        className="relative mb-8"
      >
        <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full scale-150 animate-pulse" />
        <Award size={100} className={winner === 'player' ? 'text-[#F5C76B] relative drop-shadow-[0_0_30px_rgba(245,199,107,0.8)]' : 'text-red-500 relative'} />
      </motion.div>

      <motion.h2 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-5xl font-black text-white tracking-[0.3em] uppercase italic drop-shadow-2xl"
      >
        {winner === 'player' ? 'Victory' : 'Defeated'}
      </motion.h2>

      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: 200 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="h-1 bg-gradient-to-r from-transparent via-[#F5C76B] to-transparent mt-4 mb-8"
      />

      {winner === 'player' && completionData && (
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.8 }}
          className="flex flex-col items-center gap-8 w-full max-w-sm"
        >
          <div className="flex gap-6">
            {[1, 2, 3].map(s => (
              <motion.div
                key={s}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1 + (s * 0.2), type: 'spring' }}
              >
                <StarIcon size={48} className={s <= (completionData.stars || 0) ? 'text-[#F5C76B] fill-current drop-shadow-[0_0_15px_rgba(245,199,107,0.5)]' : 'text-white/5'} />
              </motion.div>
            ))}
          </div>

          <div className="w-full bg-white/5 border border-white/10 rounded-[2.5rem] p-8 backdrop-blur-md relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
            <div className="flex items-center justify-center gap-3 mb-6 text-[#F5C76B]">
               <div className="h-px w-8 bg-[#F5C76B]/40" />
               <Gift size={18} />
               <span className="text-[10px] font-black uppercase tracking-[0.4em]">Rewards</span>
               <div className="h-px w-8 bg-[#F5C76B]/40" />
            </div>
            
            <div className="flex justify-center gap-6">
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-3xl bg-black/40 border border-white/10 flex items-center justify-center shadow-2xl group-hover:border-[#F5C76B]/40 transition-colors">
                   <div className="w-8 h-8 rounded-full bg-yellow-500/20 border border-yellow-500/50 flex items-center justify-center">
                      <span className="text-yellow-500 font-bold text-xs">Z</span>
                   </div>
                </div>
                <span className="text-sm font-black text-white">+{completionData.rewards.currency}</span>
                <span className="text-[7px] font-black text-white/30 uppercase tracking-widest">Zeny</span>
              </div>

              {completionData.rewards.premium_currency > 0 && (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-3xl bg-black/40 border border-[#F5C76B]/20 flex items-center justify-center shadow-2xl group-hover:border-[#F5C76B]/60 transition-colors">
                     <StarIcon size={24} className="text-[#F5C76B] fill-current" />
                  </div>
                  <span className="text-sm font-black text-[#F5C76B]">+{completionData.rewards.premium_currency}</span>
                  <span className="text-[7px] font-black text-[#F5C76B]/40 uppercase tracking-widest">Gems</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      <div className="absolute bottom-12 flex flex-col items-center gap-6">
        {isRecording && (
          <motion.div 
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="flex items-center gap-2"
          >
             <Terminal size={12} className="text-[#F5C76B]" />
             <span className="text-[9px] font-black text-[#F5C76B] uppercase tracking-[0.5em]">Synchronizing Records</span>
          </motion.div>
        )}
        
        <motion.button 
          whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(255,255,255,0.1)' }}
          whileTap={{ scale: 0.95 }}
          onClick={onConfirm} 
          className="bg-white text-black font-black py-4 px-20 rounded-full tracking-[0.3em] uppercase text-[10px] shadow-2xl hover:bg-[#F5C76B] transition-colors"
        >
          Continue Expedition
        </motion.button>
      </div>
    </motion.div>
  );
}
