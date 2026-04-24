'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Mail, Lock, UserPlus, LogIn, ShieldCheck } from 'lucide-react';
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
    <div className="flex flex-col items-center justify-center h-full p-4 animate-in fade-in duration-500 w-full max-w-sm">
      <div className="w-full bg-[#1a110a] border-2 border-[#5a4227] rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-wood.png')] opacity-40 pointer-events-none"></div>
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#c79a5d] to-transparent"></div>

        <div className="bg-gradient-to-b from-[#382618] to-[#1a110a] p-8 border-b border-[#382618] text-center relative z-10">
           <div className="w-20 h-20 bg-[#0d0805] border-2 border-[#c79a5d] rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-2xl relative group">
              <ShieldCheck size={40} className="text-[#c79a5d] group-hover:scale-110 transition-transform" />
              <div className="absolute inset-0 animate-gold-sparkle pointer-events-none opacity-20">
                <div className="absolute top-0 right-0 w-2 h-2 bg-[#c79a5d] rounded-full blur-[2px]" />
                <div className="absolute bottom-0 left-0 w-2 h-2 bg-[#c79a5d] rounded-full blur-[2px]" />
              </div>
           </div>
           <h1 className="text-2xl font-serif font-black text-[#eacf9b] tracking-[0.2em] uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
             Etherea RPG
           </h1>
           <p className="text-[10px] text-[#a68a68] font-black uppercase tracking-widest mt-2 bg-black/40 inline-block px-3 py-1 rounded-full border border-[#382618]">Portal de Acceso</p>
        </div>

        <div className="p-8 relative z-10">
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8"
              >
                <div className="text-[#c79a5d] mb-4 font-black uppercase tracking-widest text-sm">¡Inscripción Completa!</div>
                <p className="text-[#a68a68] text-[10px] uppercase font-bold leading-relaxed">
                  Verifica tu correo electrónico para sellar el pacto y poder entrar al reino.
                </p>
                <button
                  onClick={() => { setIsRegistering(false); setSuccess(false); }}
                  className="mt-8 w-full py-4 bg-gradient-to-b from-[#c79a5d] to-[#8c5a2b] text-[#1a110a] font-black uppercase tracking-widest rounded-lg hover:brightness-110 active:scale-95 transition-all shadow-xl"
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
                  <div className="bg-red-900/20 border border-red-500/50 p-3 rounded-lg text-[9px] text-red-400 font-black uppercase text-center tracking-tight">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-[#a68a68] uppercase tracking-[0.2em] ml-1">Firma Digital (Email)</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#382618]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-black/60 border-2 border-[#382618] rounded-xl px-11 py-4 text-sm text-[#eacf9b] placeholder-[#382618] focus:border-[#c79a5d] focus:outline-none transition-colors font-bold"
                      placeholder="aventurero@etherea.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black text-[#a68a68] uppercase tracking-[0.2em] ml-1">Clave de Bóveda</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#382618]" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full bg-black/60 border-2 border-[#382618] rounded-xl px-11 py-4 text-sm text-[#eacf9b] placeholder-[#382618] focus:border-[#c79a5d] focus:outline-none transition-colors font-bold"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-b from-[#c79a5d] to-[#8c5a2b] text-[#1a110a] font-black uppercase tracking-[0.2em] rounded-xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 shadow-[0_4px_20px_rgba(199,154,93,0.3)]"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-4 border-[#1a110a] border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      {isRegistering ? <UserPlus size={20} /> : <LogIn size={20} />}
                      <span>{isRegistering ? 'Unirse al Gremio' : 'Entrar al Reino'}</span>
                    </>
                  )}
                </button>

                <div className="pt-4 text-center">
                  <button
                    type="button"
                    onClick={() => setIsRegistering(!isRegistering)}
                    className="text-[9px] font-black text-[#a68a68] hover:text-[#eacf9b] uppercase tracking-[0.2em] transition-colors"
                  >
                    {isRegistering ? '¿Ya posees una cuenta? Conectarse' : '¿Nuevo en el reino? Crear Perfil'}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
