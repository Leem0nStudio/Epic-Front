import React, { useState } from 'react';
import { ChevronLeft, Sparkles, Diamond, Shield, Sword, Box } from 'lucide-react';
import { GachaService } from '@/lib/services/gacha-service';
import { motion, AnimatePresence } from 'motion/react';

interface GachaViewProps {
  profile: any;
  onNavigate: (view: any) => void;
}

export function GachaView({ profile, onNavigate }: GachaViewProps) {
  const [isPulling, setIsPulling] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);

  const handlePull = async (amount: number) => {
    if (profile.premium_currency < amount * 10) return;
    setIsPulling(true);
    setResults(null);

    try {
      const rewards = await GachaService.pull(amount);
      setResults(rewards);
    } catch (e) {
      console.error(e);
      alert("Error al realizar la invocación.");
    } finally {
      setIsPulling(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'text-[#ffaa00] drop-shadow-[0_0_8px_#ffaa00]';
      case 'epic': return 'text-[#cc44ff] drop-shadow-[0_0_8px_#cc44ff]';
      case 'rare': return 'text-[#44aaff]';
      default: return 'text-[#a68a68]';
    }
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
            <button onClick={() => results ? setResults(null) : onNavigate('home')} className="p-2 bg-[#382618] border border-[#5a4227] rounded-full hover:bg-[#4a3423] transition-colors">
            <ChevronLeft size={20} />
            </button>
            <h1 className="text-xl font-serif font-bold text-[#eacf9b] tracking-wider">LA FORJA ARQUETÍPICA</h1>
        </div>
        <div className="flex items-center gap-2 bg-black/40 border border-[#c79a5d] px-3 py-1 rounded-full">
            <Diamond size={14} className="text-[#44aaff]" />
            <span className="text-sm font-mono font-bold text-[#eacf9b]">{profile.premium_currency}</span>
        </div>
      </div>

      {!results ? (
        <div className="flex-1 flex flex-col gap-6 items-center">
            {/* Banner Area */}
            <div className="w-full aspect-[16/9] relative rounded border-2 border-[#c79a5d] overflow-hidden shadow-2xl group">
                <img
                    src="https://raw.githubusercontent.com/Leem0nGames/gameassets/main/file_00000000845370d9e797e88325695078.png"
                    className="w-full h-full object-cover brightness-75 group-hover:scale-105 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4">
                    <h2 className="text-2xl font-serif font-black text-white text-stroke-sm tracking-tighter">COMPONENTES LEGENDARIOS</h2>
                    <p className="text-xs text-[#eacf9b] font-bold tracking-widest opacity-80 uppercase">Aumenta tu potencial de construcción</p>
                </div>
                <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                    <span className="bg-[#b53c22] text-white text-[10px] font-bold px-2 py-0.5 rounded border border-[#ea7a5d] shadow-lg">RATE UP</span>
                </div>
            </div>

            {/* Pity Counter */}
            <div className="w-full grid grid-cols-2 gap-4">
                <div className="bg-[#1a110a] border border-[#382618] p-3 rounded flex flex-col items-center">
                    <span className="text-[10px] text-[#a68a68] font-bold uppercase mb-1">Pity Épico</span>
                    <div className="w-full h-1.5 bg-black rounded-full overflow-hidden border border-[#382618]">
                        <div
                            className="h-full bg-[#cc44ff]"
                            style={{ width: `${(profile.pulls_since_epic / 10) * 100}%` }}
                        ></div>
                    </div>
                    <span className="text-[10px] text-[#cc44ff] font-mono mt-1">{profile.pulls_since_epic}/10</span>
                </div>
                <div className="bg-[#1a110a] border border-[#382618] p-3 rounded flex flex-col items-center">
                    <span className="text-[10px] text-[#a68a68] font-bold uppercase mb-1">Pity Legendario</span>
                    <div className="w-full h-1.5 bg-black rounded-full overflow-hidden border border-[#382618]">
                        <div
                            className="h-full bg-[#ffaa00]"
                            style={{ width: `${(profile.pulls_since_legendary / 80) * 100}%` }}
                        ></div>
                    </div>
                    <span className="text-[10px] text-[#ffaa00] font-mono mt-1">{profile.pulls_since_legendary}/80</span>
                </div>
            </div>

            <div className="flex-1"></div>

            {/* Pull Buttons */}
            <div className="w-full flex gap-4 p-4 mb-2">
                <button
                    disabled={isPulling || profile.premium_currency < 10}
                    onClick={() => handlePull(1)}
                    className="flex-1 bg-gradient-to-b from-[#4a2e1a] to-[#2c1d11] border border-[#5a4227] p-4 rounded-lg shadow-xl active:scale-95 transition-all hover:border-[#c79a5d] disabled:opacity-50 disabled:grayscale"
                >
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-xs font-bold text-[#a68a68]">INVOCACIÓN X1</span>
                        <div className="flex items-center gap-1">
                            <Diamond size={14} className="text-[#44aaff]" />
                            <span className="text-lg font-mono font-bold text-[#eacf9b]">10</span>
                        </div>
                    </div>
                </button>
                <button
                    disabled={isPulling || profile.premium_currency < 100}
                    onClick={() => handlePull(10)}
                    className="flex-1 bg-gradient-to-b from-[#b59d22] to-[#6e580a] border border-[#ead15d] p-4 rounded-lg shadow-xl active:scale-95 transition-all hover:brightness-110 disabled:opacity-50 disabled:grayscale"
                >
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-xs font-bold text-white text-stroke-sm">INVOCACIÓN X10</span>
                        <div className="flex items-center gap-1">
                            <Diamond size={14} className="text-white" />
                            <span className="text-lg font-mono font-bold text-white">100</span>
                        </div>
                    </div>
                </button>
            </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
            <h2 className="text-center text-[#a68a68] font-bold text-sm tracking-widest mb-6">RESULTADOS DE LA FORJA</h2>

            <div className="flex-1 grid grid-cols-2 sm:grid-cols-5 gap-3 p-2 overflow-y-auto">
                <AnimatePresence>
                    {results.map((item, idx) => (
                        <motion.div
                            key={`${item.item_id}-${idx}`}
                            initial={{ opacity: 0, scale: 0.5, rotateY: 180 }}
                            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                            transition={{ delay: idx * 0.1, duration: 0.4 }}
                            className="bg-[#2c1d11] border border-[#5a4227] p-2 rounded flex flex-col items-center gap-2 text-center shadow-lg relative overflow-hidden group"
                        >
                            <div className="w-10 h-10 flex items-center justify-center bg-black/40 rounded-full border border-[#382618]">
                                {item.item_rarity === 'legendary' ? <Sparkles className="text-[#ffaa00]" /> : <Box className="text-[#a68a68]" />}
                            </div>
                            <span className="text-[9px] font-bold text-[#f2e6d5] h-6 flex items-center leading-none overflow-hidden">{item.item_name}</span>
                            <span className={`text-[8px] font-bold uppercase tracking-tighter ${getRarityColor(item.item_rarity)}`}>
                                {item.item_rarity}
                            </span>

                            {/* Flash effect for high rarities */}
                            {(item.item_rarity === 'legendary' || item.item_rarity === 'epic') && (
                                <div className={`absolute inset-0 opacity-10 animate-pulse bg-current ${getRarityColor(item.item_rarity)}`}></div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <button
                onClick={() => setResults(null)}
                className="mt-6 w-full bg-[#382618] border border-[#5a4227] py-4 rounded text-[#eacf9b] font-serif font-bold tracking-[0.2em] active:scale-98 transition-all"
            >
                CONTINUAR
            </button>
        </div>
      )}

      {isPulling && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center gap-6">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="relative"
            >
                <Sparkles size={64} className="text-[#c79a5d] drop-shadow-[0_0_20px_#c79a5d]" />
                <div className="absolute inset-0 animate-ping opacity-50">
                    <Sparkles size={64} className="text-[#c79a5d]" />
                </div>
            </motion.div>
            <h3 className="text-xl font-serif font-bold text-[#eacf9b] tracking-[0.3em] animate-pulse">FORJANDO DESTINO...</h3>
        </div>
      )}
    </div>
  );
}
