'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Users, Crown, Shield, Sword, Gift, MessageCircle } from 'lucide-react';
import { AssetService } from '@/lib/services/asset-service';
import { supabase } from '@/lib/supabase';

interface GuildViewProps {
  onBack: () => void;
}

interface GuildMember {
  id: string;
  name: string;
  role: 'leader' | 'officer' | 'member';
  contribution: number;
  power: number;
}

interface GuildData {
  name: string;
  level: number;
  members: number;
  maxMembers: number;
  totalPower: number;
  rank: number;
}

export function GuildView({ onBack }: GuildViewProps) {
  const [guild, setGuild] = useState<GuildData | null>(null);
  const [members, setMembers] = useState<GuildMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'members' | 'shop' | 'chat'>('members');

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'leader': return 'text-yellow-400';
      case 'officer': return 'text-purple-400';
      default: return 'text-white/60';
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'leader': return '👑';
      case 'officer': return '⭐';
      default: return '';
    }
  };

  const loadGuildData = async () => {
    setIsLoading(true);
    // Mock data - would fetch from guild table in production
    setGuild({
      name: 'Knight Alliance',
      level: 15,
      members: 28,
      maxMembers: 50,
      totalPower: 125000,
      rank: 42
    });

    setMembers([
      { id: '1', name: 'DragonKing', role: 'leader', contribution: 15000, power: 15000 },
      { id: '2', name: 'ShadowKnight', role: 'officer', contribution: 12000, power: 14000 },
      { id: '3', name: 'MysticMage', role: 'officer', contribution: 10000, power: 12000 },
      { id: '4', name: 'ThunderBolt', role: 'member', contribution: 8000, power: 10000 },
      { id: '5', name: 'IronFist', role: 'member', contribution: 7500, power: 9500 },
      { id: '6', name: 'NightRaven', role: 'member', contribution: 6000, power: 8000 },
    ]);
    setIsLoading(false);
  };

  useEffect(() => {
    loadGuildData();
  }, []);

  return (
    <div 
      className="w-full h-full flex flex-col relative bg-[#0B1A2A] bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{ backgroundImage: `url('${AssetService.getBgUrl('home')}')` }}
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
          <div className="p-3 bg-gradient-to-br from-indigo-500/30 to-purple-500/30 rounded-xl border border-indigo-500/40">
            <Users className="text-indigo-400" size={24} />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg">Gremio</h1>
            <p className="text-white/40 text-xs">¡Coordina con tu equipo!</p>
          </div>
        </div>

        <div className="w-12" />
      </div>

      {/* Guild Info Card */}
      {guild && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 mx-6 mb-4 p-4 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl border border-indigo-500/30"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl">
                🏰
              </div>
              <div>
                <div className="text-white font-bold text-lg">{guild.name}</div>
                <div className="text-indigo-300 text-sm">Nivel {guild.level}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white/40 text-xs">Ranking</div>
              <div className="text-yellow-400 font-black text-xl">#{guild.rank}</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-white font-bold">{guild.members}/{guild.maxMembers}</div>
              <div className="text-white/40 text-xs">Miembros</div>
            </div>
            <div>
              <div className="text-purple-400 font-bold">{(guild.totalPower / 1000).toFixed(1)}K</div>
              <div className="text-white/40 text-xs">Poder Total</div>
            </div>
            <div>
              <div className="text-green-400 font-bold">+500/d</div>
              <div className="text-white/40 text-xs">Contribución</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="relative z-10 flex gap-2 px-6 mb-4">
        {[
          { id: 'members', icon: Users, label: 'Miembros' },
          { id: 'shop', icon: Gift, label: 'Tienda' },
          { id: 'chat', icon: MessageCircle, label: 'Chat' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 ${
              activeTab === tab.id
                ? 'bg-indigo-500/30 text-white border border-indigo-500/50'
                : 'bg-black/30 text-white/40 border border-white/5'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 overflow-y-auto px-6 pb-6">
        {activeTab === 'members' && (
          <div className="space-y-2">
            {members.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-3 bg-black/20 rounded-xl border border-white/5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-white font-medium flex items-center gap-1">
                        {getRoleBadge(member.role)} {member.name}
                      </div>
                      <div className={`text-xs ${getRoleColor(member.role)}`}>
                        {member.role === 'leader' ? 'Líder' : member.role === 'officer' ? 'Oficial' : 'Miembro'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white/60 text-xs">{member.power.toLocaleString()} poder</div>
                    <div className="text-indigo-400 text-xs">{member.contribution.toLocaleString()} pts</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'shop' && (
          <div className="text-center py-8">
            <Gift className="mx-auto text-white/30 mb-4" size={48} />
            <div className="text-white/60">Tienda de gremio</div>
            <div className="text-white/30 text-sm">Próximamente</div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="text-center py-8">
            <MessageCircle className="mx-auto text-white/30 mb-4" size={48} />
            <div className="text-white/60">Chat de gremio</div>
            <div className="text-white/30 text-sm">Próximamente</div>
          </div>
        )}

        {/* Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20"
        >
          <div className="text-indigo-300 text-sm font-medium mb-2">🎮 Beneficios del Gremio</div>
          <ul className="text-white/60 text-xs space-y-1">
            <li>• Comparte recursos y estrategias</li>
            <li>• Participa en guerras de gremios</li>
            <li>• Desbloquea habilidades exclusivas</li>
            <li>• Obtén bonificaciones de producción</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}