'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Sword, Trophy, Users, Crown, Star } from 'lucide-react';
import { AssetService } from '@/lib/services/asset-service';
import { supabase } from '@/lib/supabase';

interface ArenaViewProps {
  onBack: () => void;
  playerPower?: number;
}

interface LeaderboardEntry {
  rank: number;
  username: string;
  power: number;
  wins: number;
  rank_tier: string;
}

export function ArenaView({ onBack, playerPower = 5000 }: ArenaViewProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOpponent, setSelectedOpponent] = useState<LeaderboardEntry | null>(null);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    setIsLoading(true);
    // Mock data for now - in production would fetch from leaderboard table
    const mockLeaderboard: LeaderboardEntry[] = [
      { rank: 1, username: 'DragonSlayer', power: 15420, wins: 156, rank_tier: 'diamond' },
      { rank: 2, username: 'ShadowKnight', power: 14200, wins: 134, rank_tier: 'diamond' },
      { rank: 3, username: 'MysticMage', power: 12800, wins: 112, rank_tier: 'platinum' },
      { rank: 4, username: 'ThunderBolt', power: 11500, wins: 98, rank_tier: 'platinum' },
      { rank: 5, username: 'IronFist', power: 10200, wins: 87, rank_tier: 'gold' },
      { rank: 6, username: 'NightRaven', power: 9500, wins: 76, rank_tier: 'gold' },
      { rank: 7, username: 'BlazeMaster', power: 8200, wins: 65, rank_tier: 'silver' },
      { rank: 8, username: 'FrostWarrior', power: 7800, wins: 54, rank_tier: 'silver' },
      { rank: 9, username: 'WindRunner', power: 6500, wins: 43, rank_tier: 'bronze' },
      { rank: 10, username: 'StarKnight', power: 5500, wins: 32, rank_tier: 'bronze' },
    ];
    setLeaderboard(mockLeaderboard);
    setIsLoading(false);
  };

  const getRankColor = (tier: string) => {
    switch (tier) {
      case 'diamond': return 'from-cyan-400 to-blue-500';
      case 'platinum': return 'from-purple-400 to-pink-500';
      case 'gold': return 'from-yellow-400 to-orange-500';
      case 'silver': return 'from-gray-300 to-gray-400';
      case 'bronze': return 'from-amber-600 to-amber-700';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '👑';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  return (
    <div 
      className="w-full h-full flex flex-col relative bg-[#0B1A2A] bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{ backgroundImage: `url('${AssetService.getBgUrl('battle')}')` }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#0B1A2A]/80 via-[#0B1A2A]/60 to-[#020508]/95 pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="p-3 bg-black/40 backdrop-blur-md rounded-xl border border-white/10"
        >
          <ChevronLeft className="text-white" size={24} />
        </motion.button>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-red-500/30 to-orange-500/30 rounded-xl border border-red-500/40">
            <Sword className="text-red-400" size={24} />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg">Arena PvP</h1>
            <p className="text-white/40 text-xs">¡Combate contra otros jugadores!</p>
          </div>
        </div>

        <div className="w-12" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 overflow-y-auto px-6 py-4">
        {/* Player Stats Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-500/30"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                <span className="text-2xl">⚔️</span>
              </div>
              <div>
                <div className="text-white font-bold">Tu Poder</div>
                <div className="text-purple-300 text-sm font-bold">{playerPower.toLocaleString()}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white/40 text-xs">División</div>
              <div className="text-yellow-400 font-bold">Silver III</div>
            </div>
          </div>
          
          <button className="w-full py-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl font-bold text-white">
            🔥 Buscar Combate
          </button>
        </motion.div>

        {/* Leaderboard */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="text-yellow-400" size={20} />
            <span className="text-white font-bold">Clasificación</span>
          </div>
        </div>

        <div className="space-y-2">
          {leaderboard.map((entry, index) => (
            <motion.div
              key={entry.rank}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setSelectedOpponent(entry)}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                selectedOpponent?.rank === entry.rank
                  ? 'bg-white/10 border-purple-500/50'
                  : 'bg-black/20 border-white/5 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-gradient-to-br ${getRankColor(entry.rank_tier)}`}>
                    {getRankIcon(entry.rank)}
                  </div>
                  <div>
                    <div className="text-white font-medium">{entry.username}</div>
                    <div className="text-white/40 text-xs">{entry.power.toLocaleString()} poder</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white/60 text-sm">{entry.wins} victorias</div>
                  <div className={`text-xs font-bold ${
                    entry.rank_tier === 'diamond' ? 'text-cyan-400' :
                    entry.rank_tier === 'platinum' ? 'text-purple-400' :
                    entry.rank_tier === 'gold' ? 'text-yellow-400' :
                    'text-white/40'
                  }`}>
                    {entry.rank_tier.toUpperCase()}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20"
        >
          <div className="text-blue-300 text-sm font-medium mb-2">💡 ¿Cómo funciona?</div>
          <ul className="text-white/60 text-xs space-y-1">
            <li>• Combates en tiempo real contra otros jugadores</li>
            <li>• Gana rank subir de división (Bronze → Silver → Gold → Platinum → Diamond)</li>
            <li>• Recompensas exclusivas de PvP cada semana</li>
            <li>• Temporada dura 4 semanas</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}