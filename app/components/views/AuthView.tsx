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
    <div className="flex flex-col items-center justify-center h-full p-4 animate-in fade-in duration-500">
      <div className="w-full max-w-sm bg-[#1a110a] border-2 border-[#c79a5d] rounded-[4px] shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-wood.png')] opacity-40 pointer-events-none"></div>

        {/* Header */}
        <div className="bg-gradient-to-r from-[#2c1d11] via-[#4a2e1a] to-[#2c1d11] p-6 border-b border-[#c79a5d] text-center relative z-10">
           <div className="w-16 h-16 bg-[#1a110a] border-2 border-[#eacf9b] rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
              <ShieldCheck size={32} className="text-[#eacf9b]" />
           </div>
           <h1 className="text-2xl font-serif font-black text-[#eacf9b] tracking-[0.2em] uppercase text-stroke-sm">
             REINO DE ETHEREA
           </h1>
           <p className="text-[10px] text-[#a68a68] font-bold uppercase tracking-widest mt-1">Acceso al Servidor</p>
        </div>

        <div className="p-6 relative z-10">
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8"
              >
                <div className="text-[#44ffaa] mb-4 font-bold uppercase tracking-widest">¡Registro Exitoso!</div>
                <p className="text-[#a68a68] text-xs leading-relaxed">
                  Se ha enviado un correo de confirmación. Por favor verifica tu bandeja de entrada antes de iniciar sesión.
                </p>
                <button
                  onClick={() => { setIsRegistering(false); setSuccess(false); }}
                  className="mt-6 w-full py-3 bg-[#c79a5d] text-[#1a110a] font-bold uppercase tracking-widest rounded hover:brightness-110 active:scale-95 transition-all"
                >
                  Ir al Login
                </button>
              </motion.div>
            ) : (
              <motion.form
                key={isRegistering ? 'reg' : 'log'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleAuth}
                className="space-y-4"
              >
                {error && (
                  <div className="bg-red-900/20 border border-red-500/50 p-3 rounded text-[10px] text-red-400 font-bold uppercase text-center">
                    {error}
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#a68a68] uppercase tracking-widest ml-1">Correo Electrónico</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5a4227]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-black/40 border border-[#382618] rounded px-10 py-3 text-sm text-[#eacf9b] placeholder-[#382618] focus:border-[#c79a5d] focus:outline-none transition-colors"
                      placeholder="nombre@ejemplo.com"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#a68a68] uppercase tracking-widest ml-1">Contraseña</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5a4227]" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full bg-black/40 border border-[#382618] rounded px-10 py-3 text-sm text-[#eacf9b] placeholder-[#382618] focus:border-[#c79a5d] focus:outline-none transition-colors"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-b from-[#c79a5d] to-[#8b6131] text-[#1a110a] font-black uppercase tracking-[0.2em] rounded border-b-4 border-[#5a4227] hover:brightness-110 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-[#1a110a] border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      {isRegistering ? <UserPlus size={18} /> : <LogIn size={18} />}
                      {isRegistering ? 'REGISTRARSE' : 'ENTRAR AL JUEGO'}
                    </>
                  )}
                </button>

                <div className="pt-4 text-center">
                  <button
                    type="button"
                    onClick={() => setIsRegistering(!isRegistering)}
                    className="text-[10px] font-bold text-[#a68a68] hover:text-[#eacf9b] uppercase tracking-widest transition-colors"
                  >
                    {isRegistering ? '¿Ya tienes cuenta? Inicia Sesión' : '¿Nuevo aventurero? Regístrate aquí'}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer / version */}
      <p className="mt-8 text-[9px] font-mono text-[#382618] uppercase tracking-[0.5em]">v1.0.0 Stable Build</p>
    </div>
  );
}
