'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Users, Crown, Shield, Sword, Gift, MessageCircle, ChevronRight, UserPlus, LogOut } from 'lucide-react';
import { ViewShell } from '@/components/ui/ViewShell';
import { Modal } from '@/components/ui/Modal';
import { NineSlicePanel } from '@/components/ui/NineSlicePanel';
import { Button } from '@/components/ui/Button';
import { GuildService, type GuildInfo, type GuildMember } from '@/lib/services/guild-service';
import { useToast } from '@/lib/contexts/ToastContext';
import { gameDebugger } from '@/lib/debug';

interface GuildViewProps {
  onBack: () => void;
}

const ROLE_LABELS: Record<string, string> = {
  leader: 'Líder',
  officer: 'Oficial',
  member: 'Miembro',
};

const ROLE_COLORS: Record<string, string> = {
  leader: 'text-yellow-400',
  officer: 'text-purple-400',
  member: 'text-white/40',
};

export function GuildView({ onBack }: GuildViewProps) {
  const { showToast, confirm: confirmToast } = useToast();
  const [guild, setGuild] = useState<GuildInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [donating, setDonating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [guildName, setGuildName] = useState('');

  const loadGuild = useCallback(async () => {
    try {
      const data = await GuildService.getInfo();
      setGuild(data);
    } catch (e) {
      gameDebugger.error('guild', 'Failed to load guild info', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadGuild(); }, [loadGuild]);

  const handleDonate = async (amount: number) => {
    setDonating(true);
    try {
      await GuildService.donate(amount);
      showToast(`¡Donaste ${amount} Zeny!`, 'success');
      await loadGuild();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error al donar';
      showToast(msg, 'error');
    } finally {
      setDonating(false);
    }
  };

  const handleCreateGuild = async () => {
    if (guildName.length < 3) {
      showToast('El nombre debe tener al menos 3 caracteres', 'error');
      return;
    }
    try {
      await GuildService.create(guildName);
      showToast(`¡Gremio "${guildName}" creado!`, 'success');
      setShowCreateModal(false);
      setGuildName('');
      await loadGuild();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error al crear gremio';
      showToast(msg, 'error');
    }
  };

  const handleLeave = async () => {
    const confirmed = await confirmToast('¿Seguro que quieres salir del gremio?');
    if (!confirmed) return;
    try {
      await GuildService.leave();
      showToast('Saliste del gremio', 'success');
      await loadGuild();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error al salir';
      showToast(msg, 'error');
    }
  };

  // No guild - show create/join screen
  if (!isLoading && guild && !guild.inGuild) {
    return (
      <ViewShell title="GREMIO" subtitle="Alianza de Aventureros" onBack={onBack} background="home">
        <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6">
          <Users size={48} className="text-white/20" />
          <div className="text-center">
            <h3 className="text-lg font-black text-white uppercase font-display">Sin Gremio</h3>
            <p className="text-[10px] text-white/40 mt-1">Únete a un gremio o crea el tuyo</p>
          </div>
          <div className="flex gap-3 w-full max-w-xs">
            <Button variant="primary" className="flex-1" onClick={() => setShowCreateModal(true)}>
              CREAR
            </Button>
            <Button variant="secondary" className="flex-1" disabled>
              UNIRSE
            </Button>
          </div>
        </div>

        {/* Create Guild Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Crear Gremio"
          size="sm"
        >
          <div className="p-6">
            <p className="text-[10px] text-white/40 mb-4">Costo: 500 Cristales</p>
            <input
              type="text"
              value={guildName}
              onChange={e => setGuildName(e.target.value)}
              placeholder="Nombre del gremio"
              maxLength={20}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-black placeholder-white/20 outline-none focus:border-[#F5C76B]/40 mb-4"
            />
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => setShowCreateModal(false)}>CANCELAR</Button>
              <Button variant="primary" className="flex-1" onClick={handleCreateGuild}>CREAR</Button>
            </div>
          </div>
        </Modal>
      </ViewShell>
    );
  }

  return (
    <ViewShell title="GREMIO" subtitle={guild?.name || 'Cargando...'} onBack={onBack} background="home" loading={isLoading}>
      <div className="flex-1 flex flex-col p-4 sm:p-6 space-y-4 overflow-hidden">

        {/* Guild Banner */}
        <NineSlicePanel type="border" variant="fancy" className="p-5 glass-frosted frame-earthstone shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-lg font-black text-white uppercase font-display">{guild?.name}</h3>
              <p className="text-[9px] text-white/40">{guild?.description || 'Sin descripción'}</p>
            </div>
            <div className="text-right">
              <p className="text-[8px] text-white/40 uppercase">NIVEL</p>
              <p className="text-xl font-black text-[#F5C76B] font-display">{guild?.level || 1}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/5 rounded-xl p-2 text-center">
              <p className="text-[8px] text-white/40 uppercase">MIEMBROS</p>
              <p className="text-sm font-black text-white">{guild?.memberCount}/{guild?.maxMembers}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-2 text-center">
              <p className="text-[8px] text-white/40 uppercase">EXP</p>
              <p className="text-sm font-black text-cyan-400">{(guild?.exp || 0).toLocaleString()}</p>
            </div>
          </div>
        </NineSlicePanel>

        {/* Donate Button */}
        <div className="flex gap-2 shrink-0">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => handleDonate(100)}
            disabled={donating}
          >
            <div className="flex items-center gap-2">
              <Gift size={14} />
              <span>DONAR 100</span>
            </div>
          </Button>
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => handleDonate(500)}
            disabled={donating}
          >
            <div className="flex items-center gap-2">
              <Gift size={14} />
              <span>DONAR 500</span>
            </div>
          </Button>
        </div>

        {/* Members List */}
        <div className="flex-1 flex flex-col gap-2 overflow-hidden min-h-0">
          <div className="flex items-center gap-2 px-1 shrink-0">
            <Users size={12} className="text-white/40" />
            <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">MIEMBROS</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
            {(guild?.members || []).map((member) => (
              <NineSlicePanel
                key={member.playerId}
                type="border"
                variant="default"
                className="p-3 flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                  {member.role === 'leader' ? <Crown size={14} className="text-yellow-400" /> : <Shield size={14} className="text-white/40" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-black text-white truncate">{member.username}</p>
                  <p className={`text-[8px] font-black uppercase ${ROLE_COLORS[member.role]}`}>{ROLE_LABELS[member.role]}</p>
                </div>
                <div className="text-right">
                  <p className="text-[8px] text-white/30">CONTRIB.</p>
                  <p className="text-[10px] font-black text-[#F5C76B] tabular-nums">{member.contribution.toLocaleString()}</p>
                </div>
              </NineSlicePanel>
            ))}
          </div>
        </div>

        {/* Leave Button */}
        {guild?.inGuild && (
          <Button variant="ghost" size="sm" className="w-full shrink-0" onClick={handleLeave}>
            <div className="flex items-center justify-center gap-2 text-red-400">
              <LogOut size={14} />
              <span>SALIR DEL GREMIO</span>
            </div>
          </Button>
        )}
      </div>
    </ViewShell>
  );
}
