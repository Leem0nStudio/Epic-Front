'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

type NotificationType = 'success' | 'error' | 'info' | 'reward';

interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
}

interface NotificationContextType {
    notify: (type: NotificationType, title: string, message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const notify = (type: NotificationType, title: string, message: string) => {
        const id = Math.random().toString(36).substring(7);
        setNotifications(prev => [...prev, { id, type, title, message }]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 4000);
    };

    return (
        <NotificationContext.Provider value={{ notify }}>
            {children}
            <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-3 w-full max-w-xs pointer-events-none">
                <AnimatePresence>
                    {notifications.map(n => (
                        <motion.div
                            key={n.id}
                            initial={{ opacity: 0, y: -20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className={`bg-[#0B1A2A]/90 backdrop-blur-xl border border-white/10 p-4 rounded-[24px] shadow-2xl flex items-start gap-4 pointer-events-auto ${
                                n.type === 'reward' ? 'border-[#F5C76B]/40 bg-[#F5C76B]/5' : ''
                            }`}
                        >
                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${
                                n.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                                n.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                                n.type === 'reward' ? 'bg-[#F5C76B]/10 border-[#F5C76B]/20 text-[#F5C76B]' :
                                'bg-blue-500/10 border-blue-500/20 text-blue-400'
                            }`}>
                                {n.type === 'success' && <CheckCircle2 size={20} />}
                                {n.type === 'error' && <AlertTriangle size={20} />}
                                {n.type === 'reward' && <Sparkles size={20} />}
                                {n.type === 'info' && <Info size={20} />}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">{n.title}</span>
                                <span className="text-[9px] text-white/40 uppercase tracking-tight font-bold mt-0.5 leading-relaxed">{n.message}</span>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    const context = useContext(NotificationContext);
    if (!context) throw new Error("useNotification must be used within a NotificationProvider");
    return context;
}
