'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Mail, Lock, UserPlus, LogIn, ShieldCheck, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
    <div className="flex flex-col items-center justify-center h-full p-4 w-full max-w-sm relative">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full bg-[#0B1A2A] border border-white/10 rounded-[40px] shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden relative z-10"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none"></div>

        <div className="p-10 text-center relative z-10">
           <div className="w-24 h-24 bg-black/40 border border-[#F5C76B]/20 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl relative group overflow-hidden">
              <div className="absolute inset-0 bg-[#F5C76B]/5 group-hover:bg-[#F5C76B]/10 transition-colors" />
              <ShieldCheck size={48} className="text-[#F5C76B] drop-shadow-[0_0_15px_rgba(245,199,107,0.4)]" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border border-dashed border-[#F5C76B]/10 rounded-full scale-110"
              />
           </div>
           <h1 className="text-3xl font-black text-white tracking-[0.2em] uppercase italic drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
             Project: Etherea
           </h1>
           <div className="flex items-center justify-center gap-2 mt-4">
              <div className="h-[1px] w-8 bg-white/10" />
              <span className="text-[10px] text-white/40 font-black uppercase tracking-[0.3em]">Guardian Access</span>
              <div className="h-[1px] w-8 bg-white/10" />
           </div>
        </div>

        <div className="px-10 pb-10 relative z-10">
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8"
              >
                <Sparkles size={48} className="text-[#F5C76B] mx-auto mb-6" />
                <div className="text-white font-black uppercase tracking-widest text-lg mb-2 italic">Inscripción Completada</div>
                <p className="text-white/40 text-[10px] uppercase font-bold leading-relaxed tracking-wider">
                  Verifica tu correo electrónico para sellar el pacto y poder entrar al reino.
                </p>
                <button
                  onClick={() => { setIsRegistering(false); setSuccess(false); }}
                  className="mt-8 w-full py-4 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all"
                >
                  Regresar al Portal
                </button>
              </motion.div>
            ) : (
              <motion.form
                key={isRegistering ? 'reg' : 'log'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleAuth}
                className="space-y-6"
              >
                {error && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-[9px] text-red-400 font-black uppercase text-center tracking-tight"
                  >
                    {error}
                  </motion.div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-2">Firma de Aventurero (Email)</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-black/40 border border-white/5 rounded-2xl px-12 py-4 text-sm text-white placeholder-white/10 focus:border-[#F5C76B]/40 focus:outline-none transition-all font-bold tracking-wider"
                      placeholder="usuario@etherea.app"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-2">Código de Encriptación (Clave)</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full bg-black/40 border border-white/5 rounded-2xl px-12 py-4 text-sm text-white placeholder-white/10 focus:border-[#F5C76B]/40 focus:outline-none transition-all font-bold tracking-wider"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 bg-gradient-to-r from-[#F5C76B] to-[#b88c3a] text-black font-black uppercase tracking-[0.2em] rounded-2xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(245,199,107,0.2)]"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      {isRegistering ? <UserPlus size={20} /> : <LogIn size={20} />}
                      <span>{isRegistering ? 'Forjar Perfil' : 'Entrar al Reino'}</span>
                    </>
                  )}
                </button>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => setIsRegistering(!isRegistering)}
                    className="text-[10px] font-black text-white/20 hover:text-white transition-colors uppercase tracking-widest"
                  >
                    {isRegistering ? '¿Ya eres un Guardián? Conectarse' : '¿Nuevo Aventurero? Crear Cuenta'}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
