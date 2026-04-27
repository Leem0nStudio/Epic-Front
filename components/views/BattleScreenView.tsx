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
  const [damageNumbers, setDamageNumbers] = useState<{ id: number, value: number, x: number, y: number, color: string }[]>([]);

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

  const addDamageNumber = (value: number, unitId: string, color: string = 'text-white') => {
    const id = Date.now() + Math.random();
    setDamageNumbers(prev => [...prev, { id, value, x: Math.random() * 40 - 20, y: -40, color }]);
    setTimeout(() => setDamageNumbers(prev => prev.filter(d => d.id !== id)), 1000);
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
    <div className="flex flex-col h-full bg-[#050A0F] overflow-hidden relative font-sans text-white select-none">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-cover bg-center animate-slow-zoom opacity-40 blur-[1px]" style={{ backgroundImage: "url('/assets/backgrounds/battle_scenic.png')" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050A0F] via-transparent to-[#050A0F]" />
      </div>

      {/* TOP: Boss HP Bar & Elements */}
      <div className="relative z-20 px-6 pt-10 pb-4">
        <div className="flex justify-between items-center mb-2 px-1">
          <button onClick={onBack} className="text-white/40 hover:text-white transition-colors"><ChevronLeft size={20} /></button>
          <div className="flex flex-col items-center">
             <span className="text-[10px] font-black tracking-[0.4em] text-[#F5C76B] uppercase italic">STAGE {stageId?.replace('stage_', '').replace('_', '-')}</span>
             <span className="text-[8px] text-white/40 font-mono tracking-widest uppercase">TURNO {round}</span>
          </div>
          <Activity size={18} className="text-white/40" />
        </div>

        <div className="relative h-6 bg-black/60 rounded-full border-2 border-[#F5C76B]/30 overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          <motion.div 
            initial={{ width: '100%' }}
            animate={{ width: `${(totalEnemyHp / maxEnemyHp) * 100}%` }}
            className="h-full bg-gradient-to-r from-red-600 to-orange-400 shadow-[inset_0_0_10px_rgba(255,255,255,0.3)]"
          />
          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black tracking-widest drop-shadow-md">
            {totalEnemyHp} / {maxEnemyHp}
          </div>
        </div>

        {/* Elemental Orbs Row */}
        <div className="flex justify-center gap-4 mt-3">
          {['#4ade80', '#60a5fa', '#f87171', '#fbbf24', '#c084fc'].map((color, i) => (
            <div key={i} className="w-4 h-4 rounded-full border border-white/20 shadow-[0_0_10px_rgba(0,0,0,0.5)]" style={{ backgroundColor: color }} />
          ))}
        </div>
      </div>

      {/* FIELD: Battle View Area */}
      <div className="flex-1 relative z-10 px-4 pt-4 overflow-visible">
        {/* Enemies */}
        <div className="flex justify-center gap-8 mt-4">
          {enemyUnits.map((enemy) => (
            <EnemySprite key={enemy.id} enemy={enemy} isTargeted={targetId === enemy.id} onTarget={() => setTargetId(enemy.id)} />
          ))}
        </div>

        {/* Player Sprites on Field */}
        <div className="absolute bottom-10 left-4 right-4 flex justify-between items-end px-4">
          {playerUnits.map((unit) => (
            <PlayerSprite key={unit.id} unit={unit} isActive={unit.id === activeUnitId} />
          ))}
        </div>

        {/* Damage Numbers Container */}
        <AnimatePresence>
          {damageNumbers.map(d => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 0, scale: 0.5 }}
              animate={{ opacity: 1, y: -100, scale: 1.5 }}
              exit={{ opacity: 0 }}
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-black text-2xl italic drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] z-[100] pointer-events-none ${d.color}`}
              style={{ marginLeft: d.x }}
            >
              {d.value}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* BOTTOM: Unit Cards & Skill Bar */}
      <div className="relative z-30 pb-6 px-4 flex flex-col gap-4">
        {/* Unit Cards Grid */}
        <div className="grid grid-cols-4 gap-2">
          {playerUnits.map((unit) => (
            <UnitCard key={unit.id} unit={unit} isActive={unit.id === activeUnitId} />
          ))}
        </div>

        {/* Skill Selection Bar */}
        <div className="flex items-center gap-3 bg-black/60 backdrop-blur-xl p-3 rounded-[2rem] border border-white/10 shadow-2xl relative">
          <div className="flex-1 flex gap-2">
            {currentActor?.side === 'player' && currentActor.skills.map(skill => (
              <SkillButton 
                key={skill.id} 
                skill={skill} 
                onUse={() => runTurn(currentActor, skill, targetId || undefined)} 
                cooldown={currentActor.cooldowns[skill.id]}
              />
            ))}
          </div>
          <button className="w-16 h-16 rounded-full bg-gradient-to-tr from-orange-600 via-yellow-500 to-white p-0.5 shadow-[0_0_20px_rgba(245,199,107,0.4)] group active:scale-95 transition-transform">
             <div className="w-full h-full bg-[#0B1A2A] rounded-full flex flex-col items-center justify-center border-2 border-white/20">
                <span className="text-[8px] font-black text-white/40 uppercase leading-none">Burst</span>
                <span className="text-[10px] font-black text-[#F5C76B] uppercase leading-none">ULTI</span>
             </div>
          </button>
        </div>
      </div>

      {/* Victory/Defeat Overlay */}
      <AnimatePresence>
        {isBattleOver && <BattleResult winner={winner} completionData={completionData} isRecording={isRecordingResult} onConfirm={() => { onRefresh(); onBack(); }} />}
      </AnimatePresence>
    </div>
  );
}

function EnemySprite({ enemy, isTargeted, onTarget }: { enemy: CombatUnit, isTargeted: boolean, onTarget: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0, scale: isTargeted ? 1.1 : 1 }}
      onClick={onTarget}
      className="relative cursor-pointer"
    >
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-16">
        <div className="h-1 bg-black/40 rounded-full overflow-hidden border border-white/5">
           <div className="h-full bg-red-500" style={{ width: `${(enemy.currentHp / enemy.maxHp) * 100}%` }} />
        </div>
      </div>
      <img 
        src={AssetService.getSpriteUrl(enemy.sprite_id || "abbys_sprite_001")}
        className={`w-32 h-32 object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)] scale-x-[-1] transition-all ${isTargeted ? 'brightness-125' : 'brightness-90'}`}
        style={{ imageRendering: 'pixelated' }}
      />
    </motion.div>
  );
}

function PlayerSprite({ unit, isActive }: { unit: CombatUnit, isActive: boolean }) {
  return (
    <motion.div 
      animate={{ 
        y: isActive ? [0, -10, 0] : 0,
        scale: isActive ? 1.1 : 1,
        opacity: unit.isDead ? 0.3 : 1
      }}
      transition={isActive ? { repeat: Infinity, duration: 2 } : {}}
      className="relative"
    >
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-4 bg-black/40 rounded-[100%] blur-md" />
      <img 
        src={AssetService.getSpriteUrl(unit.sprite_id || "novice_f.png")}
        className="w-24 h-24 object-contain transform origin-bottom drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
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
        backgroundColor: isActive ? 'rgba(245,199,107,0.15)' : 'rgba(0,0,0,0.4)',
        y: isActive ? -4 : 0
      }}
      className="relative flex flex-col p-2 rounded-2xl border-2 backdrop-blur-md overflow-hidden aspect-[3/4]"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
      
      {/* Element Icon Overlay */}
      <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-cyan-500/80 flex items-center justify-center border border-white/20 shadow-lg">
        <StarIcon size={8} className="text-white fill-current" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-end pb-1">
         <span className="text-[8px] font-black text-white uppercase tracking-tighter truncate w-full text-center leading-none mb-1">{unit.name}</span>
         <div className="flex gap-0.5 mb-1">
            {[1, 2, 3, 4, 5].map(i => <StarIcon key={i} size={6} className="text-yellow-400 fill-current" />)}
         </div>
      </div>

      <div className="space-y-1">
        <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
          <motion.div 
            animate={{ width: `${(unit.currentHp / unit.maxHp) * 100}%` }}
            className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
          />
        </div>
        <div className="w-full h-1 bg-black/40 rounded-full overflow-hidden">
          <motion.div animate={{ width: `${unit.burst}%` }} className="h-full bg-cyan-500" />
        </div>
      </div>
    </motion.div>
  );
}

function SkillButton({ skill, onUse, cooldown }: { skill: SkillDefinition, onUse: () => void, cooldown?: number }) {
  return (
    <button 
      onClick={onUse}
      disabled={!!cooldown}
      className={`relative w-12 h-12 rounded-2xl border-2 transition-all flex items-center justify-center overflow-hidden ${cooldown ? 'bg-black/60 border-white/5 opacity-50' : 'bg-black/40 border-white/10 hover:border-[#F5C76B]'}`}
    >
      {skill.id === 'skill_heal' ? <Heart size={20} className="text-pink-400" /> : <Zap size={20} className="text-yellow-400" />}
      {cooldown && <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-[10px] font-black text-[#F5C76B]">{cooldown}</div>}
      {!cooldown && <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent,rgba(255,255,255,0.1),transparent)] animate-shimmer" />}
    </button>
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center p-8 text-center">
      <motion.div initial={{ scale: 0.5, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring' }}>
        <Award size={80} className={winner === 'player' ? 'text-[#F5C76B] drop-shadow-[0_0_30px_rgba(245,199,107,0.4)]' : 'text-red-500'} />
      </motion.div>
      <h2 className="text-4xl font-black text-white tracking-[0.4em] uppercase italic mt-6">{winner === 'player' ? 'Victoria' : 'Derrota'}</h2>

      {winner === 'player' && completionData && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 flex flex-col items-center gap-6">
          <div className="flex gap-4">
            {[1, 2, 3].map(s => <StarIcon key={s} size={32} className={s <= (completionData.stars || 0) ? 'text-[#F5C76B] fill-current' : 'text-white/10'} />)}
          </div>
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 min-w-[280px]">
            <div className="flex items-center gap-2 mb-4 text-[#F5C76B]"><Gift size={14} /><span className="text-[10px] font-black uppercase tracking-widest">Recompensas Obtenidas</span></div>
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

      {isRecording && <p className="mt-8 text-[10px] font-black text-[#F5C76B] uppercase tracking-[0.4em] animate-pulse">Registrando Hazaña...</p>}
      <button onClick={onConfirm} className="bg-white/5 border border-white/10 text-white font-black py-5 px-16 rounded-3xl tracking-[0.3em] uppercase text-[10px] mt-12">Confirmar y Continuar</button>
    </motion.div>
  );
}
