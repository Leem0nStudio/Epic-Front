'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Zap, Shield, Sword, Crown, Clock, Flame } from 'lucide-react';
import { AssetService } from '@/lib/services/asset-service';
import { Button } from '@/components/ui/Button';

interface TowerViewProps {
  onBack: () => void;
  playerPower?: number;
}

interface TowerFloor {
  floor: number;
  enemyPower: number;
  isUnlocked: boolean;
  isCompleted: boolean;
  bestTime?: number;
  stars: number;
}

export function TowerView({ onBack, playerPower = 5000 }: TowerViewProps) {
  const [currentFloor, setCurrentFloor] = useState(1);
  const [isInCombat, setIsInCombat] = useState(false);

  // Generate tower floors
  const floors: TowerFloor[] = Array.from({ length: 50 }, (_, i) => ({
    floor: i + 1,
    enemyPower: Math.floor(100 + (i * 50) + (i * i * 2)),
    isUnlocked: i < 5 || i < currentFloor,
    isCompleted: i < currentFloor - 1,
    bestTime: undefined,
    stars: i < currentFloor - 1 ? 3 : 0
  }));

  const startFloor = (floor: number) => {
    if (!floors[floor - 1].isUnlocked) return;
    setCurrentFloor(floor);
    setIsInCombat(true);
  };

  if (isInCombat) {
    return (
      <div 
        className="w-full h-full flex flex-col relative bg-[#0B1A2A] bg-cover bg-center bg-no-repeat overflow-hidden"
        style={{ backgroundImage: `url('${AssetService.getBgUrl('battle')}')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B1A2A]/90 to-[#020508]/95" />
        
        <div className="relative z-10 flex flex-col items-center justify-center h-full p-6">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🏰</div>
            <h2 className="text-3xl font-black text-white mb-2">Piso {currentFloor}</h2>
            <p className="text-white/60">Enemigo: Piso {currentFloor}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8 w-full max-w-md">
            <div className="p-4 bg-red-500/20 rounded-xl border border-red-500/40 text-center">
              <Sword className="text-red-400 mx-auto mb-2" size={24} />
              <div className="text-white font-bold">Enemigo</div>
              <div className="text-red-300">{floors[currentFloor - 1].enemyPower} poder</div>
            </div>
            <div className="p-4 bg-blue-500/20 rounded-xl border border-blue-500/40 text-center">
              <Shield className="text-blue-400 mx-auto mb-2" size={24} />
              <div className="text-white font-bold">Tu Poder</div>
              <div className="text-blue-300">{playerPower}</div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button 
              variant="secondary" 
              onClick={() => setIsInCombat(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={() => {
                // In real implementation, this would start combat
                setIsInCombat(false);
                if (currentFloor === floors.length) {
                  setCurrentFloor(1);
                } else {
                  setCurrentFloor(prev => prev + 1);
                }
              }}
            >
              ⚔️ Iniciar Combate
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="w-full h-full flex flex-col relative bg-[#0B1A2A] bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{ backgroundImage: `url('${AssetService.getBgUrl('campaign')}')` }}
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
          <div className="p-3 bg-gradient-to-br from-amber-500/30 to-yellow-500/30 rounded-xl border border-amber-500/40">
            <Crown className="text-amber-400" size={24} />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg">Torre Infinita</h1>
            <p className="text-white/40 text-xs">50 pisos de desafío</p>
          </div>
        </div>

        <div className="w-12" />
      </div>

      {/* Stats Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 mx-6 mb-4 p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-500/30"
      >
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-amber-400 text-2xl font-black">{currentFloor - 1}</div>
            <div className="text-white/40 text-xs">Pisos</div>
          </div>
          <div>
            <div className="text-purple-400 text-2xl font-black">
              {floors.reduce((acc, f) => acc + (f.isCompleted ? f.stars : 0), 0)}
            </div>
            <div className="text-white/40 text-xs">Estrellas</div>
          </div>
          <div>
            <div className="text-cyan-400 text-2xl font-black">
              {Math.max(0, playerPower - floors[currentFloor - 1]?.enemyPower || 0)}
            </div>
            <div className="text-white/40 text-xs">Poder Actual</div>
          </div>
        </div>
      </motion.div>

      {/* Floor Selector */}
      <div className="relative z-10 flex-1 overflow-y-auto px-6">
        <div className="grid grid-cols-5 gap-2 pb-4">
          {floors.slice(0, 25).map((floor) => (
            <motion.button
              key={floor.floor}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => startFloor(floor.floor)}
              disabled={!floor.isUnlocked}
              className={`
                aspect-square rounded-lg font-bold text-sm flex flex-col items-center justify-center
                ${!floor.isUnlocked 
                  ? 'bg-black/30 border border-white/5 text-white/20 cursor-not-allowed'
                  : floor.isCompleted
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white border-2 border-green-400'
                    : 'bg-gradient-to-br from-amber-500 to-orange-600 text-white border-2 border-amber-400'
                }
              `}
            >
              <span>{floor.floor}</span>
              {floor.isCompleted && <span className="text-xs">⭐</span>}
            </motion.button>
          ))}
        </div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 p-4 bg-orange-500/10 rounded-xl border border-orange-500/20"
        >
          <div className="text-orange-300 text-sm font-medium mb-2">🔥 ¿Cómo funciona?</div>
          <ul className="text-white/60 text-xs space-y-1">
            <li>• Cada piso tiene enemigos más fuertes que el anterior</li>
            <li>• Derrota al jefe de cada 5 pisos para avanzar</li>
            <li>• Sin límite de energía (solo tu skill)</li>
            <li>• Recompensas especiales cada 10 pisos</li>
            <li>• ¡La torre se reinicia cada semana!</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}