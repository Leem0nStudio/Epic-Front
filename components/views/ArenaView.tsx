'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Sword, Trophy, Users, Star, Shield, ChevronRight, Zap } from 'lucide-react';
import { ViewShell } from '@/components/ui/ViewShell';
import { Modal } from '@/components/ui/Modal';
import { NineSlicePanel } from '@/components/ui/NineSlicePanel';
import { Button } from '@/components/ui/Button';
import { ArenaService, type ArenaOpponent, type ArenaRanking, type LeaderboardEntry } from '@/lib/services/arena-service';
import { gameDebugger } from '@/lib/debug';

interface ArenaViewProps {
  onBack: () => void;
  onBattleStart?: (opponentId: string) => void;
}

const RANK_TIER_COLORS: Record<string, string> = {
  bronce: 'text-orange-400',
  plata: 'text-gray-300',
  oro: 'text-yellow-400',
  diamante: 'text-cyan-400',
  leyenda: 'text-purple-400',
};

export function ArenaView({ onBack, onBattleStart }: ArenaViewProps) {
  const [ranking, setRanking] = useState<ArenaRanking | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [opponents, setOpponents] = useState<ArenaOpponent[]>([]);
  const [selectedOpponent, setSelectedOpponent] = useState<ArenaOpponent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [rankData, lbData] = await Promise.all([
        ArenaService.getRanking(),
        ArenaService.getLeaderboard(20),
      ]);
      setRanking(rankData);
      setLeaderboard(lbData);
    } catch (e) {
      gameDebugger.error('combat', 'Failed to load arena data', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleFindOpponents = async () => {
    setIsSearching(true);
    try {
      const data = await ArenaService.findOpponents();
      setOpponents(data);
    } catch (e) {
      gameDebugger.error('combat', 'Failed to find opponents', e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleStartBattle = (opponent: ArenaOpponent) => {
    if (onBattleStart) {
      onBattleStart(opponent.opponentId);
    }
  };

  return (
    <ViewShell
      title="ARENA"
      subtitle="Coliseo de los Héroes"
      onBack={onBack}
      background="battle"
      loading={isLoading}
    >
      <div className="flex-1 flex flex-col p-4 sm:p-6 space-y-4 overflow-hidden">

        {/* Player Ranking Card */}
        <NineSlicePanel type="border" variant="default" className="p-4 glass-frosted frame-earthstone shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <Shield className="text-cyan-400" size={24} />
              </div>
              <div>
                <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">RANGO</p>
                <p className={`text-lg font-black font-stats uppercase ${RANK_TIER_COLORS[ranking?.rankTier || 'bronce']}`}>
                  {ranking?.rankTier || 'BRONCE'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">PUNTOS</p>
              <p className="text-2xl font-black text-white font-display">{ranking?.points || 1000}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/5">
            <div className="text-center">
              <p className="text-[8px] text-white/40 uppercase">VICTORIAS</p>
              <p className="text-sm font-black text-green-400 font-stats">{ranking?.wins || 0}</p>
            </div>
            <div className="text-center">
              <p className="text-[8px] text-white/40 uppercase">DERROTAS</p>
              <p className="text-sm font-black text-red-400 font-stats">{ranking?.losses || 0}</p>
            </div>
            <div className="text-center">
              <p className="text-[8px] text-white/40 uppercase">RACHA</p>
              <p className="text-sm font-black text-[#F5C76B] font-stats">{ranking?.streak || 0}</p>
            </div>
          </div>
        </NineSlicePanel>

        {/* Find Opponents / Opponents List */}
        {opponents.length === 0 ? (
          <Button
            variant="primary"
            onClick={handleFindOpponents}
            disabled={isSearching}
            className="w-full py-5 font-display tracking-widest shrink-0"
          >
            {isSearching ? 'BUSCANDO...' : 'BUSCAR ADVERSARIO'}
          </Button>
        ) : (
          <div className="space-y-2 shrink-0">
            <div className="flex items-center gap-2 px-1">
              <Sword size={12} className="text-[#F5C76B]" />
              <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">ADVERSARIOS DISPONIBLES</span>
            </div>
            {opponents.map((opp) => (
              <NineSlicePanel
                key={opp.opponentId}
                type="border"
                variant="default"
                className="p-3 flex items-center justify-between glass-frosted hover:border-[#F5C76B]/40 cursor-pointer group"
                onClick={() => setSelectedOpponent(opp)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    <Users size={16} className="text-white/40" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white uppercase font-display">{opp.opponentName}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[9px] font-black uppercase ${RANK_TIER_COLORS[opp.opponentRankTier] || 'text-white/40'}`}>
                        {opp.opponentRankTier}
                      </span>
                      <span className="text-[9px] text-white/30">·</span>
                      <span className="text-[9px] text-white/40">{opp.opponentPoints} pts</span>
                    </div>
                  </div>
                </div>
                <ChevronRight size={16} className="text-white/20 group-hover:text-[#F5C76B] transition-colors" />
              </NineSlicePanel>
            ))}
            <Button variant="ghost" size="sm" onClick={() => setOpponents([])} className="w-full text-[10px]">
              BUSCAR OTROS
            </Button>
          </div>
        )}

        {/* Leaderboard */}
        <div className="flex-1 flex flex-col gap-2 overflow-hidden min-h-0">
          <div className="flex items-center gap-2 px-1 shrink-0">
            <Trophy size={12} className="text-[#F5C76B]" />
            <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">CLASIFICACIÓN</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
            {leaderboard.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-[10px] text-white/30">Sin clasificación disponible</p>
              </div>
            ) : (
              leaderboard.map((entry) => (
                <div key={entry.playerId} className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.02]">
                  <span className="w-6 text-center text-[10px] font-black text-white/40">{entry.rankNum}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-black text-white truncate">{entry.playerName}</p>
                  </div>
                  <span className={`text-[9px] font-black uppercase ${RANK_TIER_COLORS[entry.rankTier] || 'text-white/40'}`}>
                    {entry.rankTier}
                  </span>
                  <span className="text-[10px] font-black text-white/60 tabular-nums">{entry.points}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Opponent Detail Modal */}
      <Modal
        isOpen={!!selectedOpponent}
        onClose={() => setSelectedOpponent(null)}
        title={selectedOpponent?.opponentName}
        subtitle={selectedOpponent ? `${selectedOpponent.opponentRankTier} · ${selectedOpponent.opponentPoints} pts` : undefined}
        size="sm"
      >
        <div className="p-6 text-center">
          <Users size={40} className="text-[#F5C76B] mx-auto mb-4" />

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
              <p className="text-[8px] text-white/40 uppercase">VICTORIAS</p>
              <p className="text-lg font-black text-green-400 font-stats">{selectedOpponent?.opponentWins}</p>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
              <p className="text-[8px] text-white/40 uppercase">DERROTAS</p>
              <p className="text-lg font-black text-red-400 font-stats">{selectedOpponent?.opponentLosses}</p>
            </div>
          </div>

          <div className="space-y-3">
            <Button variant="primary" className="w-full" onClick={() => selectedOpponent && handleStartBattle(selectedOpponent)}>
              <div className="flex items-center justify-center gap-2">
                <Zap size={16} />
                INICIAR DUELO
              </div>
            </Button>
            <Button variant="secondary" className="w-full" onClick={() => setSelectedOpponent(null)}>
              CANCELAR
            </Button>
          </div>
        </div>
      </Modal>
    </ViewShell>
  );
}
