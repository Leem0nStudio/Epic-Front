'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { AssetService } from '@/lib/services/asset-service';
import { Mail, Lock, UserPlus, LogIn, ShieldCheck, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/Button';

export function AuthView() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setLoading(true);
    setError(null);

    try {
      if (isRegistering) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        setSuccess(true);
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 w-full max-w-sm relative overflow-hidden bg-[#020508]">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0">
        <img
          src={AssetService.getBgUrl('home')}
          className="w-full h-full object-cover opacity-20 scale-110"
          alt=""
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#020508] via-transparent to-[#020508]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full"
      >
        {/* Logo/Icon */}
        <div className="flex flex-col items-center mb-12">
          <div className="w-20 h-20 rounded-[24px] bg-[#F5C76B] flex items-center justify-center mb-6 shadow-[0_0_40px_#F5C76B44]">
            <ShieldCheck size={40} className="text-[#0B1A2A]" />
          </div>
          <h1 className="text-3xl font-black text-white uppercase font-display tracking-tight leading-none text-center">
            REINO DE<br/><span className="text-[#F5C76B]">ETHERIA</span>
          </h1>
          <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.4em] mt-4">Forja tu destino</p>
        </div>

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#F5C76B]/10 border border-[#F5C76B]/30 rounded-3xl p-8 text-center"
          >
            <div className="w-12 h-12 bg-[#F5C76B] rounded-full flex items-center justify-center mx-auto mb-4">
               <Sparkles size={24} className="text-[#0B1A2A]" />
            </div>
            <h3 className="text-xl font-black text-white uppercase font-display mb-2">¡REGISTRO EXITOSO!</h3>
            <p className="text-xs text-white/60 leading-relaxed">Revisa tu correo electrónico para confirmar tu cuenta y comenzar tu aventura.</p>
            <Button variant="secondary" className="mt-6 w-full" onClick={() => setIsRegistering(false)}>VOLVER AL LOGIN</Button>
          </motion.div>
        ) : (
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Email de Aventurero</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@reino.com"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm placeholder:text-white/10 focus:outline-none focus:border-[#F5C76B]/40 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Firma Secreta</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm placeholder:text-white/10 focus:outline-none focus:border-[#F5C76B]/40 transition-all"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-[10px] text-red-400 font-black uppercase text-center">{error}</p>
              </div>
            )}

            <div className="pt-4 space-y-3">
              <Button
                type="submit"
                variant="primary"
                size="game"
                className="w-full h-16"
                disabled={loading}
              >
                {loading ? 'PROCESANDO...' : isRegistering ? 'CREAR CUENTA' : 'ENTRAR AL REINO'}
              </Button>

              <button
                type="button"
                onClick={() => setIsRegistering(!isRegistering)}
                className="w-full text-[10px] font-black text-white/40 hover:text-white uppercase tracking-widest transition-colors py-2"
              >
                {isRegistering ? '¿YA TIENES CUENTA? ENTRAR' : '¿NUEVO AQUÍ? REGÍSTRATE'}
              </button>
            </div>
          </form>
        )}
      </motion.div>

      {/* Aesthetic Vignette */}
      <div className="absolute inset-0 pointer-events-none z-20 shadow-[inset_0_0_150px_rgba(0,0,0,0.8)]" />
    </div>
  );
}
